const gestorService = require('../services/gestor.service');

async function listarGestores(req, res, next) {
  try {
    const gestores = await gestorService.listar();
    return res.status(200).json(gestores);
  } catch (error) {
    next(error);
  }
}

async function buscarPorRa(req, res, next) {
  try {
    const { ra } = req.params;
    const gestor = await gestorService.buscarPorRa(ra);
    return res.status(200).json(gestor);
  } catch (error) {
    next(error);
  }
}

async function criar(req, res, next) {
  try {
    const gestor = await gestorService.criar(req.body);
    return res.status(201).json({
      message: 'Gestor criado com sucesso!',
      gestor,
    });
  } catch (error) {
    next(error);
  }
}

async function atualizar(req, res, next) {
  try {
    const { ra } = req.params;
    const gestor = await gestorService.atualizar(ra, req.body);

    return res.status(200).json({
      message: 'Gestor atualizado com sucesso!',
      gestor,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listarGestores,
  buscarPorRa,
  criar,
  atualizar,
};