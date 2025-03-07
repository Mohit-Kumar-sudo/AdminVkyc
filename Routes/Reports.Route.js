const express = require('express');
const { verifyAccessToken } = require('../Helpers/jwt_helpers')
// const validate = require('express-validation');
const routes = express.Router();
// const reportValidation = require('../Validations/report.validate')
const reportController = require('../Controllers/Reports.Controller')
const {authenticateReportType} = require('../middleware/reportTypeMiddleware')

// POST Calls
routes.post('/', verifyAccessToken, reportController.createReport);
routes.post('/:rid/module', verifyAccessToken, reportController.addNewCustomModule);

routes.get('/set_pdf_report/:rid', reportController.setPdfReport);
routes.get('/add_pdf_report/:rid', reportController.addPdfReport);
routes.post('/:rid/module_sequence', verifyAccessToken, reportController.setReportModuleSequence);
routes.post('/:rid/company/co', verifyAccessToken,  reportController.addCompanyOverview);
routes.post('/:rid/company/sa', verifyAccessToken, reportController.addSwotAnalysis);
routes.post('/:rid/company/kd', verifyAccessToken,  reportController.addKeyDevelopments);
routes.post('/:rid/company/strategy', verifyAccessToken, reportController.addStrategyInfo);
routes.post('/:rid/company', verifyAccessToken, reportController.addCompanyProfileData);
routes.post('/:rid/new_company', verifyAccessToken, reportController.addNewCompanyData);
routes.post('/:rid/delete_company', verifyAccessToken, reportController.deleteReportCompany);
routes.post('/:rid/update_report_overlap', verifyAccessToken, reportController.addReportOverlapsData);
routes.post('/:rid/title_prefix', verifyAccessToken, reportController.titlePrefix);

// GET Calls
routes.get('/:rid/report_company_details', verifyAccessToken, reportController.getCompanyReportDataByKey);
routes.get('/get_grouped_reports', reportController.getReports);
routes.get('/vertical/:vertical?', reportController.getFilteredReports);
// routes.get('/status/:rid', reportController.getReportCompleteData);
routes.get('/reportmodule/status/:rid', reportController.getReportStatus);
routes.post('/status/:rid', reportController.updateReportStatus);
// routes.get('/premium_report', reportController.getPremiumReport);
routes.get('/report_by_title/:title', reportController.getReportByTitle);
// routes.get('/chartData' , reportController.getChartsReport)
routes.get('/cp/rid/:rid', reportController.getReportCpData);
// routes.get('/titles/:rid', reportController.generateTitles);
routes.get('/get_reports', verifyAccessToken, reportController.getReportsByKeys);
// routes.get('/get_report_chart/:rid', reportController.getReportChart);
// routes.get('/suggested_charts/:rid', reportController.getSuggestedReportCharts);
routes.get('/suggested_reports/:rid', verifyAccessToken, reportController.getRelatedReportReports);
// routes.get('/read_csv', verifyAccessToken, reportModel.readCSV);
// routes.get('/search_report', verifyAccessToken, reportModel.searchReport);
routes.get('/get_report_by_id/:rid', verifyAccessToken, reportController.getReportByKeys);
routes.get('/search_report_by_name', verifyAccessToken, reportController.searchReportByName);
routes.get('/search/:rid?', verifyAccessToken, authenticateReportType, reportController.fetchReport);
routes.get('/:rid/me',  reportController.fetchMe);
routes.get('/:rid?', reportController.fetchReportCp);
routes.get('/:rid/cp',  reportController.fetchCp);
routes.get('/searchReport',  reportController.searchReportTitle);

routes.get('/get_industry/:rid', reportController.getIndustryReport)
  

module.exports = routes;
