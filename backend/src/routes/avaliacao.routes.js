const express = require('express');
const avaliacaoController = require('../controllers/avaliacao.controller');

const router = express.Router();

router.get('/', avaliacaoController.listar);
router.get('/:id', avaliacaoController.buscarPorId);
router.post('/', avaliacaoController.criar);
router.put('/:id', avaliacaoController.atualizar);
router.delete('/:id', avaliacaoController.remover);

module.exports = router;