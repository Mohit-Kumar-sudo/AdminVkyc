const express = require('express');
const { verifyAccessToken } = require('../Helpers/jwt_helpers');

const reportAccessController = require("../Controllers/Reports_access.Controller");

const routes = express.Router();

routes.post('/addReports', verifyAccessToken , reportAccessController.addReports)

routes.post('/addCharts', verifyAccessToken , reportAccessController.addCharts)

routes.get('/getReportsList', reportAccessController.getReportsList)

routes.post('/updateReportsList', verifyAccessToken , reportAccessController.updateReports)

routes.post('/updateCharts', verifyAccessToken , reportAccessController.updateCharts)

module.exports = routes;