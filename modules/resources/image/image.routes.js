import { Router } from 'express';
import validate from 'express-validation';

import { authJwt } from '../../../services/auth.services';

import * as imageController from './image.controller';
import imageValidation from './image.validations';

const routes = new Router();

routes.get('/:rid*?/', authJwt, validate(imageValidation.getImageData), imageController.getImageData);

export default routes;
