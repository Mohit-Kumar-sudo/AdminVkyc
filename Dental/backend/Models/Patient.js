const { Schema, model, Types } = require('mongoose');

const imageSchema = new Schema(
  {
    filename: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number },
    width: { type: Number },
    height: { type: Number },
    mimeType: { type: String },
  },
  { _id: false }
);

const beforeAfterImageSchema = new Schema(
  {
    type: { type: String, enum: ['before', 'after'], required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number },
    width: { type: Number },
    height: { type: Number },
    mimeType: { type: String },
    treatmentDate: { type: Date },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const monthlyTreatmentSchema = new Schema(
  {
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    treatmentType: { 
      type: String, 
      enum: ['IMPLANTS', 'SMILE DESIGNING', 'TEETH WHITENING', 'BRACES', 'OTHER'],
      required: true 
    },
    treatmentsPlan: { type: String, trim: true, required: true },
    treatmentsCompleted: { type: String, trim: true },
    improvements: { type: String, trim: true },
    notes: { type: String, trim: true },
    nextSteps: { type: String, trim: true },
    recordedBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const testimonialSchema = new Schema(
  {
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, required: true, trim: true },
    treatmentType: { 
      type: String, 
      enum: ['IMPLANTS', 'SMILE DESIGNING', 'TEETH WHITENING', 'BRACES', 'OTHER'],
      required: true 
    },
    isPublished: { type: Boolean, default: false },
    recordedBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const patientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    dob: { type: Date },
    email: { type: String, lowercase: true, trim: true },
    contact: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    disease: { type: String, trim: true },
    history: { type: String, trim: true },
    prescription: { type: String, trim: true },
    images: [imageSchema],
    beforeAfterImages: [beforeAfterImageSchema],
    monthlyTreatments: [monthlyTreatmentSchema],
    testimonials: [testimonialSchema],
    doctor: { type: Types.ObjectId, ref: 'User', index: true },
    client: { type: Types.ObjectId, ref: 'Client', index: true },
    createdBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = model('Patient', patientSchema);
