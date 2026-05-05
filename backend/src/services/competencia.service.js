const competenciaRepository = require('../repositories/competencia.repository');

function normalizarAudience(valor) {
  if (!valor) return null;

  const upper = String(valor).trim().toUpperCase();

  if (upper === 'COLABORADOR' || upper === 'EMPLOYEE') return 'EMPLOYEE';
  if (upper === 'GESTOR' || upper === 'MANAGER') return 'MANAGER';

  return null;
}

function normalizarPayload(data) {
  return {
    competencia: data.competencia,
    competenciaDe: normalizarAudience(data.competenciaDe || data.competencia_de),
    tipo: data.tipo,
    descricao: data.descricao,
    criterio1: data.criterio1 || data.ideal,
    criterio2: data.criterio2 || data.bom,
    criterio3: data.criterio3 || data.mediano,
    criterio4: data.criterio4 || data.a_melhorar,
  };
}

function validarCamposObrigatorios(payload) {
  const {
    competencia,
    competenciaDe,
    tipo,
    descricao,
    criterio1,
    criterio2,
    criterio3,
    criterio4,
  } = payload;

  if (
    !competencia ||
    !competenciaDe ||
    !tipo ||
    !descricao ||
    !criterio1 ||
    !criterio2 ||
    !criterio3 ||
    !criterio4
  ) {
    const error = new Error('Todos os campos são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }
}

async function listar({ competenciaDe, search }) {
  const audience = competenciaDe ? normalizarAudience(competenciaDe) : undefined;

  if (competenciaDe && !audience) {
    const error = new Error('Filtro competenciaDe inválido.');
    error.statusCode = 400;
    throw error;
  }

  return competenciaRepository.findAll({
    competenciaDe: audience,
    search,
  });
}

async function buscarPorId(id) {
  const competencia = await competenciaRepository.findById(id);

  if (!competencia) {
    const error = new Error('Competência não encontrada.');
    error.statusCode = 404;
    throw error;
  }

  return competencia;
}

async function criar(data) {
  const payload = normalizarPayload(data);
  validarCamposObrigatorios(payload);

  const existente = await competenciaRepository.findByNomeAndPublico(
    payload.competencia,
    payload.competenciaDe
  );

  if (existente) {
    const error = new Error('Já existe uma competência com esse nome para esse público.');
    error.statusCode = 400;
    throw error;
  }

  return competenciaRepository.create(payload);
}

async function atualizar(id, data) {
  const existente = await competenciaRepository.findById(id);

  if (!existente) {
    const error = new Error('Competência não encontrada.');
    error.statusCode = 404;
    throw error;
  }

  const payload = normalizarPayload(data);
  validarCamposObrigatorios(payload);

  const duplicada = await competenciaRepository.findByNomeAndPublico(
    payload.competencia,
    payload.competenciaDe
  );

  if (duplicada && Number(duplicada.id) !== Number(id)) {
    const error = new Error('Já existe outra competência com esse nome para esse público.');
    error.statusCode = 400;
    throw error;
  }

  return competenciaRepository.update(id, payload);
}

async function remover(id) {
  const existente = await competenciaRepository.findById(id);

  if (!existente) {
    const error = new Error('Competência não encontrada.');
    error.statusCode = 404;
    throw error;
  }

  await competenciaRepository.deleteById(id);

  return { message: 'Competência removida com sucesso.' };
}

async function listarPorAvaliacaoColaboradores(evaluationId) {
  const competencias = await competenciaRepository.findByAvaliacaoColaboradores(evaluationId);

  if (!competencias.length) {
    const error = new Error('Nenhuma competência encontrada para esta avaliação.');
    error.statusCode = 404;
    throw error;
  }

  return competencias;
}

async function listarPorAvaliacaoGestor(evaluationId) {
  const competencias = await competenciaRepository.findByAvaliacaoGestor(evaluationId);

  if (!competencias.length) {
    const error = new Error('Nenhuma competência encontrada para esta avaliação.');
    error.statusCode = 404;
    throw error;
  }

  return competencias;
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
  listarPorAvaliacaoColaboradores,
  listarPorAvaliacaoGestor,
};