import { Router } from 'express';
import * as secSearchNewController from './sec_search_new.controllers';

const routes = new Router();

routes.post('/sec-search-new', secSearchNewController.getSecSearchData);

export default routes;


