const express = require('express');
const googleScrappingController = require('../Controllers/google_scrapping.Controller');

const routes = express.Router();

routes.get('/scrape/:searchQuery/:start', googleScrappingController.getScrapping);

module.exports = routes;