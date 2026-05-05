const avaliacaoService = require('../services/avaliacao.service');

async function listar(req, res, next) {
  try {
    const { empresa, raGestor, status, tipo } = req.query;

    const avaliacoes = await avaliacaoService.listar({
      empresa,
      raGestor,
      status,
      tipo,
    });

    return res.status(200).json({ avaliacoes });
  } catch (error) {
    next(error);
  }
}

async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params;
    const avaliacao = await avaliacaoService.buscarPorId(id);

    return res.status(200).json(avaliacao);
  } catch (error) {
    next(error);
  }
}

async function criar(req, res, next) {
  try {
    const avaliacao = await avaliacaoService.criar(req.body);

    return res.status(201).json({
      message: 'Avaliação criada com sucesso!',
      avaliacao,
    });
  } catch (error) {
    next(error);
  }
}

async function atualizar(req, res, next) {
  try {
    const { id } = req.params;
    const avaliacao = await avaliacaoService.atualizar(id, req.body);

    return res.status(200).json({
      message: 'Avaliação atualizada com sucesso!',
      avaliacao,
    });
  } catch (error) {
    next(error);
  }
}

async function remover(req, res, next) {
  try {
    const { id } = req.params;
    const resultado = await avaliacaoService.remover(id);

    return res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
};