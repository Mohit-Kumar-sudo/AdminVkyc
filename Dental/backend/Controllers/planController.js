const Plan = require('../Models/Plan');

// GET /api/plans - List all active plans (public/user facing)
async function listActivePlans(req, res) {
  try {
    const plans = await Plan.find({ status: 'active' }).select('-__v').sort({ price: 1 });
    res.json(plans);
  } catch (err) {
    console.error('List active plans error:', err);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
}

// GET /api/admin/plans - List all plans (admin only)
async function listAllPlans(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const plans = await Plan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (err) {
    console.error('List all plans error:', err);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
}

// GET /api/admin/plans/:id - Get single plan (admin only)
async function getPlan(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json(plan);
  } catch (err) {
    console.error('Get plan error:', err);
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
}

// POST /api/admin/plans - Create new plan (admin only)
async function createPlan(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, price, currency, interval, features, status } = req.body;

    // Validation
    if (!name || price === undefined || !currency || !interval || !status) {
      return res.status(400).json({ 
        error: 'Name, price, currency, interval, and status are required' 
      });
    }

    if (!['month', 'year'].includes(interval)) {
      return res.status(400).json({ error: 'Interval must be "month" or "year"' });
    }

    if (!['active', 'inactive', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if plan name already exists
    const existing = await Plan.findOne({ name });
    if (existing) {
      return res.status(409).json({ error: 'Plan with this name already exists' });
    }

    const plan = await Plan.create({
      name,
      price,
      currency,
      interval,
      features: features || [],
      status,
      audit: {
        createdBy: req.user.id,
        updatedBy: req.user.id
      }
    });

    res.status(201).json(plan);
  } catch (err) {
    console.error('Create plan error:', err);
    res.status(500).json({ error: 'Failed to create plan' });
  }
}

// PATCH /api/admin/plans/:id - Update plan (admin only)
async function updatePlan(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const { name, price, currency, interval, features, status } = req.body;

    // Update fields if provided
    if (name !== undefined) plan.name = name;
    if (price !== undefined) plan.price = price;
    if (currency !== undefined) plan.currency = currency;
    if (interval !== undefined) {
      if (!['month', 'year'].includes(interval)) {
        return res.status(400).json({ error: 'Interval must be "month" or "year"' });
      }
      plan.interval = interval;
    }
    if (features !== undefined) plan.features = features;
    if (status !== undefined) {
      if (!['active', 'inactive', 'archived'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      plan.status = status;
    }

    plan.updatedAt = new Date();
    plan.audit.updatedBy = req.user.id;

    await plan.save();
    res.json(plan);
  } catch (err) {
    console.error('Update plan error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Plan name already exists' });
    }
    res.status(500).json({ error: 'Failed to update plan' });
  }
}

// DELETE /api/admin/plans/:id - Delete plan (admin only)
async function deletePlan(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Instead of hard delete, we archive it
    plan.status = 'archived';
    plan.updatedAt = new Date();
    plan.audit.updatedBy = req.user.id;
    await plan.save();

    res.json({ message: 'Plan archived successfully', plan });
  } catch (err) {
    console.error('Delete plan error:', err);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
}

module.exports = {
  listActivePlans,
  listAllPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan
};
