const express = require('express');
const { requireAuth } = require('../Helpers/auth');
const { doctorSummary } = require('../Controllers/dashboardController');

const router = express.Router();
router.use(requireAuth);

// Returns summary for current user context
router.get('/doctor', doctorSummary);

module.exports = router;
