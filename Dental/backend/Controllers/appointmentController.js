const Appointment = require('../Models/Appointment');
const Patient = require('../Models/Patient');

function canAccessAppointment(req, appt) {
  const role = req.user.role;
  if (role === 'admin') return true;
  if (role === 'subadmin') return appt.client?.toString() === req.user.client;
  return appt.doctor?.toString() === req.user.id;
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

module.exports = { listAppointments, getAppointment, createAppointment, updateAppointment, deleteAppointment };
