const Express = require('express');
const Router = Express.Router();
const CommonConstants = require('../../common/constant/constant');
const RequestAuthInterceptor = require('../interceptors/req-auth');
const ResponseSendInterceptor = require('../../interceptors/res-send');
const SettingsController = require('./controllers/setting');
const Constants = require('../constant/constant');

Router.post(
    '/',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                action: Constants.BOOTSTRAP.APP_ACTION.ACTION.SETTING.CREATE_ONE,
                resource: Constants.BOOTSTRAP.APP_ACTION.RESOURCE.SETTING
            }
        };
        next();
    },
    RequestAuthInterceptor.authenticateApplication,
    SettingsController.create,
    ResponseSendInterceptor.sendResponse
);
//static API on top
Router.get(
    '/count',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                action: Constants.BOOTSTRAP.APP_ACTION.ACTION.SETTING.GET_ALL_COUNT,
                resource: Constants.BOOTSTRAP.APP_ACTION.RESOURCE.SETTING
            }
        };
        next();
    },
    RequestAuthInterceptor.authenticateApplication,
    SettingsController.getAllCount,
    ResponseSendInterceptor.sendResponse
);
Router.get(
    '/:applicationCode&:categoryCode&:property',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                action: Constants.BOOTSTRAP.APP_ACTION.ACTION.SETTING.GET_ONE_BY_APPCODE_CATCODE_PROPERTY,
                resource: Constants.BOOTSTRAP.APP_ACTION.RESOURCE.SETTING
            }
        };
        next();
    },
    RequestAuthInterceptor.authenticateApplication,
    SettingsController.getOne,
    ResponseSendInterceptor.sendResponse
);
Router.get(
    '/:sort&:select',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                action: Constants.BOOTSTRAP.APP_ACTION.ACTION.SETTING.GET_MANY_SORT_SELECT,
                resource: Constants.BOOTSTRAP.APP_ACTION.RESOURCE.SETTING
            }
        };
        next();
    },
    RequestAuthInterceptor.authenticateApplication,
    SettingsController.getAll,
    ResponseSendInterceptor.sendResponse
);
Router.get(
    '/:_id',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                action: Constants.BOOTSTRAP.APP_ACTION.ACTION.SETTING.GET_ONE_BY_ID,
                resource: Constants.BOOTSTRAP.APP_ACTION.RESOURCE.SETTING
            }
        };
        next();
    },
    RequestAuthInterceptor.authenticateApplication,
    SettingsController.getOneById,
    ResponseSendInterceptor.sendResponse
);
Router.post(
    '/search/count',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                action: Constants.BOOTSTRAP.APP_ACTION.ACTION.SETTING.SEARCH_COUNT,
                resource: Constants.BOOTSTRAP.APP_ACTION.RESOURCE.SETTING
            }
        };
        next();
    },
    RequestAuthInterceptor.authenticateApplication,
    SettingsController.searchCount,
    ResponseSendInterceptor.sendResponse
);

Router.post(
    '/search',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                action: Constants.BOOTSTRAP.APP_ACTION.ACTION.SETTING.SEARCH,
                resource: Constants.BOOTSTRAP.APP_ACTION.RESOURCE.SETTING
            }
        };
        next();
    },
    RequestAuthInterceptor.authenticateApplication,
    SettingsController.search,
    ResponseSendInterceptor.sendResponse
);
Router.put(
    '/:_id',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                action: Constants.BOOTSTRAP.APP_ACTION.ACTION.SETTING.UPDATE_ONE_BY_ID,
                resource: Constants.BOOTSTRAP.APP_ACTION.RESOURCE.SETTING
            }
        };
        next();
    },
    RequestAuthInterceptor.authenticateApplication,
    SettingsController.updateOneById,
    ResponseSendInterceptor.sendResponse
);
Router.delete(
    '/:_id',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                action: Constants.BOOTSTRAP.APP_ACTION.ACTION.SETTING.DELETE_ONE_BY_ID,
                resource: Constants.BOOTSTRAP.APP_ACTION.RESOURCE.SETTING
            }
        };
        next();
    },
    RequestAuthInterceptor.authenticateApplication,
    SettingsController.deleteOneById,
    ResponseSendInterceptor.sendResponse
);
Router.delete(
    '/',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                action: Constants.BOOTSTRAP.APP_ACTION.ACTION.SETTING.DELETE_MULTIPLE_BY_IDS,
                resource: Constants.BOOTSTRAP.APP_ACTION.RESOURCE.SETTING
            }
        };
        next();
    },
    RequestAuthInterceptor.authenticateApplication,
    SettingsController.deleteMultipleById,
    ResponseSendInterceptor.sendResponse
);

module.exports = Router;