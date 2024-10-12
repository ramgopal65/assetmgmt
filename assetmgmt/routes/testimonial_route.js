const express = require('express');
const router = express.Router();

const testimonial = require('./testimonial');
router.use('/assetmgmt/testimonial', testimonial);

// Health
router.get('/assetmgmt/health', (req, res, next) => {
    res.send({ code: 200, message: 'healthy' });
});

module.exports = router;