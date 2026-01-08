const express = require('express');
const { requireAuth, requireRole } = require('../Helpers/auth');
const { createClient, listClients, getClient, updateClient, deleteClient } = require('../Controllers/clientController');

const router = express.Router();
router.use(requireAuth);

router.get('/', listClients);
router.get('/:id', getClient);
router.post('/', requireRole('admin'), createClient);
router.patch('/:id', requireRole('admin'), updateClient);
router.delete('/:id', requireRole('admin'), deleteClient);

module.exports = router;
