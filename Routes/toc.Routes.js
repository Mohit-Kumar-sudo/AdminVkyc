const express = require('express')
const routes = express.Router()

const tocController = require('../Controllers/toc.Controller')

routes.get('/:rid/content', tocController.getContentByKey)

module.exports = routes;