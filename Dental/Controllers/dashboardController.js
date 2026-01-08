const Patient = require('../Models/Patient');
const Appointment = require('../Models/Appointment');

async function doctorSummary(req, res) {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'subadmin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const base = {};
    if (req.user.role === 'doctor') {
      base.doctor = req.user.id;
      if (req.user.client) base.client = req.user.client;
    } else if (req.user.role === 'subadmin') {
      base.client = req.user.client;
    }

    const now = new Date();

    const [patientsCount, upcomingCount, recentPatients, upcomingAppts] = await Promise.all([
      Patient.countDocuments({ ...base }),
      Appointment.countDocuments({ ...base, startAt: { $gte: now }, status: 'scheduled' }),
      Patient.find({ ...base }).sort({ createdAt: -1 }).limit(10),
      Appointment.find({ ...base, startAt: { $gte: now } }).sort({ startAt: 1 }).limit(10),
    ]);

    return res.json({
      patientsCount,
      upcomingAppointmentsCount: upcomingCount,
      recentPatients,
      upcomingAppointments: upcomingAppts,
    });
  } catch (err) {
    console.error('Doctor summary error:', err);
    return res.status(500).json({ error: 'Failed to load summary' });
  }
}

module.exports = { doctorSummary };
