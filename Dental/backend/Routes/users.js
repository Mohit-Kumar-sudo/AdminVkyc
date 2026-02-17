const express = require('express');
const multer = require('multer');
const { requireAuth, requireRole } = require('../Helpers/auth');
const { 
  updateUser, 
  listUsers, 
  createUser, 
  updatePermissions, 
  getAvailableModules,
  updateDoctorLimits,
  resetDoctorUsage,
  getDoctorUsageStats,
  getMe,
  getMyDetails,
  updateMe,
  changeMyPassword,
  getMyPlan,
  updateMyPlan,
  adminResetUserPassword,
  deleteUser,
  uploadMyPhoto,
  toggleUserStatus,
  updateUserPassword
} = require('../Controllers/userController');

const router = express.Router();
router.use(requireAuth);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', requireRole('admin'), listUsers);
router.post('/', requireRole('admin'), createUser);
router.patch('/:id', requireRole('admin'), updateUser);
router.patch('/:id/permissions', requireRole('admin'), updatePermissions);
router.patch('/:id/toggle-status', requireRole('admin'), toggleUserStatus);
router.patch('/:id/update-password', requireRole('admin'), updateUserPassword);
router.get('/modules/available', requireRole('admin'), getAvailableModules);

router.patch('/:id/limits', requireRole('admin'), updateDoctorLimits);
router.post('/:id/reset-usage', requireRole('admin'), resetDoctorUsage);
router.get('/:id/usage-stats', getDoctorUsageStats); 

router.get('/me/profile', getMe);
router.get('/me/details', getMyDetails);
router.patch('/me/profile', updateMe);
router.patch('/me/password', changeMyPassword);
router.get('/me/plan', getMyPlan);
router.patch('/me/plan', updateMyPlan);
router.post('/me/photo', upload.single('photo'), uploadMyPhoto);

router.post('/:id/reset-password', requireRole('admin'), adminResetUserPassword);
router.delete('/:id', requireRole('admin'), deleteUser);

module.exports = router;
