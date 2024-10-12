const express = require('express');
const router = express.Router();
const settings = require('./setting');
const applications = require('./application');

router.use('/bootstrap/setting', settings);
router.use('/bootstrap/application', applications);

// Health
router.get('/bootstrap/health', (req, res, next) => {
    res.send({ code: 200, message: 'healthy' });
});

module.exports = router;