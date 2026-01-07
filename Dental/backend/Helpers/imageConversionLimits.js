const User = require('../Models/User');

/**
 * Middleware to check if user has image conversion permissions and available quota
 */
async function checkImageConversionLimit(req, res, next) {
  try {
    // Admin always has unlimited access
    if (req.user.role === 'admin') {
      return next();
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user can show improvement plans
    if (!user.canShowImprovementPlans) {
      return res.status(403).json({ 
        error: 'You do not have permission to generate improvement plans',
        canShowImprovementPlans: false
      });
    }

    // Check if user has exceeded their monthly limit
    const remainingConversions = user.imageConversionLimit - user.imageConversionsUsed;
    if (remainingConversions <= 0) {
      return res.status(403).json({ 
        error: 'Image conversion limit exceeded. Contact your administrator.',
        imageConversionLimit: user.imageConversionLimit,
        imageConversionsUsed: user.imageConversionsUsed,
        remainingConversions: 0
      });
    }

    // Attach user data to request for later use
    req.userLimits = {
      imageConversionLimit: user.imageConversionLimit,
      imageConversionsUsed: user.imageConversionsUsed,
      remainingConversions
    };

    next();
  } catch (err) {
    console.error('Check image conversion limit error:', err);
    return res.status(500).json({ error: 'Failed to check conversion limits' });
  }
}

/**
 * Function to increment the image conversion usage count
 */
async function incrementImageConversionUsage(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for increment:', userId);
      return;
    }

    // Admin usage doesn't count towards limits
    if (user.role === 'admin') {
      return;
    }

    user.imageConversionsUsed += 1;
    await user.save();
    
    console.log(`Image conversion usage incremented for user ${userId}: ${user.imageConversionsUsed}/${user.imageConversionLimit}`);
  } catch (err) {
    console.error('Increment image conversion usage error:', err);
  }
}

/**
 * Function to check and auto-reset monthly limits (call this periodically or on each request)
 */
async function autoResetMonthlyLimits(userId) {
  try {
    const user = await User.findById(userId);
    if (!user || user.role === 'admin') return;

    const now = new Date();
    const lastReset = new Date(user.lastResetDate);
    
    // Check if a month has passed since last reset
    const monthDiff = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                      (now.getMonth() - lastReset.getMonth());
    
    if (monthDiff >= 1) {
      user.imageConversionsUsed = 0;
      user.lastResetDate = now;
      await user.save();
      console.log(`Monthly limits auto-reset for user ${userId}`);
    }
  } catch (err) {
    console.error('Auto reset monthly limits error:', err);
  }
}

module.exports = {
  checkImageConversionLimit,
  incrementImageConversionUsage,
  autoResetMonthlyLimits
};
