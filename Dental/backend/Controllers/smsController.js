const Patient = require('../Models/Patient');
const Appointment = require('../Models/Appointment');
const { 
  sendSMS, 
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAppointmentCancellation,
  sendAppointmentRescheduled,
  sendCustomSMS,
  sendBulkSMS
} = require('../Helpers/smsService');

/**
 * Send custom SMS to a patient
 */
async function sendPatientSMS(req, res) {
  try {
    const { patientId, message } = req.body;
    
    if (!patientId || !message) {
      return res.status(400).json({ error: 'patientId and message are required' });
    }
    
    // Get patient details
    const patient = await Patient.findById(patientId);
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    if (!patient.contact) {
      return res.status(400).json({ error: 'Patient does not have a contact number' });
    }
    
    // Check authorization
    const role = req.user.role;
    if (role === 'doctor' && patient.doctor?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to send SMS to this patient' });
    }
    if (role === 'subadmin' && patient.client?.toString() !== req.user.client) {
      return res.status(403).json({ error: 'Not authorized to send SMS to this patient' });
    }
    
    const result = await sendCustomSMS(patient.contact, message);
    
    if (result.success) {
      return res.json({ 
        success: true, 
        message: 'SMS sent successfully',
        messageSid: result.messageSid 
      });
    } else {
      return res.status(500).json({ 
        error: result.error || 'Failed to send SMS' 
      });
    }
  } catch (error) {
    console.error('Send patient SMS error:', error);
    return res.status(500).json({ error: 'Failed to send SMS' });
  }
}

/**
 * Send appointment confirmation SMS
 */
async function sendAppointmentConfirmationSMS(req, res) {
  try {
    const { appointmentId } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({ error: 'appointmentId is required' });
    }
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name contact');
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    const patient = appointment.patient;
    
    if (!patient || !patient.contact) {
      return res.status(400).json({ error: 'Patient contact number not available' });
    }
    
    // Check authorization
    const role = req.user.role;
    if (role === 'doctor' && appointment.doctor?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (role === 'subadmin' && appointment.client?.toString() !== req.user.client) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Format appointment data
    const appointmentDate = new Date(appointment.startAt);
    const appointmentData = {
      patientName: patient.name,
      date: appointmentDate.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: appointmentDate.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      doctorName: req.user.name,
      clinicName: process.env.CLINIC_NAME || 'Smilify Dental'
    };
    
    const result = await sendAppointmentConfirmation(patient.contact, appointmentData);
    
    if (result.success) {
      return res.json({ 
        success: true, 
        message: 'Appointment confirmation SMS sent successfully',
        messageSid: result.messageSid 
      });
    } else {
      return res.status(500).json({ 
        error: result.error || 'Failed to send SMS' 
      });
    }
  } catch (error) {
    console.error('Send appointment confirmation SMS error:', error);
    return res.status(500).json({ error: 'Failed to send SMS' });
  }
}

/**
 * Send appointment reminder SMS
 */
async function sendAppointmentReminderSMS(req, res) {
  try {
    const { appointmentId } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({ error: 'appointmentId is required' });
    }
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name contact');
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    const patient = appointment.patient;
    
    if (!patient || !patient.contact) {
      return res.status(400).json({ error: 'Patient contact number not available' });
    }
    
    const appointmentDate = new Date(appointment.startAt);
    const appointmentData = {
      patientName: patient.name,
      date: appointmentDate.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: appointmentDate.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      doctorName: req.user.name,
      clinicName: process.env.CLINIC_NAME || 'Smilify Dental'
    };
    
    const result = await sendAppointmentReminder(patient.contact, appointmentData);
    
    if (result.success) {
      return res.json({ 
        success: true, 
        message: 'Appointment reminder SMS sent successfully',
        messageSid: result.messageSid 
      });
    } else {
      return res.status(500).json({ 
        error: result.error || 'Failed to send SMS' 
      });
    }
  } catch (error) {
    console.error('Send appointment reminder SMS error:', error);
    return res.status(500).json({ error: 'Failed to send SMS' });
  }
}

/**
 * Send bulk SMS to multiple patients
 */
async function sendBulkPatientSMS(req, res) {
  try {
    const { patientIds, message } = req.body;
    
    if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
      return res.status(400).json({ error: 'patientIds array is required' });
    }
    
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }
    
    // Get patients
    const patients = await Patient.find({ _id: { $in: patientIds } });
    
    // Filter patients based on authorization
    const role = req.user.role;
    let authorizedPatients = patients;
    
    if (role === 'doctor') {
      authorizedPatients = patients.filter(p => p.doctor?.toString() === req.user.id);
    } else if (role === 'subadmin') {
      authorizedPatients = patients.filter(p => p.client?.toString() === req.user.client);
    }
    
    // Filter patients with valid contact numbers
    const patientsWithPhone = authorizedPatients.filter(p => p.contact);
    
    if (patientsWithPhone.length === 0) {
      return res.status(400).json({ error: 'No patients with valid contact numbers found' });
    }
    
    // Prepare recipients
    const recipients = patientsWithPhone.map(p => ({
      phone: p.contact,
      message: message
    }));
    
    const results = await sendBulkSMS(recipients);
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    return res.json({ 
      success: true,
      message: `SMS sent to ${successCount} patients. ${failureCount} failed.`,
      total: results.length,
      successful: successCount,
      failed: failureCount,
      details: results
    });
  } catch (error) {
    console.error('Send bulk patient SMS error:', error);
    return res.status(500).json({ error: 'Failed to send bulk SMS' });
  }
}

/**
 * Get SMS sending status (for testing)
 */
async function getSMSStatus(req, res) {
  try {
    const isTwilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && 
                                   process.env.TWILIO_AUTH_TOKEN && 
                                   process.env.TWILIO_PHONE_NUMBER);
    
    return res.json({
      configured: isTwilioConfigured,
      status: isTwilioConfigured ? 'SMS service is active' : 'SMS service not configured',
      twilioNumber: process.env.TWILIO_PHONE_NUMBER || 'Not set'
    });
  } catch (error) {
    console.error('Get SMS status error:', error);
    return res.status(500).json({ error: 'Failed to get SMS status' });
  }
}

module.exports = {
  sendPatientSMS,
  sendAppointmentConfirmationSMS,
  sendAppointmentReminderSMS,
  sendBulkPatientSMS,
  getSMSStatus
};
