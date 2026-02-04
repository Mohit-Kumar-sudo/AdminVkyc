const express = require('express');
const router = express.Router();
const paymentController = require('../Controllers/paymentController');

// POST /api/payments/create-order
router.post('/create-order', paymentController.createOrder);

module.exports = router;
