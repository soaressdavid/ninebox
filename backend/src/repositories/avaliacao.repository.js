const prisma = require('../lib/prisma');

function mapCompetencia(row) {
  return {
    id: row.id,
    competencia: row.name,
    competenciaDe: row.audience,
    tipo: row.type,
    descricao: row.description,
    criterio1: row.levelIdeal,
    criterio2: row.levelGood,
    criterio3: row.levelAverage,
    criterio4: row.levelNeedsImprovement,
  };
}

function mapAvaliacaoResumo(row) {
  return {
    id: row.id,
    nomeAvaliacao: row.name,
    empresa: row.company,
    dataInicio: row.startDate,
    dataFim: row.endDate,
    descricao: row.description,
    textoFinal: row.closingText,
    status: row.status,
    tipo: row.type,
    gestor: row.managers
      ? {
          id: row.managers.id,
          nome: row.managers.name,
          ra: row.managers.registrationId,
          email: row.managers.email,
        }
      : null,
  };
}

async function create({
  nomeAvaliacao,
  empresa,
  dataInicio,
  dataFim,
  descricao,
  textoFinal,
  raGestor,
  rasAvaliados = [],
  idsCompetenciasColaboradores = [],
  idsCompetenciasGestor = [],
  status = 'pending',
  tipo = '180',
}) {
  const manager = await prisma.managers.findUnique({
    where: {
      registrationId: raGestor,
    },
  });

  if (!manager) {
    throw new Error('Gestor não encontrado.');
  }

  const employees = rasAvaliados.length
    ? await prisma.employees.findMany({
        where: {
          registrationId: {
            in: rasAvaliados,
          },
        },
      })
    : [];

  const evaluation = await prisma.$transaction(async (tx) => {
    const created = await tx.evaluations.create({
      data: {
        managerId: manager.id,
        name: nomeAvaliacao,
        type: tipo,
        status,
        company: empresa,
        startDate: new Date(dataInicio),
        endDate: new Date(dataFim),
        description: descricao,
        closingText: textoFinal || null,
      },
      include: {
        managers: true,
      },
    });

    if (employees.length > 0) {
      await tx.evaluation_participants.createMany({
        data: employees.map((employee) => ({
          evaluationId: created.id,
          employeeId: employee.id,
        })),
      });
    }

    const competenciasPayload = [
      ...idsCompetenciasColaboradores.map((id) => ({
        evaluationId: created.id,
        competencyId: Number(id),
        audience: 'EMPLOYEE',
      })),
      ...idsCompetenciasGestor.map((id) => ({
        evaluationId: created.id,
        competencyId: Number(id),
        audience: 'MANAGER',
      })),
    ];

    if (competenciasPayload.length > 0) {
      await tx.evaluation_competencies.createMany({
        data: competenciasPayload,
      });
    }

    return created;
  });

  return mapAvaliacaoResumo(evaluation);
}

async function findAll(filters = {}) {
  const rows = await prisma.evaluations.findMany({
    where: {
      ...(filters.empresa ? { company: filters.empresa } : {}),
      ...(filters.raGestor
        ? {
            managers: {
              registrationId: filters.raGestor,
            },
          }
        : {}),
    },
    include: {
      managers: true,
    },
    orderBy: {
      id: 'desc',
    },
  });

  return rows.map(mapAvaliacaoResumo);
}

async function findById(id) {
  const row = await prisma.evaluations.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      managers: true,
      evaluation_participants: {
        include: {
          employees: {
            include: {
              managers: true,
            },
          },
        },
      },
      evaluation_competencies: {
        include: {
          competencies: true,
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  const competenciasColaboradores = row.evaluation_competencies
    .filter((item) => item.audience === 'EMPLOYEE')
    .map((item) => mapCompetencia(item.competencies));

  const competenciasGestor = row.evaluation_competencies
    .filter((item) => item.audience === 'MANAGER')
    .map((item) => mapCompetencia(item.competencies));

  const avaliados = row.evaluation_participants.map((item) => ({
    id: item.employees.id,
    nome: item.employees.name,
    ra: item.employees.registrationId,
    empresa: item.employees.company,
    email: item.employees.email,
    ra_gestor: item.employees.managers?.registrationId || null,
    nome_gestor: item.employees.managers?.name || null,
  }));

  return {
    metadados: mapAvaliacaoResumo(row),
    avaliados,
    competenciasColaboradores,
    competenciasGestor,
  };
}

async function update(
  id,
  {
    nomeAvaliacao,
    empresa,
    dataInicio,
    dataFim,
    descricao,
    textoFinal,
    raGestor,
    rasAvaliados,
    idsCompetenciasColaboradores,
    idsCompetenciasGestor,
    status,
    tipo,
  }
) {
  const existing = await prisma.evaluations.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!existing) {
    return null;
  }

  let managerId = existing.managerId;

  if (raGestor) {
    const manager = await prisma.managers.findUnique({
      where: {
        registrationId: raGestor,
      },
    });

    if (!manager) {
      throw new Error('Gestor não encontrado.');
    }

    managerId = manager.id;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const evaluation = await tx.evaluations.update({
      where: {
        id: Number(id),
      },
      data: {
        ...(nomeAvaliacao ? { name: nomeAvaliacao } : {}),
        ...(empresa ? { company: empresa } : {}),
        ...(dataInicio ? { startDate: new Date(dataInicio) } : {}),
        ...(dataFim ? { endDate: new Date(dataFim) } : {}),
        ...(descricao ? { description: descricao } : {}),
        ...(textoFinal !== undefined ? { closingText: textoFinal } : {}),
        ...(status ? { status } : {}),
        ...(tipo ? { type: tipo } : {}),
        managerId,
      },
      include: {
        managers: true,
      },
    });

    if (Array.isArray(rasAvaliados)) {
      await tx.evaluation_participants.deleteMany({
        where: {
          evaluationId: Number(id),
        },
      });

      if (rasAvaliados.length > 0) {
        const employees = await tx.employees.findMany({
          where: {
            registrationId: {
              in: rasAvaliados,
            },
          },
        });

        await tx.evaluation_participants.createMany({
          data: employees.map((employee) => ({
            evaluationId: Number(id),
            employeeId: employee.id,
          })),
        });
      }
    }

    if (
      Array.isArray(idsCompetenciasColaboradores) ||
      Array.isArray(idsCompetenciasGestor)
    ) {
      await tx.evaluation_competencies.deleteMany({
        where: {
          evaluationId: Number(id),
        },
      });

      const payload = [
        ...(Array.isArray(idsCompetenciasColaboradores)
          ? idsCompetenciasColaboradores.map((competencyId) => ({
              evaluationId: Number(id),
              competencyId: Number(competencyId),
              audience: 'EMPLOYEE',
            }))
          : []),
        ...(Array.isArray(idsCompetenciasGestor)
          ? idsCompetenciasGestor.map((competencyId) => ({
              evaluationId: Number(id),
              competencyId: Number(competencyId),
              audience: 'MANAGER',
            }))
          : []),
      ];

      if (payload.length > 0) {
        await tx.evaluation_competencies.createMany({
          data: payload,
        });
      }
    }

    return evaluation;
  });

  return mapAvaliacaoResumo(updated);
}

async function deleteById(id) {
  await prisma.evaluations.delete({
    where: {
      id: Number(id),
    },
  });

  return true;
}

module.exports = {
  create,
  findAll,
  findById,
  update,
  deleteById,
};