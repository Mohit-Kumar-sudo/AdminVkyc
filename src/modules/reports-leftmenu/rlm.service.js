import reportModel from '../reports/report.model';

async function getReportMenuItems(reportId) {
  let reportMenuData;
  try {
    reportMenuData = reportModel.getReportMenuItems(reportId);
    return reportMenuData;
  } catch (er) {
    return (reportMenuData.errors = er);
  }
}

module.exports = {
  getReportMenuItems
};
