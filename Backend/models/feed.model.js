const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }   // <-- keep timestamps only
);

// TTL: 15 days (in seconds)
feedSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 15 });

module.exports = mongoose.model("Feeds", feedSchema);
