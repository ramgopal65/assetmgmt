const Express = require('express');
const Router = Express.Router();
const CommonConstants = require('../../common/constant/constant');
const CommonValidator = require('../../common/validate/validator');
const Constants = require('../constant/constant');
const CustomConstants = require('../custom/badminton/constant/constant');
const RequestAuthInterceptor = require('../interceptors/req-auth');
const ResponseSendInterceptor = require('../../interceptors/res-send');
const UserController = require('./controllers/user');
const RejectData = require('../../common/response/reject-data');
const ResolveData = require('../../common/response/resolve-data');
const AuthConstant = require('../constant/auth-constant');
const To = require('../../common/to/to');

/*done*/

Router.post(
    /*
        Mandatory
        - Either phone or email, whichever is being used as identifier
        - type('registration' or 'login')
        eg.
        {
            type: 'registration',
            phone: {
                cc: '+NN',
                number:'NNNNNNNNNN'
            },
            email:'xxxxx.yyyyyy@bbbbb.com'
        }
    */
    '/buy-credit',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.BUY_CREDIT.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.BUY_CREDIT.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.BUY_CREDIT.CALLER_USER_SUBJECT_USER_RELATION
        );
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    UserController.buyCredit,
    ResponseSendInterceptor.sendResponse
);

Router.get(
    '/profile-pic',
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.READ_PROFILE_PIC_SELF.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.READ_PROFILE_PIC_SELF.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.READ_PROFILE_PIC_SELF.CALLER_USER_SUBJECT_USER_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    UserController.getProfilePic,
    ResponseSendInterceptor.sendResponse
);

Router.post(
    /*
        Mandatory
        - Either phone or email, whichever is being used as identifier
        eg.
        {
            phone: {
                cc: '+NN',
                number:'NNNNNNNNNN'
            },
            email:'xxxxx.yyyyyy@bbbbb.com'
        }
    */
    '/otp-registration',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_FOR_REGISTRATION.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_FOR_REGISTRATION.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_FOR_REGISTRATION.CALLER_USER_SUBJECT_USER_RELATION);
        next();
    },
    UserController.generateOtpForRegistration,
    ResponseSendInterceptor.sendResponse
);

Router.post(
    /*
        Mandatory
        - Either phone or email, whichever is being used as identifier
        - type('registration' or 'login')
        eg.
        {
            type: 'registration',
            phone: {
                cc: '+NN',
                number:'NNNNNNNNNN'
            },
            email:'xxxxx.yyyyyy@bbbbb.com'
        }
    */
    '/otp-login',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_FOR_LOGIN.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_FOR_LOGIN.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_FOR_LOGIN.CALLER_USER_SUBJECT_USER_RELATION
        );
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    UserController.generateOtpForLogin,
    ResponseSendInterceptor.sendResponse
);

//TODO retire thisi  API in favour of the 2 above
Router.post(
    /*
        Mandatory
        - Either phone or email, whichever is being used as identifier
        - type('registration' or 'login')
        eg.
        {
            type: 'registration',
            phone: {
                cc: '+NN',
                number:'NNNNNNNNNN'
            },
            email:'xxxxx.yyyyyy@bbbbb.com'
        }
    */
    '/otp',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP.CALLER_USER_SUBJECT_USER_RELATION
        );
        next();
    },
    (req, res, next) => {
        if (req.body.type === CommonConstants.COMMON.APP_OTP.REGISTRATION.CODE) {
            next();
        } else if (req.body.type === CommonConstants.COMMON.APP_OTP.OTP_LOGIN.CODE) {
            RequestAuthInterceptor.authenticateCaller(req, res, next);
        } else {
            let rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            rejectObject.appendMessage('req.body.type');
            req.trace.response = rejectObject.jsonObject();
            ResponseSendInterceptor.sendResponse(req, res, next);
        }
    },
    (req, res, next) => {
        if (req.body.type === CommonConstants.COMMON.APP_OTP.REGISTRATION.CODE) {
            next();
        } else if (req.body.type === CommonConstants.COMMON.APP_OTP.OTP_LOGIN.CODE) {
            RequestAuthInterceptor.authorizeCallerSubjectRoleRelation(req, res, next);
        } else {
            let rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            rejectObject.appendMessage('req.body.type');
            req.trace.response = rejectObject.jsonObject();
            ResponseSendInterceptor.sendResponse(req, res, next);
        }
    },
    (req, res, next) => {
        if (req.body.type === CommonConstants.COMMON.APP_OTP.REGISTRATION.CODE) {
            UserController.generateOtpForRegistration(req, res, next);
        } else if (req.body.type === CommonConstants.COMMON.APP_OTP.OTP_LOGIN.CODE) {
            UserController.generateOtpForLogin(req, res, next);
        } else {
            let rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            rejectObject.appendMessage('req.body.type');
            req.trace.response = rejectObject.jsonObject();
            ResponseSendInterceptor.sendResponse(req, res, next);
        }
    },
    ResponseSendInterceptor.sendResponse
);



Router.post(
    '/register-login/:_id',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_REGISTER_LOGIN.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_REGISTER_LOGIN.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_REGISTER_LOGIN.CALLER_USER_SUBJECT_USER_RELATION
        );
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    UserController.registerAndLogin,
    ResponseSendInterceptor.sendResponse
);

Router.post(
    /*
    Body 
    Mandatory:
    otpToken.otp
    otpToken.type
    profileData.name.firstName
    profileData.name.lastName
    password
    _id(as param)
    
    Other rules:
    - if user.phone was provided in /otp, it should be avoided. If provided, it should match what was provided in /otp(it cannot be changed)
    - if user.email was provided in /otp, it should be avoided. If provided, it should match what was provided in /otp(it cannot be changed)
    {
        otpToken:{
            type: 'registration',
            otp: 'XXXX'
        },
        profileData:{
            name{
                firstName:'firstName',
                middleName: 'middleName',
                lastName: 'lastName'
            },
            password:'password'
            phone: {
                cc: '+NN',
                number:'NNNNNNNNNN'
            },
            email:'sampath.mallapadi@borqs.com',
    
        }
    }
    */
    '/register/:_id',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_REGISTER.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_REGISTER.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_REGISTER.CALLER_USER_SUBJECT_USER_RELATION
        );
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    UserController.register,
    ResponseSendInterceptor.sendResponse
);

Router.post(
    /*
    Body 
    Mandatory
    - Either phone or email, whichever is being used as identifier
    - Either password or otp
    {
        phone: {
            cc: '+NN',
            number:'NNNNNNNNNN'
        },
        email:'sampath.mallapadi@borqs.com',
        password:'password',
        otp: 'otp'
    }
    
    */
    '/login',
    Express.json(),
    (req, res, next) => {
        if (req.body.otp) {
            RequestAuthInterceptor.initializeUserEndPoints(req,
                Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_LOGIN.API_NAME,
                Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_LOGIN.CALLER_LOCATION,
                Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_LOGIN.CALLER_USER_SUBJECT_USER_RELATION);
            next();
        } else if (req.body.password) {
            RequestAuthInterceptor.initializeUserEndPoints(req,
                Constants.ASSETMGMT.APP_ACTION.ACTION.USER.PASSWORD_LOGIN.API_NAME,
                Constants.ASSETMGMT.APP_ACTION.ACTION.USER.PASSWORD_LOGIN.CALLER_LOCATION,
                Constants.ASSETMGMT.APP_ACTION.ACTION.USER.PASSWORD_LOGIN.CALLER_USER_SUBJECT_USER_RELATION);
            next();
        } else {
            RequestAuthInterceptor.initializeUserEndPoints(req,
                Constants.ASSETMGMT.APP_ACTION.ACTION.USER.PASSWORD_LOGIN.API_NAME,
                Constants.ASSETMGMT.APP_ACTION.ACTION.USER.PASSWORD_LOGIN.CALLER_LOCATION,
                Constants.ASSETMGMT.APP_ACTION.ACTION.USER.PASSWORD_LOGIN.CALLER_USER_SUBJECT_USER_RELATION
            );
            let rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            rejectObject.appendMessage('req.body.password');
            req.trace.response = rejectObject.jsonObject();
            ResponseSendInterceptor.sendResponse(req, res, next);
        }
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    UserController.login,
    ResponseSendInterceptor.sendResponse
);

Router.post(
    /*
    Body should be empty
    */
    '/logout',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.LOGOUT.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.LOGOUT.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.LOGOUT.CALLER_USER_SUBJECT_USER_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    UserController.logout,
    ResponseSendInterceptor.sendResponse
);

Router.post(
    /*
    Body 
    Mandatory
    - Either phone or email, whichever is being used as identifier
    - Password
    {
        phone: {
            cc: '+NN',
            number:'NNNNNNNNNN'
        },
        email:'sampath.mallapadi@borqs.com',
        password:'password'
    }
    
    */
    '/token/refresh',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.TOKEN_REFRESH.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.TOKEN_REFRESH.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.TOKEN_REFRESH.CALLER_USER_SUBJECT_USER_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    UserController.refreshToken,
    ResponseSendInterceptor.sendResponse
);

Router.get(
    /*
    Body - empty
    Mandatory -
    _id(as param)
    */
    '/:_id',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.READ.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.READ.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.READ.CALLER_USER_SUBJECT_USER_RELATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.READ.SUBJECT_LOCATION
        );
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    RequestAuthInterceptor.authorizeCallerSubjectHierarchyRelation,
    ResponseSendInterceptor.sendResponse

);

/*done*/
Router.get(
    /*
    (get for self)
    Body - empty
    Mandatory - none
    */
    '/',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.READ_SELF.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.READ_SELF.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.READ_SELF.CALLER_USER_SUBJECT_USER_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    ResponseSendInterceptor.sendResponse
);

Router.put(
    '/',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.CREATE.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.CREATE.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.CREATE.CALLER_USER_SUBJECT_USER_RELATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.CREATE.SUBJECT_LOCATION
        );
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    UserController.createOne,
    ResponseSendInterceptor.sendResponse
);

Router.post(
    '/profile-pic',
    Express.raw(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.UPDATE_PROFILE_PIC_SELF.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.UPDATE_PROFILE_PIC_SELF.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.UPDATE_PROFILE_PIC_SELF.CALLER_USER_SUBJECT_USER_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    UserController.updateProfilePic,
    ResponseSendInterceptor.sendResponse
);

Router.post(
    '/searchCount',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.SEARCH_COUNT.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.SEARCH_COUNT.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.SEARCH_COUNT.CALLER_USER_SUBJECT_USER_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    UserController.searchCount,
    ResponseSendInterceptor.sendResponse
);

Router.post(
    '/search',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.SEARCH.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.SEARCH.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.SEARCH.CALLER_USER_SUBJECT_USER_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    UserController.search,
    ResponseSendInterceptor.sendResponse
);


Router.post(
    /*
    (put)
    Body must be non-empty and having the fields of the user model
    name
    profilePic
    
    Must not have the following fields:
    Mandatory -
    _id(as param)
    identifier
    status
    otpToken
    createdBy
    updatedBy
    createdAt
    updatedAt
    __v
    activityDetails
    email
    password
    token
    */
    '/:_id',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.UPDATE.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.UPDATE.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.UPDATE.CALLER_USER_SUBJECT_USER_RELATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.UPDATE.SUBJECT_LOCATION
        );
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    RequestAuthInterceptor.authorizeCallerSubjectHierarchyRelation,
    UserController.updateOneById,
    ResponseSendInterceptor.sendResponse
);

Router.post(
    /*
    (put for self)
    Body must be non-empty and having the fields of the user model
    name
    profilePic
    
    Must not have the following fields:
    _id
    identifier
    status
    otpToken
    createdBy
    updatedBy
    createdAt
    updatedAt
    __v
    activityDetails
    email
    password
    token
    */
    '/',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.UPDATE_SELF.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.UPDATE_SELF.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.UPDATE_SELF.CALLER_USER_SUBJECT_USER_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    UserController.updateOneById,
    ResponseSendInterceptor.sendResponse
);



Router.delete(
    '/',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.DELETE_SELF.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.DELETE_SELF.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.DELETE_SELF.CALLER_USER_SUBJECT_USER_RELATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    UserController.deleteOneById,
    ResponseSendInterceptor.sendResponse
);

Router.delete(
    '/:_id',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initializeUserEndPoints(req,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.DELETE.API_NAME,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.DELETE.CALLER_LOCATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.DELETE.CALLER_USER_SUBJECT_USER_RELATION,
            Constants.ASSETMGMT.APP_ACTION.ACTION.USER.DELETE.SUBJECT_LOCATION);
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerSubjectRoleRelation,
    RequestAuthInterceptor.authorizeCallerSubjectHierarchyRelation,
    UserController.deleteOneById,
    ResponseSendInterceptor.sendResponse
);



/*done*/

module.exports = Router;