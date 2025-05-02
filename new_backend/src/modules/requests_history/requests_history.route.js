import { Router } from 'express';
import {authJwt} from '../../services/auth.services'

import * as reqHistoryController from './requests_history.controller';

const routes = new Router();

routes.post('/HistoryReport', reqHistoryController.RequestsHistory);
routes.get('/:User_id', reqHistoryController.getHistoryReportById);

export default routes;

