const mongoose = require("mongoose");

const carriersSchema = mongoose.Schema(
  {
    jobTitle: { type: String, index: true },
    jobRole: { type: String}, 
    jobDuration: { type: Number},
    jobLocation: { type: String},
    jobSkills: { type: String},
    jobExperience: { type: Number},
    jobType: { type: String},
    jobPreference: { type: String},
    jobDescription: { type: String},
    jobSalary: { type: Number},
    is_active: { type: Boolean, default: true, index: true },
    status: { type: String },
    created_at: { type: Date, default: Date.now },  
    created_by: { type: mongoose.Schema.Types.ObjectId, default: null },  
    updated_at: { type: Date, default: Date.now },
    updated_by: { type: String, default: 'self' },
  },
  {
    timestamps: true,
    collection: "carriers",
  }
);

module.exports = mongoose.model("Carriers", carriersSchema);