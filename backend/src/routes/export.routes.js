const express = require('express');

const exportController = require('../controllers/export.controller');

const {
  authMiddleware,
} = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/:userId', exportController.exportReport);

module.exports = router;