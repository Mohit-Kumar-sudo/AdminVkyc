const cron = require('node-cron');
const Subscription = require('../Models/Subscription');
const Plan = require('../Models/Plan');
const Payment = require('../Models/Payment');
const paymentService = require('../Services/paymentService'); // You should implement charge logic here
const notifyUser = require('../Utils/notifyUser'); // You should implement notification logic here

// Run daily at 2am
cron.schedule('0 2 * * *', async () => {
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Next 3 days

  const expiringSubs = await Subscription.find({
    autoRenew: true,
    status: 'ACTIVE',
    endDate: { $gte: now, $lte: soon }
  });

  for (const sub of expiringSubs) {
    // Idempotency: skip if already attempted today
    if (sub.lastRenewalAttempt && sub.lastRenewalAttempt.toDateString() === now.toDateString()) continue;

    try {
      // Attempt payment (implement paymentService.charge)
      const paymentResult = await paymentService.charge(sub.userId, sub.planId);
      if (paymentResult.success) {
        const plan = await Plan.findById(sub.planId);
        let newEndDate = new Date(sub.endDate);
        if (plan.interval === 'month') newEndDate.setMonth(newEndDate.getMonth() + 1);
        if (plan.interval === 'year') newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        sub.endDate = newEndDate;
        sub.status = 'ACTIVE';
        sub.lastPaymentId = paymentResult.paymentId;
        sub.lastRenewalAttempt = now;
        sub.retryCount = 0;
        await sub.save();
        // Optionally notify user of success
      } else {
        sub.status = 'PAST_DUE';
        sub.lastRenewalAttempt = now;
        sub.retryCount = (sub.retryCount || 0) + 1;
        await sub.save();
        notifyUser(sub.userId, 'renewal_failed');
      }
    } catch (err) {
      // Log error, optionally retry later
    }
  }
});
