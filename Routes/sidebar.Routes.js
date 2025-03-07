const express = require('express')
const routes = express.Router()
const sideController = require('../Controllers/sidebar.Controller')

// import { authJwt } from '../../services/auth.services';
// GET Calls
routes.get('/:rid?', sideController.getReportMenuItems);

module.exports = routes;
