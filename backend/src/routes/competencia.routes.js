const express = require('express');
const competenciaController = require('../controllers/competencia.controller');

const router = express.Router();

router.get('/', competenciaController.listar);
router.get('/:id', competenciaController.buscarPorId);
router.post('/', competenciaController.criar);
router.put('/:id', competenciaController.atualizar);
router.delete('/:id', competenciaController.remover);

router.get(
  '/avaliacao/:evaluationId/colaboradores',
  competenciaController.listarPorAvaliacaoColaboradores
);

router.get(
  '/avaliacao/:evaluationId/gestor',
  competenciaController.listarPorAvaliacaoGestor
);

module.exports = router;