import { Router } from 'express';
import validate from 'express-validation';

import { authJwt } from '../../services/auth.services';

import * as cpController from './cp.controller';
import cpValidation from './cp.validations';
import multipart from 'connect-multiparty';
const  multipartMiddleware  =  multipart({ uploadDir:  './uploads'});  

const routes = new Router();

// new or update
routes.post('/', authJwt, validate(cpValidation.addNewCompany), cpController.addNewCompany);
routes.post('/:cid/co', authJwt, validate(cpValidation.addCompanyOverview), cpController.addCompanyOverview);
routes.post('/:cid/fo', authJwt, validate(cpValidation.addFinancialOverview), cpController.addFinancialOverview);
routes.post('/:cid/po', authJwt, validate(cpValidation.addProductOfferings), cpController.addProductOfferings);
routes.post('/:cid/sa', authJwt, validate(cpValidation.addSwotAnalysis), cpController.addSwotAnalysis);
routes.post('/:cid/kd', authJwt, validate(cpValidation.addKeyDevelopments), cpController.addKeyDevelopments);
routes.post('/:cid/strategy', authJwt, validate(cpValidation.addStrategyInfo), cpController.addStrategyInfo);
routes.post('/interconnect',authJwt, cpController.interConnect);
routes.post('/csvimport',authJwt, multipartMiddleware, cpController.importCsvCPtoDB);
routes.post('/get_interconnect',authJwt,cpController.sendInterConnects);
routes.post('/lead_suggest',authJwt,cpController.leadsSuggest);
routes.post('/filing_suggest',authJwt,cpController.filingSuggest);

// get data
routes.get('/:cid*?', authJwt, validate(cpValidation.getCompanyDetails), cpController.getCompanyDetails);

// routes.put('/:tocid', authJwt, validate(tocValidation.updateContent), tocController.updateContent);
routes.delete('/:cid', authJwt, validate(cpValidation.deleteCompany), cpController.deleteCompany);

export default routes;

