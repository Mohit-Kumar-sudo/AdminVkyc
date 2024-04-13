const express = require('express')
const router = express.Router()
const Controller = require('../Controllers/data.controller')

router.get('/', Controller.getDeedCategory)
router.get('/Instrument/:id', Controller.deedInstruments)
router.get('/roles/:id', Controller.partyRoles)
router.get('/redirect', Controller.userAuthenticate)
router.get('/:id', Controller.getAllDeedTypeByCategoryId)
router.get('/auth/:uid/:otp', Controller.validateUidOtp)

module.exports = router
