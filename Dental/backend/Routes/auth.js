const express = require('express');
const { register, login, forgotPassword, resetPassword, googleLogin, googleRegister } = require('../Controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/google-register', googleRegister);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
