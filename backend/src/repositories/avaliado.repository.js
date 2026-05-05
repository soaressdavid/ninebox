const prisma = require('../lib/prisma');

function mapAvaliado(employee) {
  return {
    id: employee.id,
    nome: employee.name,
    ra: employee.registrationId,
    empresa: employee.company,
    email: employee.email,
    ra_gestor: employee.managers?.registrationId || null,
    nome_gestor: employee.managers?.name || null,
    ativo: employee.active,
    userId: employee.userId,
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
  };
}

async function findAll() {
  const rows = await prisma.employees.findMany({
    include: {
      managers: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return rows.map(mapAvaliado);
}

async function findByGestorra(raGestor) {
  const manager = await prisma.managers.findUnique({
    where: {
      registrationId: raGestor,
    },
  });

  if (!manager) {
    return [];
  }

  const rows = await prisma.employees.findMany({
    where: {
      managerId: manager.id,
    },
    include: {
      managers: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return rows.map(mapAvaliado);
}

async function findByra(ra) {
  const row = await prisma.employees.findUnique({
    where: {
      registrationId: ra,
    },
    include: {
      managers: true,
    },
  });

  return row ? mapAvaliado(row) : null;
}

async function findByras(ras) {
  if (!ras || ras.length === 0) {
    return [];
  }

  const rows = await prisma.employees.findMany({
    where: {
      registrationId: {
        in: ras,
      },
    },
    include: {
      managers: true,
    },
  });

  return rows.map(mapAvaliado);
}

async function create({
  nome,
  ra,
  empresa,
  ra_gestor,
  email,
  senha = '123456',
  ativo = true,
}) {
  const manager = await prisma.managers.findUnique({
    where: {
      registrationId: ra_gestor,
    },
  });

  if (!manager) {
    throw new Error('Gestor informado não existe.');
  }

  const employee = await prisma.$transaction(async (tx) => {
    const user = await tx.users.create({
      data: {
        email,
        password: senha,
        role: 'EMPLOYEE',
        active: ativo,
      },
    });

    return tx.employees.create({
      data: {
        userId: user.id,
        managerId: manager.id,
        name: nome,
        email,
        registrationId: ra,
        company: empresa,
        active: ativo,
      },
      include: {
        managers: true,
      },
    });
  });

  return mapAvaliado(employee);
}

async function update(ra, { nome, empresa, ra_gestor, email, ativo }) {
  const existing = await prisma.employees.findUnique({
    where: {
      registrationId: ra,
    },
    include: {
      managers: true,
    },
  });

  if (!existing) {
    return null;
  }

  let managerId = existing.managerId;

  if (ra_gestor) {
    const manager = await prisma.managers.findUnique({
      where: {
        registrationId: ra_gestor,
      },
    });

    if (!manager) {
      throw new Error('Gestor informado não existe.');
    }

    managerId = manager.id;
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

    return tx.employees.update({
      where: {
        id: existing.id,
      },
      data: {
        ...(nome ? { name: nome } : {}),
        ...(empresa ? { company: empresa } : {}),
        ...(email ? { email } : {}),
        ...(typeof ativo === 'boolean' ? { active: ativo } : {}),
        managerId,
      },
      include: {
        managers: true,
      },
    });
  });

  return mapAvaliado(updated);
}

async function deleteByra(ra) {
  const existing = await prisma.employees.findUnique({
    where: {
      registrationId: ra,
    },
  });

  if (!existing) {
    return null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.employees.delete({
      where: {
        id: existing.id,
      },
    });

    if (existing.userId) {
      await tx.users.delete({
        where: {
          id: existing.userId,
        },
      });
    }
  });

  return true;
}

module.exports = {
  findAll,
  findByGestorra,
  findByra,
  create,
  update,
  deleteByra,
  findByras,
};