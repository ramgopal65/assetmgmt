'use strict';

const Config = require('./config/config');
const routes = require('./routes/testimonial_route');

const SettingsMap = require('../common/wrappers/bootstrap/settings-map');
const SettingsKeysCommon = require('../common/setting/keys');

// Express app setup
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');

var app = express();
app.use(express.raw());

//app.use(bodyParser.json({ limit: '210mb' }));
//app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(helmet.frameguard({ action: 'deny' }));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Headers', SettingsMap.get(SettingsKeysCommon.COMMON.HTTP.CORS.ACCESS_CONTROL_ALLOW.HEADERS));
    res.header('Access-Control-Allow-Methods', SettingsMap.get(SettingsKeysCommon.COMMON.HTTP.CORS.ACCESS_CONTROL_ALLOW.METHODS));
    const allowedOrigins = SettingsMap.get(SettingsKeysCommon.COMMON.HTTP.CORS.ACCESS_CONTROL_ALLOW.ORIGIN_ALLOWED);

    if (!req.headers.origin) {
        res.header('Access-Control-Allow-Origin', req.headers.host);
    } else if (!SettingsMap.get(SettingsKeysCommon.COMMON.HTTP.CORS.ACCESS_CONTROL_ALLOW.ENABLED)) {
        if (allowedOrigins.includes(req.headers.origin)) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
        } else {
            console.log('CORS : Access-Control-Allow-Origin is not set for the origin : ' + req.headers.origin);
            console.log('Allowed origin are ' + allowedOrigins);
        }
    } else {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
    }

    res.header('Cache-Control', SettingsMap.get(SettingsKeysCommon.COMMON.HTTP.CORS.CACHE.CACHE_CONTROL));
    res.header('X-Content-Type-Options', SettingsMap.get(SettingsKeysCommon.COMMON.HTTP.CORS.X_CONTENT_TYPE_OPTIONS));
    res.header('X-Frame-Options', SettingsMap.get(SettingsKeysCommon.COMMON.HTTP.CORS.X_FRAME_OPTIONS));
    res.header('X-XSS-Protection', SettingsMap.get(SettingsKeysCommon.COMMON.HTTP.CORS.X_XSS_PROTECTION));
    next();
});

// Block restricted methods
app.use(function onrequest(req, res, next) {
    const allowedMethods = (SettingsMap.get(SettingsKeysCommon.COMMON.HTTP.CORS.ACCESS_CONTROL_ALLOW.METHODS)).split(', ');
    if (!allowedMethods.includes(req.method)) {
        let err = new Error('Method Not Allowed');
        err.status = 405;
        next(err);
    }
    next();
});


app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found - ' + req.url);
    err.status = 404;
    next(err);
});

module.exports = app;