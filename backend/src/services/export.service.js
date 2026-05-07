const prisma = require('../lib/prisma');

function average(numbers) {
  if (!numbers || numbers.length === 0) return 0;

  const total = numbers.reduce((sum, n) => sum + Number(n || 0), 0);

  return Number((total / numbers.length).toFixed(1));
}

class ExportService {
  async exportReport(userId, requestUser) {
    const requestRole = requestUser?.role;
    const requestUserId = requestUser?.userId;
    const requestManagerId = requestUser?.managerId || null;

    const user = await prisma.users.findUnique({
      where: {
        id: Number(userId),
      },
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

    const isSelf = Number(requestUserId) === Number(userId);

    // EMPLOYEE
    if (requestRole === 'EMPLOYEE' && !isSelf) {
      const error = new Error('Sem permissão.');
      error.statusCode = 403;
      throw error;
    }

    // MANAGER
    if (requestRole === 'MANAGER' && !isSelf) {
      const employee = user.employees;

      if (!employee || employee.managerId !== requestManagerId) {
        const error = new Error('Sem permissão.');
        error.statusCode = 403;
        throw error;
      }
    }

    let responses = [];

    // colaborador
    if (user.employees) {
      responses = await prisma.responses.findMany({
        where: {
          targetEmployeeId: user.employees.id,
        },
        include: {
          competencies: true,
          evaluations: true,
        },
      });
    }

    // gestor
    if (user.managers) {
      responses = await prisma.responses.findMany({
        where: {
          targetManagerId: user.managers.id,
        },
        include: {
          competencies: true,
          evaluations: true,
        },
      });
    }

    return {
      usuario: {
        id: user.id,
        nome: user.employees?.name || user.managers?.name,
        email: user.employees?.email || user.managers?.email,
      },

      avaliacoes: {
        total: responses.length,
        media: average(responses.map((r) => r.score)),
      },

      respostas: responses.map((response) => ({
        competency: response.competencies?.name,
        score: response.score,
        observation: response.observation,
        evaluationId: response.evaluationId,
      })),
    };
  }
}

module.exports = new ExportService();
