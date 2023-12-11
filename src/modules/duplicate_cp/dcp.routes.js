import { Router } from 'express';
import * as dcpController from './dcp.controller';
import { authJwt } from '../../services/auth.services'

const routes = new Router();

// get data
routes.get('/duplicate_cp',authJwt,dcpController.getDuplicateCP);
routes.post('/duplicate_cp/:cpId',authJwt,dcpController.addSelected);

export default routes;

