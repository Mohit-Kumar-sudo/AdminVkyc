const Payment = require('../Models/Payment');
const Subscription = require('../Models/Subscription');
const WebhookLog = require('../Models/WebhookLog');
const { Types } = require('mongoose');

// List payments with filters
exports.listPayments = async (req, res) => {
  try {
    const { userId, status, provider, from, to, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (provider) filter.provider = provider;
    if (from || to) filter.paymentDate = {};
    if (from) filter.paymentDate.$gte = new Date(from);
    if (to) filter.paymentDate.$lte = new Date(to);
    const payments = await Payment.find(filter)
      .populate('userId', 'name email phone')
      .populate('planId', 'name price currency interval')
      .populate({
        path: 'subscriptionId',
        populate: { path: 'planId', select: 'name price currency interval' }
      })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ paymentDate: -1, createdAt: -1 });
    res.json({ payments });
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments', details: err.message });
  }
};

// List subscriptions with filters
exports.listSubscriptions = async (req, res) => {
  try {
    const { userId, status, planId, from, to, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (planId) filter.planId = planId;
    if (from || to) filter.startDate = {};
    if (from) filter.startDate.$gte = new Date(from);
    if (to) filter.startDate.$lte = new Date(to);
    const subscriptions = await Subscription.find(filter)
      .populate('userId', 'name email phone')
      .populate('planId', 'name price currency interval features status')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ subscriptions });
  } catch (err) {
    console.error('Error fetching subscriptions:', err);
    res.status(500).json({ error: 'Failed to fetch subscriptions', details: err.message });
  }
};

// Cancel subscription manually
exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const sub = await Subscription.findById(id);
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    sub.status = 'CANCELLED';
    sub.cancellationReason = reason || 'Cancelled by admin';
    await sub.save();
    res.json({ message: 'Subscription cancelled', subscription: sub });
  } catch (err) {
    console.error('Error cancelling subscription:', err);
    res.status(500).json({ error: 'Failed to cancel subscription', details: err.message });
  }
};

// Extend subscription validity manually
exports.extendSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { newEndDate } = req.body;
    const sub = await Subscription.findById(id);
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    sub.endDate = new Date(newEndDate);
    await sub.save();
    res.json({ message: 'Subscription extended', subscription: sub });
  } catch (err) {
    console.error('Error extending subscription:', err);
    res.status(500).json({ error: 'Failed to extend subscription', details: err.message });
  }
};

// List webhook logs
exports.listWebhookLogs = async (req, res) => {
  try {
    const { provider, status, eventId, from, to, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (provider) filter.provider = provider;
    if (status) filter.status = status;
    if (eventId) filter.eventId = eventId;
    if (from || to) filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
    const logs = await WebhookLog.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ logs });
  } catch (err) {
    console.error('Error fetching webhook logs:', err);
    res.status(500).json({ error: 'Failed to fetch webhook logs', details: err.message });
  }
};
