const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['new_feed', 'feed_update', 'feed_delete'],
    default: 'new_feed'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  feedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feeds',
    required: true
  },
  feedImage: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);