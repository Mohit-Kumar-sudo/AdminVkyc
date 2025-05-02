import { Router } from 'express';
import validate from 'express-validation';

import { authJwt } from '../../../services/auth.services';

import * as verticalsController from './verticals.controller';
import verticalsValidation from './verticals.validations';

const routes = new Router();

routes.post('/', authJwt, validate(verticalsValidation.addVertical), verticalsController.addVertical);
routes.get('/defaults', authJwt, validate(verticalsValidation.getDefaultVerticalModulesList), verticalsController.getDefaultVerticalModulesList);
routes.get('/:vid*?/', authJwt, validate(verticalsValidation.getVerticals), verticalsController.getVerticals);

export default routes;
