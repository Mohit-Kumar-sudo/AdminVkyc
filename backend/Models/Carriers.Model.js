const mongoose = require("mongoose");

const carriersSchema = mongoose.Schema(
  {
    jobTitle: { type: String, index: true },
    jobRole: { type: String, required: true }, // Fixed from jonRole to jobRole
    jobDuration: { type: Number, required: true },
    jobLocation: { type: String, required: true },
    jobSkills: { type: String, required: true },
    jobExperience: { type: Number, required: true },
    jobType: { type: String, required: true },
    jobPreference: { type: String, required: true },
    jobDescription: { type: String, required: true },
    jobSalary: { type: Number, required: true },
    is_active: { type: Boolean, default: true, index: true },
    status: { type: String },
    created_at: { type: Date, default: Date.now },  // Fixed from Date.now() to Date.now
    created_by: { type: mongoose.Schema.Types.ObjectId, default: null },  // Fixed from Types.ObjectId
    updated_at: { type: Date, default: Date.now },  // Fixed from Date.now() to Date.now
    updated_by: { type: String, default: 'self' },
  },
  {
    timestamps: true,
    collection: "carriers",
  }
);

module.exports = mongoose.model("Carriers", carriersSchema);