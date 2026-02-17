const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');
const requireAdmin = require('../Middleware/requireAdmin');
const { requireAuth } = require('../Helpers/auth');

// Apply authentication to all admin routes
router.use(requireAuth);

router.get('/payments', requireAdmin, adminController.listPayments);
router.get('/subscriptions', requireAdmin, adminController.listSubscriptions);
router.post('/subscriptions/:id/cancel', requireAdmin, adminController.cancelSubscription);
router.post('/subscriptions/:id/extend', requireAdmin, adminController.extendSubscription);
router.get('/webhook-logs', requireAdmin, adminController.listWebhookLogs);

module.exports = router;
