const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
  number: { type: String },
  title: { type: String, required: true },
  content: { type: String },
  subSections: [{ type: mongoose.Schema.Types.Mixed }],
});

const DocumentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },   // original DOCX name
  filePath: { type: String, required: true },   // path to original DOCX
  htmlPath: { type: String },                   // 🔹 path to generated HTML
  reportTitle: { type: String },
  sections: [SectionSchema],
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Document", DocumentSchema);
