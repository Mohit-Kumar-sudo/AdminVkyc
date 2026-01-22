const { Schema, model, Types } = require('mongoose');

const appointmentSchema = new Schema(
  {
    patient: { type: Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctor: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    client: { type: Types.ObjectId, ref: 'Client', index: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date },
    treatmentType: { 
      type: String, 
      enum: ['cleaning', 'checkup', 'filling', 'root-canal', 'crown', 'extraction', 'orthodontics', 'whitening', 'other'],
      default: 'checkup'
    },
    duration: { type: Number, default: 30 }, // in minutes
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no-show'], default: 'scheduled', index: true },
    notes: { type: String, trim: true },
    reminderSent: { type: Boolean, default: false },
    aiSuggested: { type: Boolean, default: false }, // Track if appointment was AI-suggested
    createdBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = model('Appointment', appointmentSchema);
