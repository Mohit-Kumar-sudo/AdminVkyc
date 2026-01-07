const express = require('express');
const { requireAuth, requireRole } = require('../Helpers/auth');
const { 
  updateUser, 
  listUsers, 
  createUser, 
  updatePermissions, 
  getAvailableModules,
  updateDoctorLimits,
  resetDoctorUsage,
  getDoctorUsageStats
} = require('../Controllers/userController');

const router = express.Router();
router.use(requireAuth);

router.get('/', requireRole('admin'), listUsers);
router.post('/', requireRole('admin'), createUser);
router.patch('/:id', requireRole('admin'), updateUser);
router.patch('/:id/permissions', requireRole('admin'), updatePermissions);
router.get('/modules/available', requireRole('admin'), getAvailableModules);

// Doctor limits and usage management
router.patch('/:id/limits', requireRole('admin'), updateDoctorLimits);
router.post('/:id/reset-usage', requireRole('admin'), resetDoctorUsage);
router.get('/:id/usage-stats', getDoctorUsageStats); // Doctors can view their own stats

module.exports = router;
