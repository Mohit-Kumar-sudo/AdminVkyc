const express = require('express')
const router = express.Router()
const Controller = require('../Controllers/data.controller')

router.get('/', Controller.getDeedCategory)
router.get('/:id', Controller.getAllDeedTypeByCategoryId) 
router.get('/Instrument/:id', Controller.deedInstruments)
router.get('/roles/:id', Controller.partyRoles)
router.post('/redirectionAdmin', Controller.userAuthenticate)

module.exports = router
