const avaliadoRepository = require('../repositories/avaliado.repository');
const gestorRepository = require('../repositories/gestor.repository');
const { normalizarRa, validarRa } = require('../utils/ra');

async function listar({ raGestor }) {
  if (raGestor) {
    const raGestorNormalizado = normalizarRa(raGestor);
    return avaliadoRepository.findByGestorra(raGestorNormalizado);
  }

  return avaliadoRepository.findAll();
}

async function buscarPorRa(ra) {
  const raNormalizado = normalizarRa(ra);

  const avaliado = await avaliadoRepository.findByra(raNormalizado);

  if (!avaliado) {
    const error = new Error('Avaliado não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return avaliado;
}

async function criar(data) {
  const { nome, ra, empresa, ra_gestor, email, senha, ativo } = data;

  if (!nome || !ra || !empresa || !ra_gestor || !email) {
    const error = new Error('nome, ra, empresa, ra_gestor e email são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }

  const raNormalizado = normalizarRa(ra);
  const raGestorNormalizado = normalizarRa(ra_gestor);

  if (!validarRa(raNormalizado) || !validarRa(raGestorNormalizado)) {
    const error = new Error('RA inválido.');
    error.statusCode = 400;
    throw error;
  }

  const avaliadoExistente = await avaliadoRepository.findByra(raNormalizado);
  if (avaliadoExistente) {
    const error = new Error('Este RA já está cadastrado.');
    error.statusCode = 400;
    throw error;
  }

  const gestorExistente = await gestorRepository.findByra(raGestorNormalizado);
  if (!gestorExistente) {
    const error = new Error('Gestor informado não existe.');
    error.statusCode = 400;
    throw error;
  }

  return avaliadoRepository.create({
    nome,
    ra: raNormalizado,
    empresa,
    ra_gestor: raGestorNormalizado,
    email,
    senha,
    ativo,
  });
}

async function atualizar(ra, data) {
  const raNormalizado = normalizarRa(ra);

  const avaliadoExistente = await avaliadoRepository.findByra(raNormalizado);
  if (!avaliadoExistente) {
    const error = new Error('Avaliado não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  if (data.ra_gestor) {
    const raGestorNormalizado = normalizarRa(data.ra_gestor);
    const gestorExistente = await gestorRepository.findByra(raGestorNormalizado);

    if (!gestorExistente) {
      const error = new Error('Gestor informado não existe.');
      error.statusCode = 400;
      throw error;
    }

    data.ra_gestor = raGestorNormalizado;
  }

  return avaliadoRepository.update(raNormalizado, data);
}

async function remover(ra) {
  const raNormalizado = normalizarRa(ra);

  const avaliadoExistente = await avaliadoRepository.findByra(raNormalizado);
  if (!avaliadoExistente) {
    const error = new Error('Avaliado não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  await avaliadoRepository.deleteByra(raNormalizado);

  return { message: 'Avaliado removido com sucesso.' };
}

module.exports = {
  listar,
  buscarPorRa,
  criar,
  atualizar,
  remover,
};