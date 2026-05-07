const express = require('express');
const authRoutes = require('./auth.routes');
const gestorRoutes = require('./gestor.routes');
const avaliadoRoutes = require('./avaliado.routes');
const competenciaRoutes = require('./competencia.routes');
const avaliacaoRoutes = require('./avaliacao.routes');
const responseRoutes = require('./response.routes');
const reportRoutes = require('./report.routes');
const exportRoutes = require('./export.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/gestores', gestorRoutes);
router.use('/avaliados', avaliadoRoutes);
router.use('/competencias', competenciaRoutes);
router.use('/avaliacoes', avaliacaoRoutes);
router.use('/responses', responseRoutes);
router.use('/reports', reportRoutes);
router.use('/export', exportRoutes);

module.exports = router;