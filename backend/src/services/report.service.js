const prisma = require('../lib/prisma');

function toDateString(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function average(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const total = numbers.reduce((sum, n) => sum + Number(n || 0), 0);
  return Number((total / numbers.length).toFixed(1));
}

function monthLabel(date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    month: 'short',
    year: '2-digit',
  });
}

function buildEvolutionFromResponses(responses) {
  const grouped = {};

  for (const response of responses) {
    const key = monthLabel(response.submittedAt);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(Number(response.score));
  }

  return Object.entries(grouped).map(([mes, notas]) => ({
    mes,
    media: average(notas),
  }));
}

function buildLatestResponses(responses, limit = 5) {
  return [...responses]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, limit)
    .map((response) => ({
      id: response.id,
      evaluationId: response.evaluationId,
      competencyId: response.competencyId,
      score: response.score,
      observation: response.observation,
      submittedAt: toDateString(response.submittedAt),
    }));
}

class ReportService {
  async getDashboard(requestUser) {
    const role = requestUser?.role;
    const managerId = requestUser?.managerId || null;

    if (!['MANAGER', 'ADMIN'].includes(role)) {
      const error = new Error('Você não tem permissão para acessar o dashboard.');
      error.statusCode = 403;
      throw error;
    }

    const [
      totalUsers,
      totalManagers,
      totalEmployees,
      evaluations,
      competencies,
      responses,
    ] = await Promise.all([
      prisma.users.count(),
      prisma.managers.count(),
      prisma.employees.count(),
      prisma.evaluations.findMany({
        ...(role === 'MANAGER' && managerId
          ? { where: { managerId } }
          : {}),
        select: {
          id: true,
          type: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.competencies.findMany({
        select: {
          id: true,
          type: true,
          audience: true,
          active: true,
        },
      }),
      prisma.responses.findMany({
        ...(role === 'MANAGER' && managerId
          ? {
              where: {
                OR: [
                  { responderManagerId: managerId },
                  { targetManagerId: managerId },
                ],
              },
            }
          : {}),
        select: {
          score: true,
          submittedAt: true,
        },
      }),
    ]);

    const evaluationsByType = {};
    for (const evaluation of evaluations) {
      const key = evaluation.type || 'unknown';
      evaluationsByType[key] = (evaluationsByType[key] || 0) + 1;
    }

    const competenciesByType = {};
    for (const competency of competencies) {
      const key = competency.type || 'unknown';
      competenciesByType[key] = (competenciesByType[key] || 0) + 1;
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return {
      usuarios: {
        total: totalUsers,
        gestores: totalManagers,
        colaboradores: totalEmployees,
      },
      avaliacoes: {
        total: evaluations.length,
        porTipo: evaluationsByType,
        mediaGeral: average(responses.map((r) => r.score)),
        ultimaSemana: responses.filter(
          (r) => new Date(r.submittedAt) >= oneWeekAgo
        ).length,
      },
      nineBox: {
        total: 0,
        distribuicao: {},
        observacao: 'Nine Box ainda não foi implementado no schema atual.',
      },
      competencias: {
        total: competencies.length,
        porTipo: competenciesByType,
      },
    };
  }

  async getUserReport(userId, requestUser) {
    const user = await prisma.users.findUnique({
      where: { id: Number(userId) || userId },
      include: {
        employees: true,
        managers: true,
      },
    });

    if (!user) {
      const error = new Error('Usuário não encontrado.');
      error.statusCode = 404;
      throw error;
    }

    const requestRole = requestUser?.role;
    const requestUserId = requestUser?.userId;
    const requestManagerId = requestUser?.managerId || null;

    const isSelf = String(requestUserId) === String(user.id);

    if (requestRole === 'EMPLOYEE' && !isSelf) {
      const error = new Error('Você não tem permissão para ver este relatório.');
      error.statusCode = 403;
      throw error;
    }

    if (requestRole === 'MANAGER' && !isSelf) {
      const targetEmployee = user.employees;

      if (!targetEmployee || targetEmployee.managerId !== requestManagerId) {
        const error = new Error('Você não tem permissão para ver este relatório.');
        error.statusCode = 403;
        throw error;
      }
    }

    const isManagerProfile = !!user.managers;
    const isEmployeeProfile = !!user.employees;

    let receivedResponses = [];
    let targetProfile = null;

    if (isManagerProfile) {
      targetProfile = user.managers;

      receivedResponses = await prisma.responses.findMany({
        where: {
          targetManagerId: targetProfile.id,
        },
        include: {
          competencies: true,
          evaluations: true,
        },
        orderBy: {
          submittedAt: 'desc',
        },
      });
    } else if (isEmployeeProfile) {
      targetProfile = user.employees;

      receivedResponses = await prisma.responses.findMany({
        where: {
          targetEmployeeId: targetProfile.id,
        },
        include: {
          competencies: true,
          evaluations: true,
        },
        orderBy: {
          submittedAt: 'desc',
        },
      });
    } else {
      const error = new Error('Usuário sem perfil de gestor ou colaborador.');
      error.statusCode = 400;
      throw error;
    }

    const scores = receivedResponses.map((r) => Number(r.score));
    const criteriaGroups = {};

    for (const response of receivedResponses) {
      const key = response.competencies?.type || 'unknown';
      if (!criteriaGroups[key]) criteriaGroups[key] = [];
      criteriaGroups[key].push(Number(response.score));
    }

    const criterios = {};
    for (const [tipo, notas] of Object.entries(criteriaGroups)) {
      criterios[tipo] = average(notas);
    }

    return {
      usuario: {
        id: user.id,
        nome: targetProfile.name,
        email: targetProfile.email,
        tipo: isManagerProfile ? 'MANAGER' : 'EMPLOYEE',
        registrationId: targetProfile.registrationId,
        empresa: targetProfile.company,
      },
      avaliacoes: {
        total: receivedResponses.length,
        mediaGeral: average(scores),
        criterios,
        evolucao: buildEvolutionFromResponses(receivedResponses),
        ultimas: buildLatestResponses(receivedResponses),
      },
      nineBox: {
        ultima: null,
        historico: [],
        observacao: 'Nine Box ainda não foi implementado no schema atual.',
      },
      competencias: {
        avaliadas: new Set(receivedResponses.map((r) => r.competencyId)).size,
        mediaGeral: average(scores),
        porTipo: criterios,
      },
    };
  }

  async getTeamReport(gestorId, requestUser) {
    const requestRole = requestUser?.role;
    const requestManagerId = requestUser?.managerId || null;

    if (!['MANAGER', 'ADMIN'].includes(requestRole)) {
      const error = new Error('Você não tem permissão para ver este relatório.');
      error.statusCode = 403;
      throw error;
    }

    if (requestRole === 'MANAGER' && Number(gestorId) !== Number(requestManagerId)) {
      const error = new Error('Você só pode ver o relatório da sua própria equipe.');
      error.statusCode = 403;
      throw error;
    }

    const manager = await prisma.managers.findUnique({
      where: { id: Number(gestorId) },
    });

    if (!manager) {
      const error = new Error('Gestor não encontrado.');
      error.statusCode = 404;
      throw error;
    }

    const employees = await prisma.employees.findMany({
      where: {
        managerId: manager.id,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const team = [];

    for (const employee of employees) {
      const responses = await prisma.responses.findMany({
        where: {
          targetEmployeeId: employee.id,
        },
        orderBy: {
          submittedAt: 'desc',
        },
      });

      team.push({
        colaborador: {
          id: employee.id,
          nome: employee.name,
          email: employee.email,
          registrationId: employee.registrationId,
          empresa: employee.company,
        },
        mediaAvaliacoes: average(responses.map((r) => r.score)),
        totalAvaliacoes: responses.length,
        ultimaAvaliacao: responses[0] ? toDateString(responses[0].submittedAt) : null,
        nineBox: null,
      });
    }

    return {
      gestor: {
        id: manager.id,
        nome: manager.name,
        email: manager.email,
        registrationId: manager.registrationId,
        empresa: manager.company,
      },
      equipe: team,
      estatisticas: {
        mediaEquipe: average(team.map((item) => item.mediaAvaliacoes)),
        totalColaboradores: team.length,
        distribuicaoNineBox: {},
        observacao: 'Nine Box ainda não foi implementado no schema atual.',
      },
    };
  }
}

module.exports = new ReportService();