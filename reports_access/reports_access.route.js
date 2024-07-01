import { Router } from "express";
import { authJwt } from "../../services/auth.services";

import * as reportAccessController from "./reports_access.controller"

const routes = new Router();

routes.post('/addReports', authJwt , reportAccessController.addReports)

routes.post('/addCharts', authJwt , reportAccessController.addCharts)

routes.get('/getReportsList', authJwt , reportAccessController.getReportsList)

routes.post('/updateReportsList', authJwt , reportAccessController.updateReports)

routes.post('/updateCharts', authJwt , reportAccessController.updateCharts)

export default routes
