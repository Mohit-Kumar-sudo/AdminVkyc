const Subscription = require('../Models/Subscription');
const Plan = require('../Models/Plan');

function checkSubscriptionAccess(requiredPlan) {
  return async (req, res, next) => {
    try {
      const userId = req.user && req.user._id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Fetch active/trial subscription
      const now = new Date();
      const subscription = await Subscription.findOne({
        userId,
        status: { $in: ['ACTIVE', 'TRIAL'] },
        endDate: { $gte: now }
      });
      if (!subscription) {
        return res.status(403).json({ error: 'No active subscription' });
      }

      // Validate plan
      const plan = await Plan.findById(subscription.planId);
      if (!plan || plan.name !== requiredPlan) {
        return res.status(403).json({ error: 'Insufficient plan for this feature' });
      }

      // Attach subscription/plan to request for downstream use
      req.subscription = subscription;
      req.plan = plan;
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Subscription check failed', details: err.message });
    }
  };
}

module.exports = checkSubscriptionAccess;
