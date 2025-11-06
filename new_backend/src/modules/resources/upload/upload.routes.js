import { Router } from 'express';
import validate from 'express-validation';

import { authJwt } from '../../../services/auth.services';

import * as uploadController from './upload.controller';
// import uploadValidation from './upload.validations';

const routes = new Router();

routes.post('/:rid/image', authJwt, /* validate(uploadValidation.uploadImage), */ uploadController.uploadImage);

export default routes;
