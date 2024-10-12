const express = require('express');
const router = express.Router();

const notification = require('./notification');

router.use('/notification', notification);

module.exports = router;