const express = require('express');
const avaliadoController = require('../controllers/avaliado.controller');

const router = express.Router();

router.get('/', avaliadoController.listarAvaliados);
router.get('/:ra', avaliadoController.buscarPorRa);
router.post('/', avaliadoController.criar);
router.put('/:ra', avaliadoController.atualizar);
router.delete('/:ra', avaliadoController.remover);

module.exports = router;