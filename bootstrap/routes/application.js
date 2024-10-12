const Express = require('express');
const Router = Express.Router();
const RequestAuthInterceptor = require('../interceptors/req-auth');
const ResponseSendInterceptor = require('../../interceptors/res-send');
const ApplicationController = require('./controllers/application');
const CommonConstants = require('../../common/constant/constant');
const Constants = require('../constant/constant');

// Application
Router.get(
    '/',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                action: Constants.BOOTSTRAP.APP_ACTION.ACTION.APPLICATION.GET_ALL,
                resource: Constants.BOOTSTRAP.APP_ACTION.RESOURCE.APPLICATION
            }
        };
        next();
    },
    RequestAuthInterceptor.authenticateApplication,
    ApplicationController.getAll,
    ResponseSendInterceptor.sendResponse
);
Router.get(
    '/:_id',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                action: Constants.BOOTSTRAP.APP_ACTION.ACTION.APPLICATION.GET_ONE_BY_ID,
                resource: Constants.BOOTSTRAP.APP_ACTION.RESOURCE.APPLICATION
            }
        };
        next();
    },
    RequestAuthInterceptor.authenticateApplication,
    ApplicationController.getOneById,
    ResponseSendInterceptor.sendResponse
);
Router.get(
    '/code/:code',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                action: Constants.BOOTSTRAP.APP_ACTION.ACTION.APPLICATION.GET_ONE_BY_CODE,
                resource: Constants.BOOTSTRAP.APP_ACTION.RESOURCE.APPLICATION
            }
        };
        next();
    },
    RequestAuthInterceptor.authenticateApplication,
    ApplicationController.getOneByCode,
    ResponseSendInterceptor.sendResponse
); 
Router.post(
    '/login',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                action: Constants.BOOTSTRAP.APP_ACTION.ACTION.APPLICATION.LOGIN,
                resource: Constants.BOOTSTRAP.APP_ACTION.RESOURCE.APPLICATION
            }
        };
        next();
    },
    ApplicationController.applicationLogin,
    ResponseSendInterceptor.sendResponse
); 


module.exports = Router;