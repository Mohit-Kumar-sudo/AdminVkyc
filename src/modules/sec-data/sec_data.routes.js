import { Router } from 'express';
import * as secDataController from './sec_data.controllers';

const routes = new Router();

routes.get('/sec-data/:searchQuery', secDataController.getSecData);

export default routes;