const mongoose = require("mongoose");

const courseQuerySchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    countryCode: { type: String, required: true},
    number: { type: Number, required: true },
    price: { type: String, required: true },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    course: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "course-query", // <-- ADD THIS LINE
  }
);

module.exports = mongoose.model("CourseQuery", courseQuerySchema);
