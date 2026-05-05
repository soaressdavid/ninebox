const reportService = require('../services/report.service');

async function getDashboard(req, res, next) {
  try {
    const data = await reportService.getDashboard(req.user);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getUserReport(req, res, next) {
  try {
    const { userId } = req.params;

    const data = await reportService.getUserReport(userId, req.user);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getTeamReport(req, res, next) {
  try {
    const { gestorId } = req.params;

    const data = await reportService.getTeamReport(gestorId, req.user);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard,
  getUserReport,
  getTeamReport,
};