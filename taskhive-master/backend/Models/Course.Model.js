const mongoose = require("mongoose");

const courseQuerySchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    countryCode: { type: String, required: true },
    number: { type: Number, required: true },
    price: { type: String },
    course: { type: String, required: true },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    // --- NEW FIELDS FOR PAYMENT TRACKING ---
    payment_status: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'abandoned'],
      default: 'pending'
    },
    bundle_purchased: {
      type: Boolean,
      default: false
    },
    total_amount: {
      type: Number,
      required: true
    },
    razorpay_order_id: {
      type: String
    },
    razorpay_payment_id: {
      type: String
    },
    razorpay_signature: {
      type: String
    }
    // --- END OF NEW FIELDS ---
  },
  {
    timestamps: true,
    collection: "course-query",
  }
);

module.exports = mongoose.model("CourseQuery", courseQuerySchema);