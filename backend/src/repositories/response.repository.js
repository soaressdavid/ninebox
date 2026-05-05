const prisma = require('../lib/prisma');

async function findEmployeeByRegistrationId(registrationId) {
  return prisma.employees.findUnique({
    where: { registrationId },
    include: {
      managers: true,
    },
  });
}

async function findManagerByRegistrationId(registrationId) {
  return prisma.managers.findUnique({
    where: { registrationId },
  });
}

async function findEvaluationForEmployee(evaluationId, employeeId) {
  return prisma.evaluations.findFirst({
    where: {
      id: Number(evaluationId),
      evaluation_participants: {
        some: { employeeId },
      },
    },
    include: {
      managers: true,
      evaluation_competencies: {
        where: { audience: 'MANAGER' },
        include: {
          competencies: true,
        },
      },
    },
  });
}

async function findEvaluationForManager(evaluationId, managerId) {
  return prisma.evaluations.findFirst({
    where: {
      id: Number(evaluationId),
      managerId,
    },
    include: {
      managers: true,
      evaluation_participants: {
        include: {
          employees: true,
        },
      },
      evaluation_competencies: {
        where: { audience: 'EMPLOYEE' },
        include: {
          competencies: true,
        },
      },
    },
  });
}

async function countEmployeeResponses(evaluationId, employeeId, managerId) {
  return prisma.responses.count({
    where: {
      evaluationId: Number(evaluationId),
      responderType: 'EMPLOYEE',
      targetType: 'MANAGER',
      responderEmployeeId: employeeId,
      targetManagerId: managerId,
    },
  });
}

async function countManagerResponses(evaluationId, managerId) {
  return prisma.responses.count({
    where: {
      evaluationId: Number(evaluationId),
      responderType: 'MANAGER',
      targetType: 'EMPLOYEE',
      responderManagerId: managerId,
    },
  });
}

async function findPendingEmployeeEvaluations(employeeId) {
  const evaluations = await prisma.evaluations.findMany({
    where: {
      evaluation_participants: {
        some: { employeeId },
      },
    },
    include: {
      managers: true,
      evaluation_competencies: {
        where: { audience: 'MANAGER' },
      },
    },
    orderBy: {
      id: 'desc',
    },
  });

  const pending = [];

  for (const evaluation of evaluations) {
    const totalCompetencies = evaluation.evaluation_competencies.length;

    if (totalCompetencies === 0) continue;

    const answered = await prisma.responses.count({
      where: {
        evaluationId: evaluation.id,
        responderType: 'EMPLOYEE',
        targetType: 'MANAGER',
        responderEmployeeId: employeeId,
        targetManagerId: evaluation.managerId,
      },
    });

    if (answered < totalCompetencies) {
      pending.push({
        id: evaluation.id,
        name: evaluation.name,
        company: evaluation.company,
        startDate: evaluation.startDate,
        endDate: evaluation.endDate,
        manager: {
          id: evaluation.managers.id,
          name: evaluation.managers.name,
          registrationId: evaluation.managers.registrationId,
          email: evaluation.managers.email,
        },
      });
    }
  }

  return pending;
}

async function findPendingManagerEvaluations(managerId) {
  const evaluations = await prisma.evaluations.findMany({
    where: {
      managerId,
    },
    include: {
      evaluation_participants: true,
      evaluation_competencies: {
        where: { audience: 'EMPLOYEE' },
      },
    },
    orderBy: {
      id: 'desc',
    },
  });

  const pending = [];

  for (const evaluation of evaluations) {
    const totalEmployees = evaluation.evaluation_participants.length;
    const totalCompetencies = evaluation.evaluation_competencies.length;

    if (totalEmployees === 0 || totalCompetencies === 0) continue;

    const expectedTotal = totalEmployees * totalCompetencies;

    const answered = await prisma.responses.count({
      where: {
        evaluationId: evaluation.id,
        responderType: 'MANAGER',
        targetType: 'EMPLOYEE',
        responderManagerId: managerId,
      },
    });

    if (answered < expectedTotal) {
      pending.push({
        id: evaluation.id,
        name: evaluation.name,
        company: evaluation.company,
        startDate: evaluation.startDate,
        endDate: evaluation.endDate,
        totalEmployees,
        totalCompetencies,
      });
    }
  }

  return pending;
}

async function createEmployeeResponses(evaluationId, employeeId, managerId, answers) {
  return prisma.$transaction(
    answers.map((answer) =>
      prisma.responses.create({
        data: {
          evaluationId: Number(evaluationId),
          competencyId: Number(answer.competencyId),
          responderType: 'EMPLOYEE',
          targetType: 'MANAGER',
          responderEmployeeId: employeeId,
          targetManagerId: managerId,
          score: Number(answer.score),
          observation: answer.observation || null,
        },
      })
    )
  );
}

async function createManagerResponses(evaluationId, managerId, payload) {
  const operations = [];

  for (const employeeAnswer of payload) {
    for (const answer of employeeAnswer.answers) {
      operations.push(
        prisma.responses.create({
          data: {
            evaluationId: Number(evaluationId),
            competencyId: Number(answer.competencyId),
            responderType: 'MANAGER',
            targetType: 'EMPLOYEE',
            responderManagerId: managerId,
            targetEmployeeId: Number(employeeAnswer.employeeId),
            score: Number(answer.score),
            observation: answer.observation || null,
          },
        })
      );
    }
  }

  return prisma.$transaction(operations);
}

module.exports = {
  findEmployeeByRegistrationId,
  findManagerByRegistrationId,
  findEvaluationForEmployee,
  findEvaluationForManager,
  countEmployeeResponses,
  countManagerResponses,
  findPendingEmployeeEvaluations,
  findPendingManagerEvaluations,
  createEmployeeResponses,
  createManagerResponses,
};