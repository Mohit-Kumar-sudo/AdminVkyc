const express = require('express')
const router = express.Router()
const Controller = require('../Controller/Course.Controller.js')
const { verifyAccessToken } = require('../helpers/jwt_helpers.js')

// PUBLIC ROUTES (No authentication needed)
router.post('/', Controller.create) // User enrollment
router.post('/verify-payment/:id', Controller.verifyPayment) // Payment verification
router.get('/download-receipt/:id', Controller.downloadReceipt) // Receipt download

// PROTECTED ROUTES (Require authentication - Admin only)
router.get('/:id', verifyAccessToken, Controller.get)
router.get('/', verifyAccessToken, Controller.list)
router.put('/:id', verifyAccessToken, Controller.update)
router.delete('/:id', verifyAccessToken, Controller.delete)
router.put('/:id/restore', verifyAccessToken, Controller.restore)

module.exports = router