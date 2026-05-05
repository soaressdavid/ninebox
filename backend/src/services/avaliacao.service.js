const avaliacaoRepository = require('../repositories/avaliacao.repository');
const gestorRepository = require('../repositories/gestor.repository');
const avaliadoRepository = require('../repositories/avaliado.repository');
const competenciaRepository = require('../repositories/competencia.repository');
const { normalizarRa } = require('../utils/ra');

function normalizarListaDeRas(avaliados = []) {
  return avaliados.map((item) => normalizarRa(item.ra || item));
}

function normalizarListaDeIds(lista = []) {
  return lista.map((item) => Number(item.id || item));
}

function normalizarAudience(valor) {
  if (!valor) return null;

  const upper = String(valor).trim().toUpperCase();

  if (upper === 'COLABORADOR' || upper === 'EMPLOYEE') return 'EMPLOYEE';
  if (upper === 'GESTOR' || upper === 'MANAGER') return 'MANAGER';

  return null;
}

function validarPayloadCriacao(payload) {
  const {
    nomeAvaliacao,
    empresa,
    dataInicio,
    dataFim,
    descricao,
    raGestor,
    avaliados,
    competenciasColaboradores,
    competenciasGestor,
  } = payload;

  if (!nomeAvaliacao || !empresa || !dataInicio || !dataFim || !descricao || !raGestor) {
    const error = new Error('Dados gerais da avaliação são obrigatórios.');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(avaliados) || avaliados.length === 0) {
    const error = new Error('Selecione ao menos um avaliado.');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(competenciasColaboradores) || competenciasColaboradores.length === 0) {
    const error = new Error('Selecione ao menos uma competência para colaboradores.');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(competenciasGestor) || competenciasGestor.length === 0) {
    const error = new Error('Selecione ao menos uma competência para o gestor.');
    error.statusCode = 400;
    throw error;
  }
}

async function validarEntidades({
  raGestor,
  rasAvaliados,
  idsCompetenciasColaboradores,
  idsCompetenciasGestor,
}) {
  const gestor = await gestorRepository.findByra(raGestor);
  if (!gestor) {
    const error = new Error('Gestor não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  const avaliados = await avaliadoRepository.findByras(rasAvaliados);
  if (avaliados.length !== rasAvaliados.length) {
    const rasEncontrados = avaliados.map((a) => a.ra);
    const faltantes = rasAvaliados.filter((ra) => !rasEncontrados.includes(ra));

    const error = new Error(`Os seguintes avaliados não foram encontrados: ${faltantes.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const avaliadosInvalidos = avaliados.filter((a) => a.ra_gestor !== raGestor);
  if (avaliadosInvalidos.length > 0) {
    const error = new Error('Há avaliados que não pertencem ao gestor selecionado.');
    error.statusCode = 400;
    throw error;
  }

  const competenciasColaboradores = await competenciaRepository.findByIdsAndPublico(
    idsCompetenciasColaboradores,
    'EMPLOYEE'
  );

  if (competenciasColaboradores.length !== idsCompetenciasColaboradores.length) {
    const idsEncontrados = competenciasColaboradores.map((c) => Number(c.id));
    const faltantes = idsCompetenciasColaboradores.filter(
      (id) => !idsEncontrados.includes(Number(id))
    );

    const error = new Error(
      `Competências de colaborador inválidas ou inexistentes: ${faltantes.join(', ')}`
    );
    error.statusCode = 400;
    throw error;
  }

  const competenciasGestor = await competenciaRepository.findByIdsAndPublico(
    idsCompetenciasGestor,
    'MANAGER'
  );

  if (competenciasGestor.length !== idsCompetenciasGestor.length) {
    const idsEncontrados = competenciasGestor.map((c) => Number(c.id));
    const faltantes = idsCompetenciasGestor.filter((id) => !idsEncontrados.includes(Number(id)));

    const error = new Error(
      `Competências de gestor inválidas ou inexistentes: ${faltantes.join(', ')}`
    );
    error.statusCode = 400;
    throw error;
  }
}

async function listar(filters) {
  return avaliacaoRepository.findAll(filters || {});
}

async function buscarPorId(id) {
  const avaliacao = await avaliacaoRepository.findById(id);

  if (!avaliacao) {
    const error = new Error('Avaliação não encontrada.');
    error.statusCode = 404;
    throw error;
  }

  return avaliacao;
}

async function criar(data) {
  validarPayloadCriacao(data);

  const raGestor = normalizarRa(data.raGestor);
  const rasAvaliados = normalizarListaDeRas(data.avaliados);
  const idsCompetenciasColaboradores = normalizarListaDeIds(data.competenciasColaboradores);
  const idsCompetenciasGestor = normalizarListaDeIds(data.competenciasGestor);

  await validarEntidades({
    raGestor,
    rasAvaliados,
    idsCompetenciasColaboradores,
    idsCompetenciasGestor,
  });

  return avaliacaoRepository.create({
    nomeAvaliacao: data.nomeAvaliacao,
    empresa: data.empresa,
    dataInicio: data.dataInicio,
    dataFim: data.dataFim,
    descricao: data.descricao,
    textoFinal: data.textoFinal || null,
    raGestor,
    rasAvaliados,
    idsCompetenciasColaboradores,
    idsCompetenciasGestor,
    status: data.status || 'pending',
    tipo: data.tipo || '180',
  });
}

async function atualizar(id, data) {
  const existente = await avaliacaoRepository.findById(id);

  if (!existente) {
    const error = new Error('Avaliação não encontrada.');
    error.statusCode = 404;
    throw error;
  }

  const payload = { ...data };

  if (payload.raGestor) {
    payload.raGestor = normalizarRa(payload.raGestor);

    const gestor = await gestorRepository.findByra(payload.raGestor);
    if (!gestor) {
      const error = new Error('Gestor não encontrado.');
      error.statusCode = 404;
      throw error;
    }
  }

  if (Array.isArray(payload.avaliados)) {
    const rasAvaliados = normalizarListaDeRas(payload.avaliados);
    const avaliados = await avaliadoRepository.findByras(rasAvaliados);

    if (avaliados.length !== rasAvaliados.length) {
      const rasEncontrados = avaliados.map((a) => a.ra);
      const faltantes = rasAvaliados.filter((ra) => !rasEncontrados.includes(ra));

      const error = new Error(`Os seguintes avaliados não foram encontrados: ${faltantes.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    payload.rasAvaliados = rasAvaliados;
  }

  if (Array.isArray(payload.competenciasColaboradores)) {
    const ids = normalizarListaDeIds(payload.competenciasColaboradores);
    const competencias = await competenciaRepository.findByIdsAndPublico(ids, 'EMPLOYEE');

    if (competencias.length !== ids.length) {
      const error = new Error('Competências de colaborador inválidas.');
      error.statusCode = 400;
      throw error;
    }

    payload.idsCompetenciasColaboradores = ids;
  }

  if (Array.isArray(payload.competenciasGestor)) {
    const ids = normalizarListaDeIds(payload.competenciasGestor);
    const competencias = await competenciaRepository.findByIdsAndPublico(ids, 'MANAGER');

    if (competencias.length !== ids.length) {
      const error = new Error('Competências de gestor inválidas.');
      error.statusCode = 400;
      throw error;
    }

    payload.idsCompetenciasGestor = ids;
  }

  if (payload.tipo) {
    payload.tipo = String(payload.tipo).trim();
  }

  if (payload.status) {
    payload.status = String(payload.status).trim();
  }

  return avaliacaoRepository.update(id, payload);
}

async function remover(id) {
  const existente = await avaliacaoRepository.findById(id);

  if (!existente) {
    const error = new Error('Avaliação não encontrada.');
    error.statusCode = 404;
    throw error;
  }

  await avaliacaoRepository.deleteById(id);

  return { message: 'Avaliação removida com sucesso.' };
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
};