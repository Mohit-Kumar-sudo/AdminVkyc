import { Router } from 'express';
// import validate from 'express-validation';

import { authJwt } from '../../services/auth.services';

import * as secController from './sec.controllers';
// import cpValidation from './cp.validations';

const routes = new Router();

routes.get('/sec-cik',authJwt, secController.getSecCik);
routes.get('/sec-cik/:cik', secController.getSecCikDoc);
routes.post('/sec-cik/:cik', secController.updateJsonData);

export default routes;