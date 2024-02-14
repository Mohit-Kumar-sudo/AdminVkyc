import { Router } from 'express';
// import validate from 'express-validation';

// import { authJwt } from '../../services/auth.services';

import * as secController from './sec.controller';
// import cpValidation from './cp.validations';

const routes = new Router();

routes.get('/parent/filing', secController.getParentFiling);

export default routes;