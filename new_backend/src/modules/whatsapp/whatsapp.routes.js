import { Router } from 'express';
import validate from 'express-validation';

import { authJwt } from '../../services/auth.services';

import * as whatsAppController from './whatsapp.controller';

const routes = new Router();

// new or update
// routes.post('/', authJwt, validate(cpValidation.addNewCompany), cpController.addNewCompany);
// routes.post('/:cid/co', authJwt, validate(cpValidation.addCompanyOverview), cpController.addCompanyOverview);
// routes.post('/:cid/fo', authJwt, validate(cpValidation.addFinancialOverview), cpController.addFinancialOverview);
// routes.post('/:cid/po', authJwt, validate(cpValidation.addProductOfferings), cpController.addProductOfferings);
// routes.post('/:cid/sa', authJwt, validate(cpValidation.addSwotAnalysis), cpController.addSwotAnalysis);
// routes.post('/:cid/kd', authJwt, validate(cpValidation.addKeyDevelopments), cpController.addKeyDevelopments);
// routes.post('/:cid/strategy', authJwt, validate(cpValidation.addStrategyInfo), cpController.addStrategyInfo);

// get data
// routes.get('/:cid*?', authJwt, validate(cpValidation.getCompanyDetails), cpController.getCompanyDetails);

// routes.put('/:tocid', authJwt, validate(tocValidation.updateContent), tocController.updateContent);
routes.get('/send_whatsapp_message', whatsAppController.sendMessage);
routes.post('/send_msme', whatsAppController.sendMSMEImg);
export default routes;

