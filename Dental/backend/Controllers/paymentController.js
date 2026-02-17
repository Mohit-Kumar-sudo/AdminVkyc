const crypto = require('crypto');
const Payment = require('../Models/Payment');
const Plan = require('../Models/Plan');
const Subscription = require('../Models/Subscription');
const User = require('../Models/User');
const Razorpay = require('razorpay');

// You should load these from env vars in production
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

function normalizePlanName(planName) {
  if (!planName) return null;
  return String(planName).trim();
}

function calculateGST(baseAmount, gstPercent = 18) {
  return (baseAmount * gstPercent) / 100;
}

exports.createOrder = async (req, res) => {
  try {
    const { planId, userId: bodyUserId } = req.body;
    const userId = req.user?.id || bodyUserId;

    console.log('Create order request:', { 
      planId, 
      userId, 
      reqUserId: req.user?.id, 
      bodyUserId,
      hasReqUser: !!req.user
    });

    if (!planId) {
      return res.status(400).json({ error: 'Missing planId in request body' });
    }
    
    if (!userId) {
      return res.status(401).json({ error: 'Missing userId - authentication required' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found', message: `No plan found with ID: ${planId}` });
    }
    
    if (plan.status !== 'active') {
      return res.status(400).json({ error: 'Plan is not active', message: `Plan status is: ${plan.status}` });
    }

    // Calculate GST with proper decimal handling
    const baseAmount = parseFloat(plan.price.toFixed(2));
    const gstAmount = parseFloat(calculateGST(baseAmount, 18).toFixed(2));
    const totalAmount = parseFloat((baseAmount + gstAmount).toFixed(2));

    // Create order with Razorpay
    console.log('Creating Razorpay order...');
    const orderData = {
      amount: Math.round(totalAmount * 100), // Razorpay expects paise (integer)
      currency: plan.currency || 'INR',
      receipt: `ord_${String(userId).slice(-8)}_${Date.now().toString().slice(-6)}`,
      notes: { userId, planId, baseAmount, gstAmount, totalAmount }
    };
    console.log('Razorpay order data:', orderData);
    
    const order = await razorpay.orders.create(orderData);
    console.log('Razorpay order created:', order.id);

    // Return only safe data
    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      provider: 'razorpay',
      planId: plan._id,
      baseAmount,
      gstAmount,
      totalAmount
    });
  } catch (err) {
    console.error('Create order error:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ 
      error: 'Failed to create order', 
      message: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    if (!userId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return res.status(400).json({ error: 'Missing payment verification data' });
    }

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    let payment = await Payment.findOne({
      $or: [
        { providerOrderId: razorpay_order_id },
        { providerPaymentId: razorpay_order_id }
      ]
    });

    if (!payment) {
      const planForAmount = await Plan.findById(planId);
      if (!planForAmount) {
        return res.status(500).json({ error: 'Plan not found for payment' });
      }
      const baseAmount = parseFloat(planForAmount.price.toFixed(2));
      const gstAmount = parseFloat(calculateGST(baseAmount, 18).toFixed(2));
      const totalAmount = parseFloat((baseAmount + gstAmount).toFixed(2));
      payment = await Payment.create({
        userId,
        planId,
        subscriptionId: null,
        provider: 'razorpay',
        providerOrderId: razorpay_order_id,
        providerPaymentId: razorpay_payment_id,
        baseAmount,
        gstAmount,
        amount: totalAmount,
        currency: planForAmount.currency || 'INR',
        status: 'pending',
        paymentDate: null
      });
    }

    if (payment.status === 'success') {
      return res.json({ message: 'Payment already verified' });
    }

    payment.providerOrderId = payment.providerOrderId || razorpay_order_id;
    payment.providerPaymentId = razorpay_payment_id;
    payment.status = 'success';
    payment.paymentDate = new Date();
    await payment.save();

    const plan = payment.planId ? await Plan.findById(payment.planId) : await Plan.findById(planId);
    if (!plan) {
      return res.status(500).json({ error: 'Plan not found for payment' });
    }

    const now = new Date();
    const existingSub = await Subscription.findOne({
      userId: payment.userId,
      planId: plan._id,
      status: { $in: ['TRIAL', 'ACTIVE', 'PAST_DUE'] },
      endDate: { $gte: now }
    });

    if (!existingSub) {
      const startDate = now;
      const endDate = new Date(startDate);
      if (plan.interval === 'month') endDate.setMonth(endDate.getMonth() + 1);
      if (plan.interval === 'year') endDate.setFullYear(endDate.getFullYear() + 1);
      const createdSub = await Subscription.create({
        userId: payment.userId,
        planId: plan._id,
        status: 'ACTIVE',
        startDate,
        endDate,
        autoRenew: true,
        lastPaymentId: payment._id
      });
      payment.subscriptionId = createdSub._id;
      await payment.save();
    } else if (!payment.subscriptionId) {
      payment.subscriptionId = existingSub._id;
      await payment.save();
    }

    await User.updateOne(
      { _id: payment.userId },
      { subscriptionPlan: normalizePlanName(plan.name), subscriptionStatus: 'active' }
    );

    return res.json({ message: 'Payment verified' });
  } catch (err) {
    console.error('Verify payment error:', err);
    return res.status(500).json({ error: 'Failed to verify payment', message: err.message });
  }
};
