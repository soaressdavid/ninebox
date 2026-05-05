const prisma = require('../lib/prisma');

function mapGestor(manager) {
  return {
    id: manager.id,
    nome: manager.name,
    ra: manager.registrationId,
    empresa: manager.company,
    email: manager.email,
    ativo: manager.active,
    userId: manager.userId,
    createdAt: manager.createdAt,
    updatedAt: manager.updatedAt,
  };
}

async function findAll() {
  const rows = await prisma.managers.findMany({
    orderBy: { name: 'asc' },
  });

  return rows.map(mapGestor);
}

async function findByra(ra) {
  const row = await prisma.managers.findUnique({
    where: {
      registrationId: ra,
    },
  });

  return row ? mapGestor(row) : null;
}

async function create({ nome, ra, empresa, email, senha = '123456', ativo = true }) {
  const manager = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        email,
        password: senha,
        role: 'MANAGER',
        active: ativo,
      },
    });

    return tx.managers.create({
      data: {
        userId: user.id,
        name: nome,
        email,
        registrationId: ra,
        company: empresa,
        active: ativo,
      },
    });
  });

  return mapGestor(manager);
}

async function update(ra, { nome, empresa, email, ativo }) {
  const existing = await prisma.managers.findUnique({
    where: {
      registrationId: ra,
    },
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (email || typeof ativo === 'boolean') {
      await tx.users.update({
        where: {
          id: existing.userId,
        },
        data: {
          ...(email ? { email } : {}),
          ...(typeof ativo === 'boolean' ? { active: ativo } : {}),
        },
      });
    }

    return tx.managers.update({
      where: {
        id: existing.id,
      },
      data: {
        ...(nome ? { name: nome } : {}),
        ...(empresa ? { company: empresa } : {}),
        ...(email ? { email } : {}),
        ...(typeof ativo === 'boolean' ? { active: ativo } : {}),
      },
    });
  });

  return mapGestor(updated);
}

module.exports = {
  findAll,
  findByra,
  create,
  update,
};