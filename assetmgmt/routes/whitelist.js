const Express = require('express');
const Router = Express.Router();
const CommonConstants = require('../../common/constant/constant');
const RequestAuthInterceptor = require('../interceptors/req-auth');
const ResponseSendInterceptor = require('../../interceptors/res-send');
const WhitelistController = require('./controllers/whitelist');
const RejectData = require('../../common/response/reject-data');
const Constants = require('../constant/constant');

const multer = require('multer');
const upload = multer();

Router.put(
    '/',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initiliazeWhitelistEndpoints(req, Constants.ASSETMGMT.APP_ACTION.ACTION.WHITELIST.CREATE.API_NAME, Constants.ASSETMGMT.APP_ACTION.ACTION.WHITELIST.CREATE.CALLER_LOCATION)
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerForWhitelist,
    WhitelistController.createOne,
    ResponseSendInterceptor.sendResponse
);

//Create multiple entries for whitelists
Router.put(
    '/onboard',
    (req, res, next) => {
        RequestAuthInterceptor.initiliazeWhitelistEndpoints(req, Constants.ASSETMGMT.APP_ACTION.ACTION.WHITELIST.CREATE_MULTIPLE.API_NAME, Constants.ASSETMGMT.APP_ACTION.ACTION.WHITELIST.CREATE_MULTIPLE.CALLER_LOCATION)
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerForWhitelist,
    upload.single('file'),
    WhitelistController.createMultiple,
    ResponseSendInterceptor.sendResponse
);

//Get one phone number from the whitelisted data
Router.post(
    '/',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initiliazeWhitelistEndpoints(req, Constants.ASSETMGMT.APP_ACTION.ACTION.WHITELIST.READ.API_NAME, Constants.ASSETMGMT.APP_ACTION.ACTION.WHITELIST.READ.CALLER_LOCATION)
        next();
    },
    WhitelistController.getOneWhitelistedUser,
    ResponseSendInterceptor.sendResponse
);

//Update the coach phone number in whitelisted data
Router.patch(
    '/update-coach',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initiliazeWhitelistEndpoints(req, Constants.ASSETMGMT.APP_ACTION.ACTION.WHITELIST.UPDATE_ONE.API_NAME, Constants.ASSETMGMT.APP_ACTION.ACTION.WHITELIST.UPDATE_ONE.CALLER_LOCATION)
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerForWhitelist,
    WhitelistController.updateCoach,
    ResponseSendInterceptor.sendResponse
);

//Delete one entry from the database
Router.delete(
    '/',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initiliazeWhitelistEndpoints(req, Constants.ASSETMGMT.APP_ACTION.ACTION.WHITELIST.DELETE.API_NAME, Constants.ASSETMGMT.APP_ACTION.ACTION.WHITELIST.DELETE.CALLER_LOCATION)
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerForWhitelist,
    WhitelistController.deleteOneWhitelistedUser,
    ResponseSendInterceptor.sendResponse
);

//Delete one entry from the database
Router.delete(
    '/multiple',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initiliazeWhitelistEndpoints(req, Constants.ASSETMGMT.APP_ACTION.ACTION.WHITELIST.DELETE_MULTIPLE.API_NAME, Constants.ASSETMGMT.APP_ACTION.ACTION.WHITELIST.DELETE_MULTIPLE.CALLER_LOCATION)
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerForWhitelist,
    WhitelistController.deleteMultiple,
    ResponseSendInterceptor.sendResponse
);
module.exports = Router;