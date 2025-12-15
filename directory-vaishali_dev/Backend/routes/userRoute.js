const router = require('express').Router()
const Controller = require('../controllers/auth.Controller')
const { verifyAccessToken } = require('../Helpers/jwt_helper')
const upload = require("../Helpers/multer");

router.post('/login', Controller.login)

router.post('/refresh-token', Controller.refreshToken)

router.get('/profile', verifyAccessToken, Controller.profile)

router.post("/upload-users", upload.single("file"), Controller.bulkUser);

router.post("/add-user", Controller.addUser);

router.get("/search", Controller.searchUsers);

router.get("/", Controller.getUsers);

router.get("/:id", Controller.getUserById);

router.put("/:sNo", upload.single("image"),Controller.updateUser);

router.put("/delete/:id", Controller.deleteUser);

router.put("/active/:id", Controller.activeUser);

// router.post("/reset-password", Controller.resetPassword);

router.post("/update-password", Controller.updatePassword);

router.post("/send-otp", Controller.sendOtp);

router.post("/verify-otp", Controller.verifyOtp);


module.exports = router