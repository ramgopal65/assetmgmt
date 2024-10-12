const Express = require('express');
const Router = Express.Router();
const RequestAuthInterceptor = require('../interceptors/req-auth');
const ResponseSendInterceptor = require('../../interceptors/res-send');
const CourtController = require('./controllers/court');
const Constants = require('../constant/constant');

const multer = require('multer');
const upload = multer();

//Create one court
Router.put(
    '/',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initiliazeCourtEndpoints(
            req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.COURT.CREATE.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.COURT.CREATE.CALLER_LOCATION
        );
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerForCourt,
    CourtController.createOne,
    ResponseSendInterceptor.sendResponse
);

//Create multiple entries for courts
Router.put(
    '/onboard',
    (req, res, next) => {
        RequestAuthInterceptor.initiliazeCourtEndpoints(
            req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.COURT.CREATE_MULTIPLE.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.COURT.CREATE_MULTIPLE.CALLER_LOCATION
        );
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerForCourt,
    upload.single('file'),
    CourtController.createMultiple,
    ResponseSendInterceptor.sendResponse
);

//Get one court from the courts list
Router.get(
    '/',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initiliazeCourtEndpoints(
            req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.COURT.READ.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.COURT.READ.CALLER_LOCATION
        );
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerForCourt,
    CourtController.getOne,
    ResponseSendInterceptor.sendResponse
);

////Update the academy details in courts list
//Router.patch(
//    '/:_id',
//    Express.json(),
//    (req, res, next) => {
//        RequestAuthInterceptor.initiliazeCourtEndpoints(
//            req,
//            Constants.ASSETMGMT.APP_ACTION.ACTION.COURT.UPDATE_ONE.API_NAME,
//            Constants.ASSETMGMT.APP_ACTION.ACTION.COURT.UPDATE_ONE.CALLER_LOCATION
//        );
//        next();
//    },
//    RequestAuthInterceptor.authenticateCaller,
//    RequestAuthInterceptor.authorizeCallerForCourt,
//    CourtController.updateOne,
//    ResponseSendInterceptor.sendResponse
//);

//Delete one entry from the database
Router.delete(
    '/:_id',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initiliazeCourtEndpoints(
            req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.COURT.DELETE.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.COURT.DELETE.CALLER_LOCATION
        );
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerForCourt,
    CourtController.deleteOneById,
    ResponseSendInterceptor.sendResponse
);

module.exports = Router;