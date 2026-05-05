require('dotenv/config');

const prisma = require('../src/lib/prisma');

async function main() {
  const managerRegistrationId = 'RA1001'; // troque se necessário

  const manager = await prisma.managers.findUnique({
    where: {
      registrationId: managerRegistrationId,
    },
  });

  if (!manager) {
    throw new Error(`Gestor com registrationId ${managerRegistrationId} não encontrado.`);
  }

  console.log('Gestor encontrado:', {
    id: manager.id,
    name: manager.name,
    registrationId: manager.registrationId,
  });

  const employeeEmail = 'colaborador.teste@ninebox.com';
  const employeeRegistrationId = 'RA2001';

  // 1. garante usuário do colaborador
  let employeeUser = await prisma.users.findUnique({
    where: { email: employeeEmail },
  });

  if (!employeeUser) {
    employeeUser = await prisma.users.create({
      data: {
        email: employeeEmail,
        password: '123456',
        role: 'EMPLOYEE',
        active: true,
      },
    });
    console.log('Usuário do colaborador criado.');
  } else {
    console.log('Usuário do colaborador já existia.');
  }

  // 2. garante colaborador
  let employee = await prisma.employees.findUnique({
    where: {
      registrationId: employeeRegistrationId,
    },
  });

  if (!employee) {
    employee = await prisma.employees.create({
      data: {
        userId: employeeUser.id,
        managerId: manager.id,
        name: 'Colaborador Teste',
        email: employeeEmail,
        registrationId: employeeRegistrationId,
        company: manager.company,
        active: true,
      },
    });
    console.log('Colaborador criado.');
  } else {
    console.log('Colaborador já existia.');
  }

  console.log('Colaborador:', {
    id: employee.id,
    name: employee.name,
    registrationId: employee.registrationId,
  });

  // 3. garante competências MANAGER
  let managerCompetency1 = await prisma.competencies.findFirst({
    where: {
      name: 'Liderança',
      audience: 'MANAGER',
    },
  });

  if (!managerCompetency1) {
    managerCompetency1 = await prisma.competencies.create({
      data: {
        name: 'Liderança',
        type: 'Behavioral',
        audience: 'MANAGER',
        description: 'Avalia a capacidade de liderança do gestor.',
        levelIdeal: 'Lidera com clareza, inspira e acompanha o time.',
        levelGood: 'Lidera bem e orienta o time.',
        levelAverage: 'Liderança razoável, com pontos a melhorar.',
        levelNeedsImprovement: 'Precisa evoluir bastante em liderança.',
        active: true,
      },
    });
  }

  let managerCompetency2 = await prisma.competencies.findFirst({
    where: {
      name: 'Feedback',
      audience: 'MANAGER',
    },
  });

  if (!managerCompetency2) {
    managerCompetency2 = await prisma.competencies.create({
      data: {
        name: 'Feedback',
        type: 'Behavioral',
        audience: 'MANAGER',
        description: 'Avalia a qualidade do feedback dado pelo gestor.',
        levelIdeal: 'Oferece feedback contínuo, claro e construtivo.',
        levelGood: 'Oferece bons feedbacks com regularidade.',
        levelAverage: 'Feedbacks ocasionais e pouco detalhados.',
        levelNeedsImprovement: 'Quase não oferece feedback útil.',
        active: true,
      },
    });
  }

  // 4. garante competências EMPLOYEE
  let employeeCompetency1 = await prisma.competencies.findFirst({
    where: {
      name: 'Entrega',
      audience: 'EMPLOYEE',
    },
  });

  if (!employeeCompetency1) {
    employeeCompetency1 = await prisma.competencies.create({
      data: {
        name: 'Entrega',
        type: 'Performance',
        audience: 'EMPLOYEE',
        description: 'Avalia a qualidade e consistência das entregas.',
        levelIdeal: 'Entrega com alta qualidade e autonomia.',
        levelGood: 'Entrega bem e dentro do esperado.',
        levelAverage: 'Entrega com oscilação de qualidade.',
        levelNeedsImprovement: 'Precisa evoluir muito em entregas.',
        active: true,
      },
    });
  }

  let employeeCompetency2 = await prisma.competencies.findFirst({
    where: {
      name: 'Comunicação',
      audience: 'EMPLOYEE',
    },
  });

  if (!employeeCompetency2) {
    employeeCompetency2 = await prisma.competencies.create({
      data: {
        name: 'Comunicação',
        type: 'Behavioral',
        audience: 'EMPLOYEE',
        description: 'Avalia a comunicação do colaborador.',
        levelIdeal: 'Comunicação clara, objetiva e proativa.',
        levelGood: 'Se comunica bem no dia a dia.',
        levelAverage: 'Comunicação razoável, com ruídos.',
        levelNeedsImprovement: 'Precisa melhorar bastante a comunicação.',
        active: true,
      },
    });
  }

  console.log('Competências garantidas.');

  // 5. garante avaliação
  let evaluation = await prisma.evaluations.findFirst({
    where: {
      managerId: manager.id,
      name: 'Avaliação 180 - Teste',
    },
  });

  if (!evaluation) {
    evaluation = await prisma.evaluations.create({
      data: {
        managerId: manager.id,
        name: 'Avaliação 180 - Teste',
        type: '180',
        status: 'pending',
        company: manager.company,
        startDate: new Date('2026-05-01T00:00:00.000Z'),
        endDate: new Date('2026-05-31T23:59:59.000Z'),
        description: 'Avaliação 180 criada para testes do fluxo.',
        closingText: 'Obrigado por responder a avaliação.',
      },
    });
    console.log('Avaliação criada.');
  } else {
    console.log('Avaliação já existia.');
  }

  console.log('Avaliação:', {
    id: evaluation.id,
    name: evaluation.name,
  });

  // 6. garante participante
  const participant = await prisma.evaluation_participants.findFirst({
    where: {
      evaluationId: evaluation.id,
      employeeId: employee.id,
    },
  });

  if (!participant) {
    await prisma.evaluation_participants.create({
      data: {
        evaluationId: evaluation.id,
        employeeId: employee.id,
      },
    });
    console.log('Participante vinculado à avaliação.');
  } else {
    console.log('Participante já estava vinculado à avaliação.');
  }

  // 7. garante competências vinculadas à avaliação
  const competencyLinks = [
    {
      evaluationId: evaluation.id,
      competencyId: managerCompetency1.id,
      audience: 'MANAGER',
    },
    {
      evaluationId: evaluation.id,
      competencyId: managerCompetency2.id,
      audience: 'MANAGER',
    },
    {
      evaluationId: evaluation.id,
      competencyId: employeeCompetency1.id,
      audience: 'EMPLOYEE',
    },
    {
      evaluationId: evaluation.id,
      competencyId: employeeCompetency2.id,
      audience: 'EMPLOYEE',
    },
  ];

  for (const link of competencyLinks) {
    const exists = await prisma.evaluation_competencies.findFirst({
      where: {
        evaluationId: link.evaluationId,
        competencyId: link.competencyId,
        audience: link.audience,
      },
    });

    if (!exists) {
      await prisma.evaluation_competencies.create({
        data: link,
      });
    }
  }

  console.log('Competências vinculadas à avaliação.');

  console.log('\n=== DADOS PARA TESTE ===');
  console.log('Gestor:');
  console.log({
    registrationId: manager.registrationId,
    email: manager.email,
  });

  console.log('\nColaborador:');
  console.log({
    registrationId: employee.registrationId,
    email: employee.email,
    password: '123456',
  });

  console.log('\nAvaliação:');
  console.log({
    evaluationId: evaluation.id,
  });
}

main()
  .catch((error) => {
    console.error('Erro ao criar dados de teste:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });