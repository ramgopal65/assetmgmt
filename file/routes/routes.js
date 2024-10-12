const express = require('express');
const router = express.Router();
const files = require('./file');
router.use('/file', files);

module.exports = router;