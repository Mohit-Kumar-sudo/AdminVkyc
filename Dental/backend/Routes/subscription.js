const express = require('express');
const router = express.Router();
const subscriptionController = require('../Controllers/subscriptionController');
const { requireAuth } = require('../Helpers/auth');

// Apply authentication to all routes
router.use(requireAuth);

// User subscription routes
router.get('/my-subscription', subscriptionController.getMySubscription);
router.get('/my-subscription/history', subscriptionController.getMySubscriptionHistory);
router.post('/my-subscription/cancel', subscriptionController.cancelMySubscription);
router.get('/my-payments', subscriptionController.getMyPayments);

module.exports = router;
