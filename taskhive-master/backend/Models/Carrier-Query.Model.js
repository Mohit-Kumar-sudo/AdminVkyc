const mongoose = require("mongoose");

const carrierQuerySchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    countryCode: { type: String, required: true},
    number: { type: Number, required: true },
    email: { type: String, required: true },
    linkedin: { type: String, required: true },
    category: { type: String, required: true },
    experience: { type: Number, required: true },
    resume: { type:String, required: true },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "carrier-query", // <-- ADD THIS LINE
  }
);

module.exports = mongoose.model("CarrierQuery", carrierQuerySchema);
