import { Router } from 'express';
// import validate from 'express-validation';

// import { authJwt } from '../../services/auth.services';

import * as cikController from './cik.controller';
// import cpValidation from './cp.validations';

const routes = new Router();

routes.get('/cik/:company', cikController.getCikData);

export default routes;