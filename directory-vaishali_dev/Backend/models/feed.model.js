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
    expires: 60 * 60 * 24 * 15 
  }
}, { timestamps: true });

module.exports = mongoose.model('Feeds', feedSchema);
