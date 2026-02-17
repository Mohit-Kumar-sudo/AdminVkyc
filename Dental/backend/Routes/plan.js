const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../Helpers/auth');
const {
  listActivePlans,
  listAllPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan
} = require('../Controllers/planController');

// Public/User routes
router.get('/plans', listActivePlans);

// Admin routes (protected)
router.use(requireAuth);
router.get('/admin/plans', requireRole('admin'), listAllPlans);
router.get('/admin/plans/:id', requireRole('admin'), getPlan);
router.post('/admin/plans', requireRole('admin'), createPlan);
router.patch('/admin/plans/:id', requireRole('admin'), updatePlan);
router.delete('/admin/plans/:id', requireRole('admin'), deletePlan);

module.exports = router;
