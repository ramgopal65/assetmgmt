const Express = require('express');
const Router = Express.Router();
const CommonConstants = require('../../common/constant/constant');
const Constants = require('../constant/constant');
const RequestAuthInterceptor = require('../interceptors/req-auth');
const ResponseSendInterceptor = require('../../interceptors/res-send');
const PostController = require('./controllers/post');


Router.post(
    '/searchCount',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializePostEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.SEARCH_COUNT.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.SEARCH_COUNT.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.SEARCH_COUNT.CALLER_USER_SUBJECT_POST_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerPostRelation,
    PostController.searchCount,
    ResponseSendInterceptor.sendResponse
);


Router.post(
    '/search',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializePostEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.SEARCH.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.SEARCH.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.SEARCH.CALLER_USER_SUBJECT_POST_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerPostRelation,
    PostController.search,
    ResponseSendInterceptor.sendResponse
);

Router.put(
    '/session/game/:postId',
    Express.raw(),
    (req, res, next) => {
        RequestAuthInterceptor.initializePostEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.ADD_SESSION_VIDEO.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.ADD_SESSION_VIDEO.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.ADD_SESSION_VIDEO.CALLER_USER_SUBJECT_POST_RELATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.ADD_SESSION_VIDEO.POST_LOCATION
        );
        req.session = true;
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerPostRelation,
    PostController.updateGameVideoById,
    ResponseSendInterceptor.sendResponse
);

Router.put(
    '/session',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializePostEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.CREATE_SESSION.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.CREATE_SESSION.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.CREATE_SESSION.CALLER_USER_SUBJECT_POST_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerPostRelation,
    PostController.startPostSession,
    ResponseSendInterceptor.sendResponse
);

Router.put(
    '/',
    Express.raw(),
    (req, res, next) => {
        RequestAuthInterceptor.initializePostEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.CREATE.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.CREATE.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.CREATE.CALLER_USER_SUBJECT_POST_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerPostRelation,
    PostController.createOne,
    ResponseSendInterceptor.sendResponse
);

Router.post(
    '/fav/:postId&:favValue',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializePostEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.UPDATE_FAVOURITE.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.UPDATE_FAVOURITE.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.UPDATE_FAVOURITE.CALLER_USER_SUBJECT_POST_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerPostRelation,
    PostController.updateFavById,
    ResponseSendInterceptor.sendResponse
);

Router.post(
    '/usage-report',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializePostEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.USAGE_REPORT.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.USAGE_REPORT.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.USAGE_REPORT.CALLER_USER_SUBJECT_POST_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerPostRelation,
    PostController.usageReport,
    ResponseSendInterceptor.sendResponse
);

Router.post(
    '/usage-count',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializePostEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.USAGE_COUNT.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.USAGE_COUNT.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.USAGE_COUNT.CALLER_USER_SUBJECT_POST_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerPostRelation,
    PostController.usageCount,
    ResponseSendInterceptor.sendResponse
);

Router.post(
    '/:postId',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializePostEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.UPDATE.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.UPDATE.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.UPDATE.CALLER_USER_SUBJECT_POST_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerPostRelation,
    PostController.updateReviewSelectionById,
    ResponseSendInterceptor.sendResponse
);

//Retire this soon
Router.post(
    '/',
    Express.json(),
    (req, res, next) => {
        if(req.query && req.query.postId){
            req.params.postId = req.query.postId;
        }
        next();
    },
    (req, res, next) => {
        RequestAuthInterceptor.initializePostEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.UPDATE.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.UPDATE.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.UPDATE.CALLER_USER_SUBJECT_POST_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerPostRelation,
    PostController.updateReviewSelectionById,
    ResponseSendInterceptor.sendResponse
);

Router.get(
    '/:postId',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializePostEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.READ.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.READ.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.READ.CALLER_USER_SUBJECT_POST_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerPostRelation,
    PostController.getPostContent,
    ResponseSendInterceptor.sendResponse
);

//Retire this soon
Router.get(
    '/',
    Express.json(),
    (req, res, next) => {
        if (req.query && req.query.postId) {
            req.params.postId = req.query.postId;
        }
        next();
    },
    (req, res, next) => {
        RequestAuthInterceptor.initializePostEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.READ.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.READ.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.READ.CALLER_USER_SUBJECT_POST_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerPostRelation,
    PostController.getPostContent,
    ResponseSendInterceptor.sendResponse
);

Router.delete(
    '/session/:postId',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializePostEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.DELETE_SESSION.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.DELETE_SESSION.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.DELETE_SESSION.CALLER_USER_SUBJECT_POST_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerPostRelation,
    PostController.endPostSession,
    ResponseSendInterceptor.sendResponse
);

Router.delete(
    '/:postId',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializePostEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.DELETE.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.DELETE.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.DELETE.CALLER_USER_SUBJECT_POST_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerPostRelation,
    PostController.deleteOneById,
    ResponseSendInterceptor.sendResponse
);

//Retire this soon
Router.delete(
    '/',
    Express.json(),
    (req, res, next) => {
        if (req.query && req.query.postId) {
            req.params.postId = req.query.postId;
        }
        next();
    },
    (req, res, next) => {
        RequestAuthInterceptor.initializePostEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.DELETE.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.DELETE.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.POST.DELETE.CALLER_USER_SUBJECT_POST_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerPostRelation,
    PostController.deleteOneById,
    ResponseSendInterceptor.sendResponse
);

module.exports = Router;