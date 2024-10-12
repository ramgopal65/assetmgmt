const express = require('express');
const Router = express.Router();
const CommonConstants = require('../../common/constant/constant');
const Constants = require('../constant/constant');
const NotificationController = require('./controllers/notification');
const ResponseInterceptor = require('../../interceptors/res-send');

// HEALTH
Router.get('/health', (req, res) => {
    res.json({ code: 200, message: 'Healthy' });
});

//CREATE OR SEND A NOTIFICATION
Router.post(
    '/sms',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                resource: Constants.NOTIFICATION.APP_ACTION.RESOURCE.NOTIFICATION,
                action : Constants.NOTIFICATION.APP_ACTION.ACTION.NOTIFICATION.SEND_SMS
            }
        };
        next();
    },
    NotificationController.sendSMS,
    ResponseInterceptor.sendResponse
);

Router.post(
    '/sms-gateway-local',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                resource: Constants.NOTIFICATION.APP_ACTION.RESOURCE.NOTIFICATION,
                action: Constants.NOTIFICATION.APP_ACTION.ACTION.NOTIFICATION.SEND_SMS_LOCAL
            }
        };
        next();
    },
    NotificationController.sendLocalSMS,
    ResponseInterceptor.sendResponse
);

//CREATE OR SEND AN EMAIL OTP
Router.post(
    '/email',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                resource: Constants.NOTIFICATION.APP_ACTION.RESOURCE.NOTIFICATION,
                action: Constants.NOTIFICATION.APP_ACTION.ACTION.NOTIFICATION.SEND_EMAIL
            }
        };
        next();
    },
    NotificationController.sendEMail,
    ResponseInterceptor.sendResponse
);

module.exports = Router;