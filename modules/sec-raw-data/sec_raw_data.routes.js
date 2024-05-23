import { Router } from 'express';
import * as secRawDataController from './sec_raw_data.controllers';

const routes = new Router();

routes.get('/sec-raw-data', secRawDataController.getSecRawData);

export default routes;


