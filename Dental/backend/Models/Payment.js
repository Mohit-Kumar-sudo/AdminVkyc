const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: false, index: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: false, index: true },
  provider: { type: String, enum: ['razorpay', 'stripe'], required: true },
  providerOrderId: { type: String, index: true },
  providerPaymentId: { type: String, required: true, unique: true, index: true },
  baseAmount: { type: Number, required: true },
  gstAmount: { type: Number, required: true, default: 0 },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], required: true, index: true },
  paymentDate: { type: Date },
  rawWebhookData: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  audit: {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
});

module.exports = mongoose.model('Payment', paymentSchema);