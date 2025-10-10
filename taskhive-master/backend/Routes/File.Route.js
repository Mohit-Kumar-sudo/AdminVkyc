const express = require("express");
const router = express.Router();
const FileController = require('../Controller/File.Controller')

router.post("/upload", FileController.upload);
router.post("/uploadDocument/:id", FileController.uploadDocument);

router.get("/download/:folder1/:folder2/:folder3/:filename", FileController.download);
router.get("/download/:folder/:filename", FileController.folderDownload);
router.get("/download/:filename", FileController.download);

module.exports = router;