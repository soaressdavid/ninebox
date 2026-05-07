const exportService = require('../services/export.service');

async function exportReport(req, res, next) {
  try {
    const { userId } = req.params;

    const data = await exportService.exportReport(
      userId,
      req.user
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  exportReport,
};