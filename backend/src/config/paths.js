// backend/src/config/paths.js
const path = require("path");

// __dirname here points to src/config
const projectRoot = process.cwd();

module.exports = {
  uploadsHtml: path.join(projectRoot, "uploads", "html"),
  uploadsImages: path.join(projectRoot, "uploads", "images")
};

