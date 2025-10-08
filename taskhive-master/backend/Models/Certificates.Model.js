const mongoose = require('mongoose');

const certificatesSchema = new mongoose.Schema({
  certification_id: {
    type: String,
    unique: true,
    index: true,
    required: true
  },
  server_id: {
    type: String,
    required: true
  },
  lms_id: {
    type: String,
    required: true
  },
  'First Name': {
    type: String,
    required: true
  },
  'Last Name': {
    type: String,
    required: true
  },
  user_id: {
    type: String,
    unique: true,
    sparse: true
  },
  'Course Title': {
    type: String,
    required: true
  },
  certification_date: {
    type: Date,
    required: true
  },
  course_id: {
    type: String,
    required: true
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'pending', 'expired', 'revoked', 'suspended'],
    default: 'active'
  },
  is_active: { type: Boolean, default: true, index: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
}, 
{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Middleware to auto-generate certification_id and user_id before saving
// Use function() to access `this`
certificatesSchema.pre('validate', async function(next) {
  try {
    const doc = this;

    if (doc.isNew) {
      // Generate certification_id if missing
      if (!doc.certification_id) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let generated = null;
        let tries = 0;

        // Try a few times to avoid collision (production: consider UUIDv4)
        do {
          generated = Array.from({ length: 10 }, () =>
            chars[Math.floor(Math.random() * chars.length)]
          ).join('');
          // check existence
          // Use the model name exactly as exported below (Certificates)
          const exists = await mongoose.models.Certificates?.findOne({ certification_id: generated }).lean();
          if (!exists) break;
          tries++;
        } while (tries < 10);

        if (!generated) {
          // fallback: use timestamp-based id to avoid failing creation
          generated = `C${Date.now()}`;
        }

        doc.certification_id = generated;
      }

      // user_id generation (same as before, defensive)
      if (!doc.user_id) {
        try {
          const firstNameInitial = (doc['First Name'] || '').charAt(0).toUpperCase() || 'X';
          const lastNameInitial = (doc['Last Name'] || '').charAt(0).toUpperCase() || 'X';
          const certId = doc.certification_id || 'XXXX';
          const date = doc.certification_date ? new Date(doc.certification_date) : new Date();
          const formattedDate = `${date.getFullYear().toString().substr(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}${date.getHours().toString().padStart(2, '0')}`;
          doc.user_id = `${firstNameInitial}${lastNameInitial}-${certId.substring(0, 4)}-${certId.substring(4, 7)}-${certId.substring(7)}-${formattedDate}`;
        } catch (e) {
          doc.user_id = `XX-${doc.certification_id || 'UNKNOWN'}`;
        }
      }
    }

    // let validation proceed
    next();
  } catch (err) {
    next(err);
  }
});


module.exports = mongoose.model('Certificates', certificatesSchema);