const { Schema, model, Types } = require('mongoose');

const ROLES = ['admin', 'subadmin', 'doctor'];
const MODULES = ['patients', 'appointments', 'users', 'clients', 'dashboard'];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, unique: true, index: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true, unique: true, sparse: true, index: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    role: { type: String, enum: ROLES, default: 'doctor', index: true },
    client: { type: Types.ObjectId, ref: 'Client', index: true },
    permissions: {
      type: [String],
      enum: MODULES,
      default: function() {
        if (this.role === 'admin') return MODULES;
        return ['dashboard', 'patients', 'appointments'];
      }
    },
    imageConversionLimit: {
      type: Number,
      default: 10, 
      min: 0
    },
    imageConversionsUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    },
    canShowImprovementPlans: {
      type: Boolean,
      default: true
    },
    googleId: { type: String, index: true, sparse: true },
    photoUrl: { type: String, trim: true },
    subscriptionPlan: { type: String, enum: ['Free', 'Pro', 'Enterprise'], default: 'Free' },
    subscriptionStatus: { type: String, enum: ['active', 'past_due', 'canceled'], default: 'active' },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    },
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);

