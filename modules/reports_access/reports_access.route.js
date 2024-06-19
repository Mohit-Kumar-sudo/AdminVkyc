import { Router } from "express";
import { authJwt } from "../../services/auth.services";

import * as reportAccessController from "./reports_access.controller"

const routes = new Router();

routes.post('/addReports', authJwt , reportAccessController.addReports)

routes.get('/getReportsList', authJwt , reportAccessController.getReportsList)

routes.post('/updateReportsList', authJwt , reportAccessController.updateReports)

export default routes