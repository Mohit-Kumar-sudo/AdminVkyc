const { Schema, model, Types } = require('mongoose');

const ROLES = ['admin', 'subadmin', 'doctor'];
const MODULES = ['patients', 'appointments', 'users', 'clients', 'dashboard'];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, unique: true, index: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    role: { type: String, enum: ROLES, default: 'doctor', index: true },
    client: { type: Types.ObjectId, ref: 'Client', index: true },
    permissions: {
      type: [String],
      enum: MODULES,
      default: function() {
        // Admin gets all permissions by default
        if (this.role === 'admin') return MODULES;
        // Others get basic permissions
        return ['dashboard', 'patients', 'appointments'];
      }
    },
    // Image conversion limits for doctors
    imageConversionLimit: {
      type: Number,
      default: 10, // Default limit per month
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
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);

