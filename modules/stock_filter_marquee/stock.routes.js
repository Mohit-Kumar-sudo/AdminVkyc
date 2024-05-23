import { Router } from 'express';
// import validate from 'express-validation';

import { authJwt } from '../../services/auth.services';

import * as stockController from './stock.controller';
// import cpValidation from './cp.validations';

const routes = new Router();

routes.get('/marquee-stock/:id', stockController.getMarqueeStocks);
routes.get('/filter-stock/:id', authJwt, stockController.getMarqueeStocks);

export default routes;