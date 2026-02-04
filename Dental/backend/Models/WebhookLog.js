const mongoose = require('mongoose');

const webhookLogSchema = new mongoose.Schema({
  provider: { type: String, enum: ['razorpay', 'stripe'], required: true },
  eventId: { type: String, required: true, index: true },
  eventType: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['received', 'processed', 'failed', 'retried'], required: true, index: true },
  retries: { type: Number, default: 0 },
  lastError: { type: String },
  processedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

webhookLogSchema.index({ provider: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('WebhookLog', webhookLogSchema);