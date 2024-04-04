import { Router } from 'express';
import * as leadsController from './leads.controller';

const routes = new Router();

routes.get('/leads', leadsController.getLeadsData);
routes.get('/leadsByCompany/:company', leadsController.getLeadsByCompanyName);
routes.get('/leadsByIndustry/:industry', leadsController.getLeadsByIndustry);

export default routes;