import { Router } from 'express';
import * as secSearchDataController from './sec_search.controllers';

const routes = new Router();

routes.get('/sec-search/:searchQuery/:formType/:company_name/:from_date/:to_date/:page', secSearchDataController.getSecSearchData);

export default routes;


