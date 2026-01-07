const express = require('express');
const { requireAuth, requireRole } = require('../Helpers/auth');
const { updateUser, listUsers, createUser, updatePermissions, getAvailableModules } = require('../Controllers/userController');

const router = express.Router();
router.use(requireAuth);

router.get('/', requireRole('admin'), listUsers);
router.post('/', requireRole('admin'), createUser);
router.patch('/:id', requireRole('admin'), updateUser);
router.patch('/:id/permissions', requireRole('admin'), updatePermissions);
router.get('/modules/available', requireRole('admin'), getAvailableModules);

module.exports = router;
