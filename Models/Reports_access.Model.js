const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the schema for report access
const ReportAccessSchema = new Schema(
  {
    reportIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "reports" }],
    },
    charts: {
      type: [{ type: Object }],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Export the model
const ReportAccess = mongoose.model("ReportAccess", ReportAccessSchema);
module.exports = ReportAccess;