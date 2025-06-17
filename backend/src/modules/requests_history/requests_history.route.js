import { Router } from 'express';
import validate from 'express-validation';

// import { authJwt } from '../../../services/auth.services';
import {authJwt} from '../../services/auth.services'

import * as reqHistoryController from './requests_history.controller';
// import chartValidation from './chart.validations';

const routes = new Router();

routes.post('/HistoryReport',reqHistoryController.RequestsHistory);
routes.get('/:User_id', reqHistoryController.getHistoryReportById);

export default routes;

