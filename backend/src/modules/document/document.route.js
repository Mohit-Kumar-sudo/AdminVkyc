const express = require("express");
const multer = require("multer");
const path = require("path");
const controllers = require("./document.controller");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage }).single("document");

router.post("/upload", upload, controllers.uploadDocx);

router.get("/:id/images/:imageName", controllers.serveImage);

router.get("/:id/:sectionName/:reportId", controllers.getSection);

module.exports = router;
