import { Router } from 'express';

import * as leadsController from './leads-db.controller';
import leadsValidation from './leads-db.validations';
import validate from 'express-validation';

const routes = new Router();

routes.get('/', leadsController.getLeads);
routes.post('/', validate(leadsValidation.addNewLead), leadsController.addNewLead);
routes.post('/leadsdb/:company_id', validate(leadsValidation.addLeadsData), leadsController.addLeadsData);
routes.get('/:company_id', leadsController.getLeadsById);
routes.post('/leadSearchByName', leadsController.searchByName)
routes.post('/searchByCompany', leadsController.searchByCompany)

export default routes;
