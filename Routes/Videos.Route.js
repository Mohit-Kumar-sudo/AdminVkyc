const express = require('express');
const routes = express.Router();

const videoController = require('../Controllers/videos.Controller')

routes.get('/videos-filter', videoController.getVideos);

module.exports = routes;