const express = require('express')
const router = express.Router()
const Controller = require('../Controller/Carriers.Controller')
const { verifyAccessToken } = require('../helpers/jwt_helpers')

// Public routes
router.get('/public', Controller.publicList)
router.get('/get/:id', Controller.publicGet)

// POST route without token verification for testing
router.post('/', verifyAccessToken, Controller.create)

// Protected routes
router.get('/:id', verifyAccessToken, Controller.get)
router.get('/', verifyAccessToken, Controller.list)
router.put('/:id', verifyAccessToken, Controller.update)
router.delete('/:id', verifyAccessToken, Controller.delete)
router.put('/:id/restore', verifyAccessToken, Controller.restore)

module.exports = router