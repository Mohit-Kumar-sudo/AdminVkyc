const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

feedSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 15 });


module.exports = mongoose.model('Feeds', feedSchema);
