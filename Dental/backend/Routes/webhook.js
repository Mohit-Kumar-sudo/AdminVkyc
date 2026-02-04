const express = require('express');
const router = express.Router();
const webhookController = require('../Controllers/webhookController');

// POST /api/webhooks/payment
router.post('/payment', webhookController.handlePaymentWebhook);

module.exports = router;
