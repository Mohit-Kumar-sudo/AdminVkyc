const router = require('express').Router()
const Controller = require('../controllers/slide.Controller')
const upload = require("../Helpers/multer");

router.post("/", upload.single("image"), Controller.create);

router.get("/", Controller.get);

router.delete("/:id", Controller.delete);

module.exports = router