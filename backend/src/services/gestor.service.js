const gestorRepository = require('../repositories/gestor.repository');
const { normalizarRa, validarRa } = require('../utils/ra');

async function listar() {
  const gestores = await gestorRepository.findAll();

  if (!gestores.length) {
    const error = new Error('Nenhum gestor encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return gestores;
}

async function buscarPorRa(ra) {
  const raNormalizado = normalizarRa(ra);

  const gestor = await gestorRepository.findByra(raNormalizado);

  if (!gestor) {
    const error = new Error('Gestor não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return gestor;
}

async function criar(data) {
  const { nome, ra, empresa, email, senha, ativo } = data;

  if (!nome || !ra || !empresa || !email) {
    const error = new Error('nome, ra, empresa e email são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }

  const raNormalizado = normalizarRa(ra);

  if (!validarRa(raNormalizado)) {
    const error = new Error('RA inválido.');
    error.statusCode = 400;
    throw error;
  }

  const gestorExistente = await gestorRepository.findByra(raNormalizado);

  if (gestorExistente) {
    const error = new Error('Este RA já está cadastrado.');
    error.statusCode = 400;
    throw error;
  }

  return gestorRepository.create({
    nome,
    ra: raNormalizado,
    empresa,
    email,
    senha,
    ativo,
  });
}

async function atualizar(ra, data) {
  const raNormalizado = normalizarRa(ra);

  const gestorExistente = await gestorRepository.findByra(raNormalizado);

  if (!gestorExistente) {
    const error = new Error('Gestor não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return gestorRepository.update(raNormalizado, data);
}

module.exports = {
  listar,
  buscarPorRa,
  criar,
  atualizar,
};