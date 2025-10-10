const express = require('express')
const router = express.Router()
const Controller = require('../Controller/Auth.Controller')
const { verifyAccessToken } = require('../helpers/jwt_helpers')

router.post('/register', Controller.register)

router.post('/login', Controller.login)

// Password reset route - can be used without token for admin panel
router.post('/reset-password', Controller.resetPassword)

// Change password route - requires authentication
router.post('/change-password', verifyAccessToken, Controller.changePassword)

// Forgot password route - for future email-based reset
router.post('/forgot-password', Controller.forgotPassword)

module.exports = router