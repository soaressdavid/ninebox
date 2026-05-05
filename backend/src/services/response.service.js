const repository = require('../repositories/response.repository');

function validateScore(score) {
  const value = Number(score);
  return Number.isInteger(value) && value >= 1 && value <= 4;
}

function normalizeRegistrationId(value) {
  return String(value || '').trim().toUpperCase();
}

async function listPendingForEmployee(registrationId) {
  const normalized = normalizeRegistrationId(registrationId);

  const employee = await repository.findEmployeeByRegistrationId(normalized);
  if (!employee) {
    const error = new Error('Colaborador não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return repository.findPendingEmployeeEvaluations(employee.id);
}

async function listPendingForManager(registrationId) {
  const normalized = normalizeRegistrationId(registrationId);

  const manager = await repository.findManagerByRegistrationId(normalized);
  if (!manager) {
    const error = new Error('Gestor não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return repository.findPendingManagerEvaluations(manager.id);
}

async function getEmployeeForm(evaluationId, registrationId) {
  const normalized = normalizeRegistrationId(registrationId);

  const employee = await repository.findEmployeeByRegistrationId(normalized);
  if (!employee) {
    const error = new Error('Colaborador não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  const evaluation = await repository.findEvaluationForEmployee(evaluationId, employee.id);
  if (!evaluation) {
    const error = new Error('Avaliação não encontrada para este colaborador.');
    error.statusCode = 404;
    throw error;
  }

  return {
    evaluation: {
      id: evaluation.id,
      name: evaluation.name,
      company: evaluation.company,
      startDate: evaluation.startDate,
      endDate: evaluation.endDate,
      description: evaluation.description,
      closingText: evaluation.closingText,
    },
    targetManager: {
      id: evaluation.managers.id,
      name: evaluation.managers.name,
      registrationId: evaluation.managers.registrationId,
      email: evaluation.managers.email,
    },
    competencies: evaluation.evaluation_competencies.map((item) => ({
      id: item.competencies.id,
      name: item.competencies.name,
      type: item.competencies.type,
      audience: item.competencies.audience,
      description: item.competencies.description,
      levelIdeal: item.competencies.levelIdeal,
      levelGood: item.competencies.levelGood,
      levelAverage: item.competencies.levelAverage,
      levelNeedsImprovement: item.competencies.levelNeedsImprovement,
    })),
  };
}

async function getManagerForm(evaluationId, registrationId) {
  const normalized = normalizeRegistrationId(registrationId);

  const manager = await repository.findManagerByRegistrationId(normalized);
  if (!manager) {
    const error = new Error('Gestor não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  const evaluation = await repository.findEvaluationForManager(evaluationId, manager.id);
  if (!evaluation) {
    const error = new Error('Avaliação não encontrada para este gestor.');
    error.statusCode = 404;
    throw error;
  }

  return {
    evaluation: {
      id: evaluation.id,
      name: evaluation.name,
      company: evaluation.company,
      startDate: evaluation.startDate,
      endDate: evaluation.endDate,
      description: evaluation.description,
      closingText: evaluation.closingText,
    },
    participants: evaluation.evaluation_participants.map((participant) => ({
      id: participant.employees.id,
      name: participant.employees.name,
      registrationId: participant.employees.registrationId,
      email: participant.employees.email,
    })),
    competencies: evaluation.evaluation_competencies.map((item) => ({
      id: item.competencies.id,
      name: item.competencies.name,
      type: item.competencies.type,
      audience: item.competencies.audience,
      description: item.competencies.description,
      levelIdeal: item.competencies.levelIdeal,
      levelGood: item.competencies.levelGood,
      levelAverage: item.competencies.levelAverage,
      levelNeedsImprovement: item.competencies.levelNeedsImprovement,
    })),
  };
}

async function submitEmployeeResponses(evaluationId, registrationId, answers) {
  const normalized = normalizeRegistrationId(registrationId);

  if (!Array.isArray(answers) || answers.length === 0) {
    const error = new Error('As respostas são obrigatórias.');
    error.statusCode = 400;
    throw error;
  }

  const employee = await repository.findEmployeeByRegistrationId(normalized);
  if (!employee) {
    const error = new Error('Colaborador não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  const evaluation = await repository.findEvaluationForEmployee(evaluationId, employee.id);
  if (!evaluation) {
    const error = new Error('Avaliação não encontrada para este colaborador.');
    error.statusCode = 404;
    throw error;
  }

  const expectedCompetencyIds = evaluation.evaluation_competencies
    .map((item) => item.competencies.id)
    .sort((a, b) => a - b);

  const receivedCompetencyIds = answers
    .map((item) => Number(item.competencyId))
    .sort((a, b) => a - b);

  if (JSON.stringify(expectedCompetencyIds) !== JSON.stringify(receivedCompetencyIds)) {
    const error = new Error('As respostas devem contemplar todas as competências do gestor.');
    error.statusCode = 400;
    throw error;
  }

  for (const answer of answers) {
    if (!validateScore(answer.score)) {
      const error = new Error('A nota deve ser um inteiro entre 1 e 4.');
      error.statusCode = 400;
      throw error;
    }
  }

  const answeredCount = await repository.countEmployeeResponses(
    evaluation.id,
    employee.id,
    evaluation.managerId
  );

  if (answeredCount > 0) {
    const error = new Error('Esta avaliação já foi respondida por este colaborador.');
    error.statusCode = 400;
    throw error;
  }

  await repository.createEmployeeResponses(
    evaluation.id,
    employee.id,
    evaluation.managerId,
    answers
  );

  return {
    message: 'Respostas do colaborador salvas com sucesso.',
  };
}

async function submitManagerResponses(evaluationId, registrationId, employeeAnswers) {
  const normalized = normalizeRegistrationId(registrationId);

  if (!Array.isArray(employeeAnswers) || employeeAnswers.length === 0) {
    const error = new Error('As respostas do gestor são obrigatórias.');
    error.statusCode = 400;
    throw error;
  }

  const manager = await repository.findManagerByRegistrationId(normalized);
  if (!manager) {
    const error = new Error('Gestor não encontrado.');
    error.statusCode = 404;
    throw error;
  }

  const evaluation = await repository.findEvaluationForManager(evaluationId, manager.id);
  if (!evaluation) {
    const error = new Error('Avaliação não encontrada para este gestor.');
    error.statusCode = 404;
    throw error;
  }

  const participantIds = evaluation.evaluation_participants
    .map((item) => item.employees.id)
    .sort((a, b) => a - b);

  const receivedEmployeeIds = employeeAnswers
    .map((item) => Number(item.employeeId))
    .sort((a, b) => a - b);

  if (JSON.stringify(participantIds) !== JSON.stringify(receivedEmployeeIds)) {
    const error = new Error('É necessário responder todos os participantes da avaliação.');
    error.statusCode = 400;
    throw error;
  }

  const expectedCompetencyIds = evaluation.evaluation_competencies
    .map((item) => item.competencies.id)
    .sort((a, b) => a - b);

  for (const employeeAnswer of employeeAnswers) {
    const ids = (employeeAnswer.answers || [])
      .map((item) => Number(item.competencyId))
      .sort((a, b) => a - b);

    if (JSON.stringify(expectedCompetencyIds) !== JSON.stringify(ids)) {
      const error = new Error(
        `O participante ${employeeAnswer.employeeId} não possui respostas completas.`
      );
      error.statusCode = 400;
      throw error;
    }

    for (const answer of employeeAnswer.answers) {
      if (!validateScore(answer.score)) {
        const error = new Error('A nota deve ser um inteiro entre 1 e 4.');
        error.statusCode = 400;
        throw error;
      }
    }
  }

  const answeredCount = await repository.countManagerResponses(evaluation.id, manager.id);
  if (answeredCount > 0) {
    const error = new Error('Esta avaliação já foi respondida por este gestor.');
    error.statusCode = 400;
    throw error;
  }

  await repository.createManagerResponses(evaluation.id, manager.id, employeeAnswers);

  return {
    message: 'Respostas do gestor salvas com sucesso.',
  };
}

module.exports = {
  listPendingForEmployee,
  listPendingForManager,
  getEmployeeForm,
  getManagerForm,
  submitEmployeeResponses,
  submitManagerResponses,
};