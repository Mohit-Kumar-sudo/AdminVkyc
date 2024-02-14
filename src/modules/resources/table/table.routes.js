import { Router } from 'express';
import validate from 'express-validation';

import { authJwt } from '../../../services/auth.services';

import * as tableController from './table.controller';
import tableValidation from './table.validations';

const routes = new Router();

routes.get('/:rid*?/', authJwt, validate(tableValidation.getTableData), tableController.getTableData);

export default routes;
