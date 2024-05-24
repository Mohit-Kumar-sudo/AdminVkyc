import { Router } from 'express';

import { authJwt } from '../../services/auth.services';

import * as statusController from './rs.controller';

const routes = new Router();

// GET Calls
routes.get('/status/:rid', statusController.getReportMenuItems);
routes.get('/reportmodule/status/:rid', statusController.getReportStatus);
routes.post('/status/:rid',statusController.updateReportStatus)

export default routes;