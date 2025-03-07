const express = require('express');
const leadsController = require('../Controllers/leads-db.Controller');

const routes = express.Router();

routes.get('/', leadsController.getLeads);
routes.post('/leadSearchByName', leadsController.searchByName);

module.exports = routes;