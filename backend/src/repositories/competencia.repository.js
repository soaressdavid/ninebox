const prisma = require('../lib/prisma');

function mapearCompetencia(row) {
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
    ativo: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function findAll({ competenciaDe, search }) {
  const rows = await prisma.competencies.findMany({
    where: {
      ...(competenciaDe ? { audience: competenciaDe } : {}),
      ...(search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {}),
    },
    orderBy: {
      name: 'asc',
    },
  });

  return rows.map(mapearCompetencia);
}

async function findById(id) {
  const row = await prisma.competencies.findUnique({
    where: {
      id: Number(id),
    },
  });

  return row ? mapearCompetencia(row) : null;
}

async function findByNomeAndPublico(competencia, competenciaDe) {
  const row = await prisma.competencies.findFirst({
    where: {
      name: competencia,
      audience: competenciaDe,
    },
  });

  return row ? mapearCompetencia(row) : null;
}

async function create({
  competencia,
  competenciaDe,
  tipo,
  descricao,
  criterio1,
  criterio2,
  criterio3,
  criterio4,
}) {
  const row = await prisma.competencies.create({
    data: {
      name: competencia,
      audience: competenciaDe,
      type: tipo,
      description: descricao,
      levelIdeal: criterio1,
      levelGood: criterio2,
      levelAverage: criterio3,
      levelNeedsImprovement: criterio4,
      active: true,
    },
  });

  return mapearCompetencia(row);
}

async function update(
  id,
  {
    competencia,
    competenciaDe,
    tipo,
    descricao,
    criterio1,
    criterio2,
    criterio3,
    criterio4,
  }
) {
  const row = await prisma.competencies.update({
    where: {
      id: Number(id),
    },
    data: {
      name: competencia,
      audience: competenciaDe,
      type: tipo,
      description: descricao,
      levelIdeal: criterio1,
      levelGood: criterio2,
      levelAverage: criterio3,
      levelNeedsImprovement: criterio4,
    },
  });

  return mapearCompetencia(row);
}

async function deleteById(id) {
  await prisma.competencies.delete({
    where: {
      id: Number(id),
    },
  });

  return true;
}

async function findByAvaliacaoColaboradores(idAvaliacao) {
  const rows = await prisma.evaluation_competencies.findMany({
    where: {
      evaluationId: Number(idAvaliacao),
      audience: 'EMPLOYEE',
    },
    include: {
      competencies: true,
    },
    orderBy: {
      competencies: {
        name: 'asc',
      },
    },
  });

  return rows.map((item) => mapearCompetencia(item.competencies));
}

async function findByAvaliacaoGestor(idAvaliacao) {
  const rows = await prisma.evaluation_competencies.findMany({
    where: {
      evaluationId: Number(idAvaliacao),
      audience: 'MANAGER',
    },
    include: {
      competencies: true,
    },
    orderBy: {
      competencies: {
        name: 'asc',
      },
    },
  });

  return rows.map((item) => mapearCompetencia(item.competencies));
}

async function findByIdsAndPublico(ids, competenciaDe) {
  if (!ids || ids.length === 0) {
    return [];
  }

  const rows = await prisma.competencies.findMany({
    where: {
      id: {
        in: ids.map(Number),
      },
      audience: competenciaDe,
    },
  });

  return rows.map(mapearCompetencia);
}

module.exports = {
  findAll,
  findById,
  findByNomeAndPublico,
  create,
  update,
  deleteById,
  findByAvaliacaoColaboradores,
  findByAvaliacaoGestor,
  findByIdsAndPublico,
};