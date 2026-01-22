const express = require('express');
const { requireAuth } = require('../Helpers/auth');
const { listAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment } = require('../Controllers/appointmentController');

const router = express.Router();
router.use(requireAuth);

router.get('/', listAppointments);
router.get('/:id', getAppointment);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

module.exports = router;
