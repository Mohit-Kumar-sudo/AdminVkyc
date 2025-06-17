import { Router } from 'express';
// import validate from 'express-validation';

// import { authJwt } from '../../services/auth.services';

import * as twitterController from './twitter.controller';
// import cpValidation from './cp.validations';

const routes = new Router();

routes.get('/twitters', twitterController.getAllTwitter);

export default routes;