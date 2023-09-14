import { Router } from 'express';
// import validate from 'express-validation';

import { authJwt } from '../../services/auth.services';

import * as dayController from './day.controller';
// import cpValidation from './cp.validations';

const routes = new Router();

routes.get('/one-day', authJwt, dayController.getDailyStockDetails);

export default routes;