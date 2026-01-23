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
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const next7Days = new Date(now);
    next7Days.setDate(next7Days.getDate() + 7);

    const [
      patientsCount, 
      upcomingCount, 
      todayCount,
      completedTodayCount,
      recentPatients, 
      upcomingAppts
    ] = await Promise.all([
      Patient.countDocuments({ ...base }),
      Appointment.countDocuments({ 
        ...base, 
        startAt: { $gte: now, $lte: next7Days }, 
        status: 'scheduled' 
      }),
      Appointment.countDocuments({
        ...base,
        startAt: { $gte: startOfToday, $lte: endOfToday },
        status: { $in: ['scheduled', 'completed'] }
      }),
      Appointment.countDocuments({
        ...base,
        startAt: { $gte: startOfToday, $lte: endOfToday },
        status: 'completed'
      }),
      Patient.find({ ...base }).sort({ createdAt: -1 }).limit(10),
      Appointment.find({ ...base, startAt: { $gte: now } })
        .sort({ startAt: 1 })
        .limit(10)
        .populate('patient', 'name contact'),
    ]);

    return res.json({
      patientsCount,
      upcomingAppointmentsCount: upcomingCount,
      todayAppointmentsCount: todayCount,
      completedTodayCount: completedTodayCount,
      recentPatients,
      upcomingAppointments: upcomingAppts,
    });
  } catch (err) {
    console.error('Doctor summary error:', err);
    return res.status(500).json({ error: 'Failed to load summary' });
  }
}

module.exports = { doctorSummary };
