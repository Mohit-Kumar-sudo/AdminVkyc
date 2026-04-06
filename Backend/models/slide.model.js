const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
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

module.exports = mongoose.model('slides', slideSchema);
