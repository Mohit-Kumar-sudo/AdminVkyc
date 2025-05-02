import { Router } from 'express';
import validate from 'express-validation';

import { authJwt } from '../../../services/auth.services';

import * as chartController from './chart.controller';
import chartValidation from './chart.validations';

const routes = new Router();
// routes.get('/getChartsCount', chartController.getChartsCount);
// routes.get("/getChartsTitle", chartController.getChartCount)
routes.get('/:rid*?/', authJwt, validate(chartValidation.getChartData), chartController.getChartData);

export default routes;
