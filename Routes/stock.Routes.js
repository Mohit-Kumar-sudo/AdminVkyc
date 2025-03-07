const { Router } = require('express');
//const { verifyAccessToken } = require('../Helpers/jwt_helpers')
const stockController = require('../Controllers/stock.Controller');
const express = require('express');

const routes = express.Router();

routes.get('/marquee-stock/:id', stockController.getMarqueeStocks);

module.exports = routes;
