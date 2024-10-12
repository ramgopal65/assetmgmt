const express = require('express');
const router = express.Router();

//Swagger Documentation
const architecture = require('./architecture');
router.use('/assetmgmt/architecture', architecture);

const documentation = require('./api-doc');
router.use('/assetmgmt/api-doc', documentation);

const user = require('./user');
router.use('/assetmgmt/user', user);

const post = require('./post');
router.use('/assetmgmt/post', post);

const whitelist = require('./whitelist');
router.use('/assetmgmt/whitelist', whitelist);

const testimonial = require('./testimonial');
router.use('/assetmgmt/testimonial', testimonial);

const court = require('./court');
router.use('/assetmgmt/court', court);

// Health
router.get('/assetmgmt/health', (req, res, next) => {
    res.send({ code: 200, message: 'healthy' });
});

module.exports = router;