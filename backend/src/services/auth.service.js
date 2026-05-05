const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function normalizeRegistrationId(value) {
  return String(value || '').trim().toUpperCase();
}

function normalizeRole(value) {
  return String(value || '').trim().toUpperCase();
}

async function comparePassword(rawPassword, storedPassword) {
  if (!storedPassword) return false;

  // Compatibilidade com ambiente em transição:
  // se a senha estiver hashada, usa bcrypt; se não, compara texto puro.
  if (
    storedPassword.startsWith('$2a$') ||
    storedPassword.startsWith('$2b$') ||
    storedPassword.startsWith('$2y$')
  ) {
    return bcrypt.compare(rawPassword, storedPassword);
  }

  return rawPassword === storedPassword;
}

async function login({ registrationId, password, role }) {
  const normalizedRegistrationId = normalizeRegistrationId(registrationId);
  const normalizedRole = normalizeRole(role);

  if (!normalizedRegistrationId || !password || !normalizedRole) {
    const error = new Error('registrationId, password e role são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }

  if (!['EMPLOYEE', 'MANAGER'].includes(normalizedRole)) {
    const error = new Error('role deve ser EMPLOYEE ou MANAGER.');
    error.statusCode = 400;
    throw error;
  }

  let account = null;

  if (normalizedRole === 'EMPLOYEE') {
    account = await prisma.employees.findUnique({
      where: { registrationId: normalizedRegistrationId },
      include: {
        users: true,
        managers: true,
      },
    });
  } else {
    account = await prisma.managers.findUnique({
      where: { registrationId: normalizedRegistrationId },
      include: {
        users: true,
      },
    });
  }

  if (!account || !account.users) {
    const error = new Error('Usuário não encontrado ou sem acesso vinculado.');
    error.statusCode = 401;
    throw error;
  }

  if (!account.active || !account.users.active) {
    const error = new Error('Usuário inativo.');
    error.statusCode = 403;
    throw error;
  }

  const passwordOk = await comparePassword(password, account.users.password);

  if (!passwordOk) {
    const error = new Error('Senha inválida.');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      userId: account.users.id,
      role: normalizedRole,
      registrationId: account.registrationId,
      employeeId: normalizedRole === 'EMPLOYEE' ? account.id : null,
      managerId: normalizedRole === 'MANAGER' ? account.id : null,
      email: account.email,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: '8h' }
  );

  return {
    token,
    user: {
      id: account.users.id,
      role: normalizedRole,
      registrationId: account.registrationId,
      email: account.email,
      profileId: account.id,
      name: account.name,
    },
  };
}

module.exports = {
  login,
};