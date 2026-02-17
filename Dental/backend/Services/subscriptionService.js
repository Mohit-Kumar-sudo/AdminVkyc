const Subscription = require('../Models/Subscription');
const Plan = require('../Models/Plan');
const Payment = require('../Models/Payment');

class SubscriptionService {
  // Create subscription after successful payment
  static async createSubscription({ userId, planId, paymentId, autoRenew = true }) {
    // Prevent overlapping subscriptions
    const now = new Date();
    const overlapping = await Subscription.findOne({
      userId,
      planId,
      status: { $in: ['TRIAL', 'ACTIVE', 'PAST_DUE'] },
      endDate: { $gte: now }
    });
    if (overlapping) throw new Error('Active or trial subscription already exists');

    const plan = await Plan.findById(planId);
    if (!plan) throw new Error('Plan not found');

    const startDate = now;
    let endDate = new Date(startDate);
    if (plan.interval === 'month') endDate.setMonth(endDate.getMonth() + 1);
    if (plan.interval === 'year') endDate.setFullYear(endDate.getFullYear() + 1);

    return Subscription.create({
      userId,
      planId,
      status: 'ACTIVE',
      startDate,
      endDate,
      autoRenew,
      lastPaymentId: paymentId
    });
  }

  // Handle renewal after successful payment
  static async renewSubscription({ subscriptionId, paymentId }) {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) throw new Error('Subscription not found');
    if (['EXPIRED', 'CANCELLED'].includes(subscription.status)) throw new Error('Cannot renew');

    const plan = await Plan.findById(subscription.planId);
    if (!plan) throw new Error('Plan not found');

    let newEndDate = new Date(subscription.endDate);
    if (plan.interval === 'month') newEndDate.setMonth(newEndDate.getMonth() + 1);
    if (plan.interval === 'year') newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    subscription.endDate = newEndDate;
    subscription.status = 'ACTIVE';
    subscription.lastPaymentId = paymentId;
    await subscription.save();
    return subscription;
  }

  // Mark as PAST_DUE
  static async markPastDue(subscriptionId) {
    await Subscription.updateOne({ _id: subscriptionId }, { status: 'PAST_DUE' });
  }

  // Expire after grace period
  static async expireIfPastDue(subscriptionId) {
    await Subscription.updateOne({ _id: subscriptionId, status: 'PAST_DUE' }, { status: 'EXPIRED' });
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId) {
    await Subscription.updateOne({ _id: subscriptionId }, { status: 'CANCELLED' });
  }
}

module.exports = SubscriptionService;
