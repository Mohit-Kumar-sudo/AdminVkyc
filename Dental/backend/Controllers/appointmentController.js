const Appointment = require('../Models/Appointment');
const Patient = require('../Models/Patient');
const User = require('../Models/User');
const { sendAppointmentConfirmation, sendAppointmentRescheduled, sendAppointmentCancellation } = require('../Helpers/smsService');

function canAccessAppointment(req, appt) {
  const role = req.user.role;
  if (role === 'admin') return true;
  if (role === 'subadmin') return appt.client?.toString() === req.user.client;
  return appt.doctor?.toString() === req.user.id;
}

// Check for scheduling conflicts with a buffer of 15-20 minutes
async function checkAppointmentConflicts(doctorId, startAt, endAt, excludeAppointmentId = null) {
  const BUFFER_MINUTES = 20; // 20-minute buffer between appointments
  const requestedStart = new Date(startAt);
  const requestedEnd = endAt ? new Date(endAt) : new Date(requestedStart.getTime() + 60 * 60 * 1000); // Default 1 hour if no end time
  
  // Add buffer time
  const bufferStart = new Date(requestedStart.getTime() - BUFFER_MINUTES * 60 * 1000);
  const bufferEnd = new Date(requestedEnd.getTime() + BUFFER_MINUTES * 60 * 1000);
  
  // Find appointments for this doctor that overlap with the requested time (including buffer)
  const query = {
    doctor: doctorId,
    status: { $in: ['scheduled', 'completed'] }, // Don't consider cancelled or no-show
    $or: [
      // Existing appointment starts within our buffer window
      { startAt: { $gte: bufferStart, $lt: bufferEnd } },
      // Existing appointment ends within our buffer window
      { endAt: { $gt: bufferStart, $lte: bufferEnd } },
      // Existing appointment completely encompasses our requested time
      { startAt: { $lte: bufferStart }, endAt: { $gte: bufferEnd } }
    ]
  };
  
  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }
  
  const conflicts = await Appointment.find(query)
    .populate('patient', 'name contact')
    .sort({ startAt: 1 });
  
  return conflicts;
}

async function listAppointments(req, res) {
  try {
    const { patientId, status, from, to, type } = req.query; // type: upcoming|past|all
    const filter = {};

    const role = req.user.role;
    if (role === 'doctor') {
      filter.doctor = req.user.id;
      if (req.user.client) filter.client = req.user.client;
    } else if (role === 'subadmin') {
      filter.client = req.user.client;
    }

    if (patientId) filter.patient = patientId;
    if (status) filter.status = status;

    const now = new Date();
    if (type === 'upcoming') {
      filter.startAt = { $gte: now };
    } else if (type === 'past') {
      filter.startAt = { $lt: now };
    }

    if (from || to) {
      filter.startAt = filter.startAt || {};
      if (from) filter.startAt.$gte = new Date(from);
      if (to) filter.startAt.$lte = new Date(to);
    }

    const appts = await Appointment.find(filter).populate('patient', 'name contact email').sort({ startAt: 1 });
    return res.json(appts);
  } catch (err) {
    console.error('List appointments error:', err);
    return res.status(500).json({ error: 'Failed to list appointments' });
  }
}

async function getAppointment(req, res) {
  try {
    const appt = await Appointment.findById(req.params.id).populate('patient', 'name contact email');
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    if (!canAccessAppointment(req, appt)) return res.status(403).json({ error: 'Forbidden' });
    return res.json(appt);
  } catch (err) {
    console.error('Get appointment error:', err);
    return res.status(500).json({ error: 'Failed to get appointment' });
  }
}

async function createAppointment(req, res) {
  try {
    const { patientId, doctorId, clientId, startAt, endAt, status, notes } = req.body;
    if (!patientId || !startAt) return res.status(400).json({ error: 'patientId and startAt are required' });

    const role = req.user.role;
    let doctor = req.user.id;
    let client = req.user.client || undefined;

    if (role === 'admin') {
      if (doctorId) doctor = doctorId;
      if (clientId) client = clientId;
    } else if (role === 'subadmin') {
      client = req.user.client;
      if (doctorId) doctor = doctorId;
    }

    const patient = await Patient.findById(patientId).select('doctor client');
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    // doctor defaults to patient's doctor
    if (!doctor) doctor = patient.doctor?.toString();
    if (!client) client = patient.client?.toString();

    // Check for scheduling conflicts
    const conflicts = await checkAppointmentConflicts(doctor, startAt, endAt);
    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map(c => ({
        id: c._id,
        patient: c.patient?.name || 'Unknown',
        startAt: c.startAt,
        endAt: c.endAt,
        treatmentType: c.treatmentType
      }));
      return res.status(409).json({ 
        error: 'Appointment conflict detected. Another appointment exists within 20 minutes of this time slot.',
        conflicts: conflictDetails,
        message: `Cannot schedule: ${conflicts.length} conflicting appointment(s) found. Please choose a different time slot with at least 20 minutes gap.`
      });
    }

    const appt = await Appointment.create({
      patient: patientId,
      doctor,
      client,
      startAt: new Date(startAt),
      endAt: endAt ? new Date(endAt) : undefined,
      status: status || 'scheduled',
      notes,
      createdBy: req.user.id,
    });
    
    // Send SMS confirmation (async, don't wait)
    try {
      const fullPatient = await Patient.findById(patientId).select('name contact');
      const doctorUser = await User.findById(doctor).select('name');
      
      if (fullPatient && fullPatient.contact && doctorUser) {
        const appointmentDate = new Date(startAt);
        const appointmentData = {
          patientName: fullPatient.name,
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
          doctorName: doctorUser.name,
          clinicName: process.env.CLINIC_NAME || 'Smilify Dental'
        };
        
        sendAppointmentConfirmation(fullPatient.contact, appointmentData)
          .then(result => {
            if (result.success) {
              console.log(`SMS confirmation sent for appointment ${appt._id}`);
            }
          })
          .catch(err => console.error('Failed to send SMS confirmation:', err));
      }
    } catch (smsError) {
      // Don't fail the appointment creation if SMS fails
      console.error('SMS sending error:', smsError);
    }
    
    return res.status(201).json(appt);
  } catch (err) {
    console.error('Create appointment error:', err);
    return res.status(500).json({ error: 'Failed to create appointment' });
  }
}

async function updateAppointment(req, res) {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    if (!canAccessAppointment(req, appt)) return res.status(403).json({ error: 'Forbidden' });

    const { startAt, endAt, status, notes, doctorId, clientId } = req.body;
    
    // Store old values for SMS notification
    const oldStartAt = appt.startAt;
    const oldStatus = appt.status;
    const wasRescheduled = startAt !== undefined && new Date(startAt).getTime() !== oldStartAt.getTime();
    const wasCancelled = status === 'cancelled' && oldStatus !== 'cancelled';
    
    // Check for conflicts if time or doctor is being changed
    if ((startAt !== undefined || endAt !== undefined || doctorId !== undefined)) {
      const newStartAt = startAt !== undefined ? startAt : appt.startAt;
      const newEndAt = endAt !== undefined ? endAt : appt.endAt;
      const newDoctor = doctorId !== undefined ? doctorId : appt.doctor?.toString();
      
      const conflicts = await checkAppointmentConflicts(newDoctor, newStartAt, newEndAt, appt._id);
      if (conflicts.length > 0) {
        const conflictDetails = conflicts.map(c => ({
          id: c._id,
          patient: c.patient?.name || 'Unknown',
          startAt: c.startAt,
          endAt: c.endAt,
          treatmentType: c.treatmentType
        }));
        return res.status(409).json({ 
          error: 'Appointment conflict detected. Another appointment exists within 20 minutes of this time slot.',
          conflicts: conflictDetails,
          message: `Cannot update: ${conflicts.length} conflicting appointment(s) found. Please choose a different time slot with at least 20 minutes gap.`
        });
      }
    }
    
    if (startAt !== undefined) appt.startAt = startAt ? new Date(startAt) : appt.startAt;
    if (endAt !== undefined) appt.endAt = endAt ? new Date(endAt) : undefined;
    if (status !== undefined) appt.status = status;
    if (notes !== undefined) appt.notes = notes;

    if (doctorId !== undefined && (req.user.role === 'admin' || req.user.role === 'subadmin')) {
      appt.doctor = doctorId || appt.doctor;
    }
    if (clientId !== undefined && req.user.role === 'admin') {
      appt.client = clientId || appt.client;
    }

    await appt.save();
    
    // Send SMS notification (async, don't wait)
    try {
      const fullPatient = await Patient.findById(appt.patient).select('name contact');
      const doctorUser = await User.findById(appt.doctor).select('name');
      
      if (fullPatient && fullPatient.contact && doctorUser) {
        if (wasCancelled) {
          // Send cancellation SMS
          const appointmentData = {
            patientName: fullPatient.name,
            date: oldStartAt.toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            time: oldStartAt.toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            reason: notes || ''
          };
          
          sendAppointmentCancellation(fullPatient.contact, appointmentData)
            .then(result => {
              if (result.success) {
                console.log(`SMS cancellation sent for appointment ${appt._id}`);
              }
            })
            .catch(err => console.error('Failed to send SMS cancellation:', err));
        } else if (wasRescheduled) {
          // Send rescheduling SMS
          const appointmentData = {
            patientName: fullPatient.name,
            oldDate: oldStartAt.toLocaleDateString('en-IN', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            }),
            oldTime: oldStartAt.toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            newDate: appt.startAt.toLocaleDateString('en-IN', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            }),
            newTime: appt.startAt.toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            doctorName: doctorUser.name
          };
          
          sendAppointmentRescheduled(fullPatient.contact, appointmentData)
            .then(result => {
              if (result.success) {
                console.log(`SMS reschedule notification sent for appointment ${appt._id}`);
              }
            })
            .catch(err => console.error('Failed to send SMS reschedule:', err));
        }
      }
    } catch (smsError) {
      // Don't fail the appointment update if SMS fails
      console.error('SMS sending error:', smsError);
    }
    
    return res.json(appt);
  } catch (err) {
    console.error('Update appointment error:', err);
    return res.status(500).json({ error: 'Failed to update appointment' });
  }
}

async function deleteAppointment(req, res) {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    if (!canAccessAppointment(req, appt)) return res.status(403).json({ error: 'Forbidden' });

    await Appointment.deleteOne({ _id: appt._id });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete appointment error:', err);
    return res.status(500).json({ error: 'Failed to delete appointment' });
  }
}

async function checkConflicts(req, res) {
  try {
    const { doctorId, startAt, endAt, excludeId } = req.query;
    if (!startAt) return res.status(400).json({ error: 'startAt is required' });
    
    const role = req.user.role;
    let doctor = doctorId || req.user.id;
    
    // Only admin/subadmin can check for other doctors
    if (role === 'doctor' && doctorId && doctorId !== req.user.id) {
      return res.status(403).json({ error: 'Cannot check appointments for other doctors' });
    }
    
    const conflicts = await checkAppointmentConflicts(doctor, startAt, endAt, excludeId);
    
    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map(c => ({
        id: c._id,
        patient: c.patient?.name || 'Unknown',
        contact: c.patient?.contact,
        startAt: c.startAt,
        endAt: c.endAt,
        treatmentType: c.treatmentType,
        status: c.status
      }));
      return res.json({ 
        hasConflicts: true,
        conflicts: conflictDetails,
        message: `${conflicts.length} appointment(s) found within 20 minutes of this time slot.`
      });
    }
    
    return res.json({ hasConflicts: false, conflicts: [], message: 'No conflicts found' });
  } catch (err) {
    console.error('Check conflicts error:', err);
    return res.status(500).json({ error: 'Failed to check conflicts' });
  }
}

module.exports = { listAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment, checkConflicts };
