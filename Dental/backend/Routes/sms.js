const express = require('express');
const { requireAuth } = require('../Helpers/auth');
const {
  sendPatientSMS,
  sendAppointmentConfirmationSMS,
  sendAppointmentReminderSMS,
  sendBulkPatientSMS,
  getSMSStatus
} = require('../Controllers/smsController');

const router = express.Router();
router.use(requireAuth);

// Get SMS service status
router.get('/status', getSMSStatus);

// Send custom SMS to a patient
router.post('/send-patient', sendPatientSMS);

// Send appointment confirmation SMS
router.post('/appointment-confirmation', sendAppointmentConfirmationSMS);

// Send appointment reminder SMS
router.post('/appointment-reminder', sendAppointmentReminderSMS);

// Send bulk SMS to multiple patients
router.post('/bulk-send', sendBulkPatientSMS);

module.exports = router;
