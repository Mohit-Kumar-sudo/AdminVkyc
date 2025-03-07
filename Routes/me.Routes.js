const express = require('express')
const routes = express.Router();

const meController = require('../Controllers/me.controller')

routes.get('/:rid/views' , meController.getMEViewsData);
routes.get('/:rid/by_region/:region_id', meController.getByRegion);
routes.get('/:rid/by_segment/:segment_id',meController.getBySegment)

module.exports = routes;
