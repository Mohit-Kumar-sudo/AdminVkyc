const Subscription = require('../Models/Subscription');
const Plan = require('../Models/Plan');
const Payment = require('../Models/Payment');

// Get current user's active subscription
exports.getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['ACTIVE', 'TRIAL', 'PAST_DUE'] },
      endDate: { $gte: now }
    })
      .populate('planId', 'name price currency interval features')
      .populate('lastPaymentId')
      .sort({ createdAt: -1 });

    if (!subscription) {
      return res.json({ subscription: null, message: 'No active subscription found' });
    }

    res.json({ subscription });
  } catch (err) {
    console.error('Error fetching user subscription:', err);
    res.status(500).json({ error: 'Failed to fetch subscription', details: err.message });
  }
};

// Get user's subscription history
exports.getMySubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const subscriptions = await Subscription.find({ userId })
      .populate('planId', 'name price currency interval')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Subscription.countDocuments({ userId });

    res.json({
      subscriptions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching subscription history:', err);
    res.status(500).json({ error: 'Failed to fetch subscription history', details: err.message });
  }
};

// Cancel current user's subscription
exports.cancelMySubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reason } = req.body;
    const now = new Date();

    const subscription = await Subscription.findOne({
      userId,
      status: { $in: ['ACTIVE', 'TRIAL'] },
      endDate: { $gte: now }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found to cancel' });
    }

    subscription.status = 'CANCELLED';
    subscription.autoRenew = false;
    subscription.cancellationReason = reason || 'Cancelled by user';
    await subscription.save();

    res.json({ 
      message: 'Subscription cancelled successfully',
      subscription,
      note: 'You can continue to use the service until the end of your billing period'
    });
  } catch (err) {
    console.error('Error cancelling subscription:', err);
    res.status(500).json({ error: 'Failed to cancel subscription', details: err.message });
  }
};

// Get user's payment history
exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const payments = await Payment.find({ userId })
      .populate('subscriptionId')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments({ userId });

    res.json({
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments', details: err.message });
  }
};
