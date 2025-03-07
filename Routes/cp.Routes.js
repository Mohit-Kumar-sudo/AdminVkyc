const express = require('express');
const cpController = require('../Controllers/cp.Controller');

const router = express.Router();

router.post('/get_interconnect', cpController.sendInterConnects);
router.get('/:cid*?', cpController.getCompanyDetails);

module.exports = router;