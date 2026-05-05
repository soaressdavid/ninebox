const avaliadoService = require('../services/avaliado.service');

async function listarAvaliados(req, res, next) {
  try {
    const { raGestor } = req.query;

    const avaliados = await avaliadoService.listar({ raGestor });

    return res.status(200).json(avaliados);
  } catch (error) {
    next(error);
  }
}

async function buscarPorRa(req, res, next) {
  try {
    const { ra } = req.params;
    const avaliado = await avaliadoService.buscarPorRa(ra);

    return res.status(200).json(avaliado);
  } catch (error) {
    next(error);
  }
}

async function criar(req, res, next) {
  try {
    const avaliado = await avaliadoService.criar(req.body);

    return res.status(201).json({
      message: 'Avaliado criado com sucesso!',
      avaliado,
    });
  } catch (error) {
    next(error);
  }
}

async function atualizar(req, res, next) {
  try {
    const { ra } = req.params;
    const avaliado = await avaliadoService.atualizar(ra, req.body);

    return res.status(200).json({
      message: 'Avaliado atualizado com sucesso!',
      avaliado,
    });
  } catch (error) {
    next(error);
  }
}

async function remover(req, res, next) {
  try {
    const { ra } = req.params;
    const resultado = await avaliadoService.remover(ra);

    return res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listarAvaliados,
  buscarPorRa,
  criar,
  atualizar,
  remover,
};