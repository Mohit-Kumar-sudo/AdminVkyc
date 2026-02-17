const express = require('express');
const router = express.Router();
const paymentController = require('../Controllers/paymentController');
const { requireAuth } = require('../Helpers/auth');

// POST /api/payments/create-order
router.post('/create-order', requireAuth, paymentController.createOrder);

// POST /api/payments/verify
router.post('/verify', requireAuth, paymentController.verifyPayment);

module.exports = router;
