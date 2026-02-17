const twilio = require('twilio');

// Initialize Twilio client
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    console.warn('Twilio credentials not configured. SMS service will not work.');
    return null;
  }
  
  return twilio(accountSid, authToken);
};

// Format phone number to E.164 format (e.g., +1234567890)
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;
  
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add country code if not present (default to +91 for India)
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  // Add + prefix
  return '+' + cleaned;
};

/**
 * Send SMS to a patient or user
 * @param {string} to - Recipient phone number
 * @param {string} message - SMS message body
 * @returns {Promise<Object>} - Result with success status and message SID
 */
async function sendSMS(to, message) {
  try {
    const client = getTwilioClient();
    
    if (!client) {
      console.error('Twilio client not initialized');
      return { success: false, error: 'SMS service not configured' };
    }
    
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!fromNumber) {
      console.error('Twilio phone number not configured');
      return { success: false, error: 'SMS sender number not configured' };
    }
    
    const formattedTo = formatPhoneNumber(to);
    
    if (!formattedTo) {
      return { success: false, error: 'Invalid phone number' };
    }
    
    const messageResult = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedTo
    });
    
    console.log('SMS sent successfully:', messageResult.sid);
    return { 
      success: true, 
      messageSid: messageResult.sid,
      status: messageResult.status 
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send SMS' 
    };
  }
}

/**
 * Send appointment confirmation SMS
 * @param {string} phoneNumber - Patient phone number
 * @param {Object} appointmentData - Appointment details
 */
async function sendAppointmentConfirmation(phoneNumber, appointmentData) {
  const { patientName, date, time, doctorName, clinicName } = appointmentData;
  
  const message = `Hello ${patientName},

Your appointment has been confirmed!

📅 Date: ${date}
🕐 Time: ${time}
👨‍⚕️ Doctor: ${doctorName || 'Dr.'}
🏥 Clinic: ${clinicName || 'Smilify Dental'}

Please arrive 10 minutes early.

If you need to reschedule, please contact us.

Thank you!`;
  
  return await sendSMS(phoneNumber, message);
}

/**
 * Send appointment reminder SMS
 * @param {string} phoneNumber - Patient phone number
 * @param {Object} appointmentData - Appointment details
 */
async function sendAppointmentReminder(phoneNumber, appointmentData) {
  const { patientName, date, time, doctorName, clinicName } = appointmentData;
  
  const message = `⏰ Appointment Reminder

Hello ${patientName},

This is a reminder about your upcoming appointment:

📅 Date: ${date}
🕐 Time: ${time}
👨‍⚕️ Doctor: ${doctorName || 'Dr.'}
🏥 Clinic: ${clinicName || 'Smilify Dental'}

See you soon!`;
  
  return await sendSMS(phoneNumber, message);
}

/**
 * Send appointment cancellation SMS
 * @param {string} phoneNumber - Patient phone number
 * @param {Object} appointmentData - Appointment details
 */
async function sendAppointmentCancellation(phoneNumber, appointmentData) {
  const { patientName, date, time, reason } = appointmentData;
  
  const message = `Hello ${patientName},

Your appointment scheduled for:

📅 Date: ${date}
🕐 Time: ${time}

has been cancelled.${reason ? `\n\nReason: ${reason}` : ''}

Please contact us to reschedule at your convenience.

Thank you for your understanding.`;
  
  return await sendSMS(phoneNumber, message);
}

/**
 * Send appointment rescheduled SMS
 * @param {string} phoneNumber - Patient phone number
 * @param {Object} appointmentData - Appointment details
 */
async function sendAppointmentRescheduled(phoneNumber, appointmentData) {
  const { patientName, oldDate, oldTime, newDate, newTime, doctorName } = appointmentData;
  
  const message = `Hello ${patientName},

Your appointment has been rescheduled:

❌ Old: ${oldDate} at ${oldTime}
✅ New: ${newDate} at ${newTime}

👨‍⚕️ Doctor: ${doctorName || 'Dr.'}

Please arrive 10 minutes early.

Thank you!`;
  
  return await sendSMS(phoneNumber, message);
}

/**
 * Send custom SMS to patient
 * @param {string} phoneNumber - Patient phone number
 * @param {string} customMessage - Custom message body
 */
async function sendCustomSMS(phoneNumber, customMessage) {
  return await sendSMS(phoneNumber, customMessage);
}

/**
 * Send bulk SMS to multiple recipients
 * @param {Array<{phone: string, message: string}>} recipients - Array of recipients with phone and message
 * @returns {Promise<Array>} - Array of results
 */
async function sendBulkSMS(recipients) {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendSMS(recipient.phone, recipient.message);
    results.push({
      phone: recipient.phone,
      ...result
    });
    
    // Add small delay between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return results;
}

module.exports = {
  sendSMS,
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAppointmentCancellation,
  sendAppointmentRescheduled,
  sendCustomSMS,
  sendBulkSMS,
  formatPhoneNumber
};
