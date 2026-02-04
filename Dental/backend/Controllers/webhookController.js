const crypto = require('crypto');
const Payment = require('../Models/Payment');
const Subscription = require('../Models/Subscription');
const WebhookLog = require('../Models/WebhookLog');
const Plan = require('../Models/Plan');

// Helper: Verify Razorpay signature
function verifyRazorpaySignature(body, signature, secret) {
  const expected = crypto.createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  return expected === signature;
}

exports.handlePaymentWebhook = async (req, res) => {
  const provider = 'razorpay';
  const signature = req.headers['x-razorpay-signature'];
  const eventId = req.body.event_id || req.body.id;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // 1. Verify signature
  if (!verifyRazorpaySignature(req.body, signature, secret)) {
    await WebhookLog.create({ provider, eventId, status: 'failed', payload: req.body, lastError: 'Invalid signature' });
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // 2. Idempotency check
  const existingLog = await WebhookLog.findOne({ provider, eventId });
  if (existingLog && existingLog.status === 'processed') {
    return res.status(200).json({ message: 'Already processed' });
  }

  // 3. Log received event
  await WebhookLog.create({ provider, eventId, status: 'received', payload: req.body });

  try {
    // 4. Extract payment details
    const paymentEntity = req.body.payload && req.body.payload.payment && req.body.payload.payment.entity;
    if (!paymentEntity) throw new Error('Invalid payload');
    const { id: providerPaymentId, amount, currency, status } = paymentEntity;

    // 5. Find and validate payment
    const payment = await Payment.findOne({ providerPaymentId });
    if (!payment) throw new Error('Payment not found');
    if (payment.amount * 100 !== amount || payment.currency !== currency) throw new Error('Amount/currency mismatch');
    if (payment.status !== 'pending') throw new Error('Payment already processed');

    // 6. Update payment status atomically
    payment.status = status === 'captured' ? 'success' : 'failed';
    payment.paymentDate = new Date();
    await payment.save();

    // 7. On success, activate subscription
    if (payment.status === 'success') {
      // Prevent overlapping subscriptions
      const now = new Date();
      const plan = await Plan.findById(payment.planId);
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
        await Subscription.create({
          userId: payment.userId,
          planId: plan._id,
          status: 'ACTIVE',
          startDate,
          endDate,
          autoRenew: true,
          lastPaymentId: payment._id
        });
      }
    }

    // 8. On failure, mark payment as FAILED
    if (payment.status === 'failed') {
      // Optionally notify user or log
    }

    // 9. Update webhook log
    await WebhookLog.updateOne({ provider, eventId }, { status: 'processed', processedAt: new Date() });
    return res.status(200).json({ message: 'Processed' });
  } catch (err) {
    await WebhookLog.updateOne({ provider, eventId }, { status: 'failed', lastError: err.message });
    return res.status(500).json({ error: 'Processing failed', details: err.message });
  }
};
