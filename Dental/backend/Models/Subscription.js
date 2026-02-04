const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true, index: true },
  status: { type: String, enum: ['TRIAL', 'ACTIVE', 'PAST_DUE', 'EXPIRED', 'CANCELLED'], required: true, index: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  autoRenew: { type: Boolean, default: true },
  lastPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', index: true },
  nextBillingDate: { type: Date },
  cancellationReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  audit: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);