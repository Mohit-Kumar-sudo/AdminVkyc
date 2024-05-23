import { Router } from 'express';

import { authJwt } from '../../services/auth.services';

import * as rlmController from './rlm.controllers';

const routes = new Router();

// GET Calls
routes.get('/:rid?', authJwt, rlmController.getReportMenuItems);

export default routes;
