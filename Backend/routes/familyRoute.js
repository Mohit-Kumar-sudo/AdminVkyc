const router = require('express').Router()
const Controller = require('../controllers/family.Controller')
const upload = require("../Helpers/multer");

router.post("/upload-family", upload.single("file"), Controller.createBulk);

router.post("/singleMember", Controller.create);

router.get("/:sNo", Controller.getBySNo);

router.put("/:sNo/:memberId", upload.single("image"), Controller.updateFamily);

module.exports = router