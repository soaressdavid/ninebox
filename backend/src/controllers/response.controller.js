const responseService = require('../services/response.service');

async function listPendingForEmployee(req, res, next) {
  try {
    const evaluations = await responseService.listPendingForEmployee(
      req.user.registrationId
    );

    return res.status(200).json({ evaluations });
  } catch (error) {
    next(error);
  }
}

async function listPendingForManager(req, res, next) {
  try {
    const evaluations = await responseService.listPendingForManager(
      req.user.registrationId
    );

    return res.status(200).json({ evaluations });
  } catch (error) {
    next(error);
  }
}

async function getEmployeeForm(req, res, next) {
  try {
    const { evaluationId } = req.params;

    const form = await responseService.getEmployeeForm(
      evaluationId,
      req.user.registrationId
    );

    return res.status(200).json(form);
  } catch (error) {
    next(error);
  }
}

async function getManagerForm(req, res, next) {
  try {
    const { evaluationId } = req.params;

    const form = await responseService.getManagerForm(
      evaluationId,
      req.user.registrationId
    );

    return res.status(200).json(form);
  } catch (error) {
    next(error);
  }
}

async function submitEmployeeResponses(req, res, next) {
  try {
    const { evaluationId } = req.params;

    const result = await responseService.submitEmployeeResponses(
      evaluationId,
      req.user.registrationId,
      req.body
    );

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function submitManagerResponses(req, res, next) {
  try {
    const { evaluationId } = req.params;

    const result = await responseService.submitManagerResponses(
      evaluationId,
      req.user.registrationId,
      req.body
    );

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPendingForEmployee,
  listPendingForManager,
  getEmployeeForm,
  getManagerForm,
  submitEmployeeResponses,
  submitManagerResponses,
};