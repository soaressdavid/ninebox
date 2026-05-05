const express = require('express');
const reportController = require('../controllers/report.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/dashboard',
  requireRole('MANAGER', 'ADMIN'),
  reportController.getDashboard
);

router.get(
  '/user/:userId',
  reportController.getUserReport
);

router.get(
  '/team/:gestorId',
  requireRole('MANAGER', 'ADMIN'),
  reportController.getTeamReport
);

module.exports = router;