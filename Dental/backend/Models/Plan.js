const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  price: { type: Number, required: true },
  currency: { type: String, required: true },
  interval: { type: String, enum: ['month', 'year'], required: true },
  features: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive', 'archived'], required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  audit: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
});

module.exports = mongoose.model('Plan', planSchema);