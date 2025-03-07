const express = require('express');
const leadsController = require('../Controllers/leads.Controller');

const routes = express.Router();

routes.get('/', leadsController.getLeadsData);
routes.get('/leadsByCompany/:company', leadsController.getLeadsByCompanyName);
routes.get('/leadsByIndustry/:industry', leadsController.getLeadsByIndustry);

module.exports = routes;