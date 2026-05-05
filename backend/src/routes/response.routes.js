const express = require('express');
const responseController = require('../controllers/response.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

// colaborador avalia gestor
router.get(
  '/employee/pending',
  requireRole('EMPLOYEE'),
  responseController.listPendingForEmployee
);

router.get(
  '/employee/:evaluationId/form',
  requireRole('EMPLOYEE'),
  responseController.getEmployeeForm
);

router.post(
  '/employee/:evaluationId',
  requireRole('EMPLOYEE'),
  responseController.submitEmployeeResponses
);

// gestor avalia colaboradores
router.get(
  '/manager/pending',
  requireRole('MANAGER'),
  responseController.listPendingForManager
);

router.get(
  '/manager/:evaluationId/form',
  requireRole('MANAGER'),
  responseController.getManagerForm
);

router.post(
  '/manager/:evaluationId',
  requireRole('MANAGER'),
  responseController.submitManagerResponses
);

module.exports = router;