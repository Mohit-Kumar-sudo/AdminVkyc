import { Router } from 'express';
import validate from 'express-validation';

import { authJwt } from '../../../services/auth.services';

import * as prefsController from './prefs.controller';
import prefsValidation from './prefs.validations';

const routes = new Router();

routes.post('/', authJwt, validate(prefsValidation.savePrefsData), prefsController.savePrefsData);
routes.get('/', authJwt, validate(prefsValidation.getPrefsData), prefsController.getPrefsData);

export default routes;
