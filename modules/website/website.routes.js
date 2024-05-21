import { Router } from 'express';
import { authJwt } from '../../services/auth.services';
import * as websiteController from './website.controllers';
import * as reportController from "../reports/report.controllers";

const routes = new Router();

routes.post('/update_featured_reports', authJwt, websiteController.assignFeaturedReports);
routes.get('/get_featured_reports', authJwt, websiteController.getFeaturedReports);

export default routes;
