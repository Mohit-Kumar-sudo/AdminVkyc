import { Router } from 'express';
import reportModel from "./report.model";
import validate from 'express-validation';

import { authJwt } from '../../services/auth.services';
import {authenticateReportType} from '../../custom_middleware/reportTypeMiddleware'

import * as reportController from './report.controllers';
import reportValidation from './report.validations';

const routes = new Router();

// POST Calls
routes.post('/', authJwt, validate(reportValidation.createReport), reportController.createReport);
routes.post('/:rid/module', authJwt, validate(reportValidation.addNewCustomModule), reportController.addNewCustomModule);

routes.get('/set_pdf_report/:rid', reportController.setPdfReport);
routes.get('/add_pdf_report/:rid', reportController.addPdfReport);
routes.post('/:rid/module_sequence', authJwt, reportController.setReportModuleSequence);
routes.post('/:rid/company/co', authJwt, validate(reportValidation.addCompanyOverview), reportController.addCompanyOverview);
routes.post('/:rid/company/sa', authJwt, validate(reportValidation.addSwotAnalysis), reportController.addSwotAnalysis);
routes.post('/:rid/company/kd', authJwt, validate(reportValidation.addKeyDevelopments), reportController.addKeyDevelopments);
routes.post('/:rid/company/strategy', authJwt, validate(reportValidation.addStrategyInfo), reportController.addStrategyInfo);
routes.post('/:rid/company', authJwt, validate(reportValidation.addCompanyProfileData), reportController.addCompanyProfileData);
routes.post('/:rid/new_company', authJwt, reportController.addNewCompanyData);
routes.post('/:rid/delete_company', authJwt, reportController.deleteReportCompany);
routes.post('/:rid/update_report_overlap', authJwt, reportController.addReportOverlapsData);
routes.post('/:rid/title_prefix', authJwt, reportController.titlePrefix);

// GET Calls
routes.get('/:rid/report_company_details', authJwt, reportController.getReportCompanyDetailsByKey);
routes.get('/get_grouped_reports', authJwt, reportController.getReports);
routes.get('/vertical/:vertical?', validate(reportValidation.fetchReport), reportController.getFilteredReports);
// routes.get('/status/:rid', reportController.getReportCompleteData);
routes.get('/reportmodule/status/:rid', reportController.getReportStatus);
routes.post('/status/:rid', reportController.updateReportStatus);
routes.get('/premium_report', reportController.getPremiumReport);
routes.get('/report_by_title/:title', reportController.getReportByTitle);
routes.get('/chartData' , reportController.getChartsReport)
routes.get('/cp/rid/:rid', reportController.getReportCpData);
routes.get('/titles/:rid', reportController.generateTitles);
routes.get('/get_reports', authJwt, reportController.getReportsByKeys);
routes.get('/get_report_chart/:rid', reportController.getReportChart);
routes.get('/suggested_charts/:rid', reportController.getSuggestedReportCharts);
routes.get('/suggested_reports/:rid', authJwt, reportController.getRelatedReportReports);
routes.get('/read_csv', authJwt, reportModel.readCSV);
routes.get('/search_report', authJwt, reportModel.searchReport);
routes.get('/get_report_by_id/:rid', authJwt, reportController.getReportByKeys);
routes.get('/search_report_by_name', authJwt, reportController.searchReportByName);
routes.get('/search/:rid?', authJwt, authenticateReportType, validate(reportValidation.fetchReport), reportController.fetchReport);
// routes.get('/:rid?', authJwt, authenticateReportType, validate(reportValidation.fetchReport), reportController.fetchCp);
routes.get('/:rid/me',  reportController.fetchMe);
routes.get('/:rid/cp',  reportController.fetchCp);
routes.get('/searchReport',  reportController.searchReport);
routes.get('/:rid?', reportController.fetchReportCp);   

routes.get('/get_industry/:rid', reportController.getIndustryReport)


export default routes;
