const express = require('express');
const chartController = require('../Controllers/chart.Controller');
const { verifyAccessToken } = require('../Helpers/jwt_helpers');

const router = express.Router();

// Route to get charts count
// router.get('/getChartsCount', chartController.getChartsCount);

// Route to get chart data, protected by auth middleware
router.get('/:rid*?/', chartController.getChartData);

module.exports = router;