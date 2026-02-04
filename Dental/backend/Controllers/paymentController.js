const Payment = require('../Models/Payment');
const Plan = require('../Models/Plan');
const Razorpay = require('razorpay');

// You should load these from env vars in production
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
  try {
    const { userId, planId } = req.body;
    if (!userId || !planId) {
      return res.status(400).json({ error: 'userId and planId are required' });
    }

    // Validate plan
    const plan = await Plan.findOne({ _id: planId, status: 'active' });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found or inactive' });
    }

    // Create order with Razorpay
    const order = await razorpay.orders.create({
      amount: plan.price * 100, // Razorpay expects paise
      currency: plan.currency,
      receipt: `order_${userId}_${Date.now()}`,
      notes: { userId, planId }
    });

    // Store payment with status PENDING
    const payment = await Payment.create({
      userId,
      subscriptionId: null, // Will be set after payment success
      provider: 'razorpay',
      providerPaymentId: order.id,
      amount: plan.price,
      currency: plan.currency,
      status: 'pending',
      paymentDate: null
    });

    // Return only safe data
    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      provider: 'razorpay',
      paymentId: payment._id
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
};
