const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não informado.' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      registrationId: decoded.registrationId,
      employeeId: decoded.employeeId || null,
      managerId: decoded.managerId || null,
      email: decoded.email || null,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Acesso negado para este perfil.' });
    }

    next();
  };
}

module.exports = {
  authMiddleware,
  requireRole,
};