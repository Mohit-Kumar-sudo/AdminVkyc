const router = require("express").Router();
const Controller = require("../controllers/whatsapp.Controller");

router.post("/", Controller.create); 

module.exports = router;
