/* eslint-disable no-fallthrough */
/* eslint-disable indent */
module.exports = {
    initializeUserEndPoints: initializeUserEndPoints,
    initializePostEndPoints: initializePostEndPoints,
    authenticateCaller: authenticateCaller,
    authorizeCallerSubjectRoleRelation: authorizeCallerSubjectRoleRelation,
    authorizeCallerSubjectHierarchyRelation: authorizeCallerSubjectHierarchyRelation,
    authorizeCallerPostRelation: authorizeCallerPostRelation,
    initiliazeWhitelistEndpoints: initiliazeWhitelistEndpoints,
    authorizeCallerForWhitelist: authorizeCallerForWhitelist,
    initiliazeTestimonialEndpoints: initiliazeTestimonialEndpoints,
    authorizeCallerForTestimonial: authorizeCallerForTestimonial,    
    initiliazeCourtEndpoints: initiliazeCourtEndpoints,
    authorizeCallerForCourt: authorizeCallerForCourt,
    authorizeCallerToGetCamera: authorizeCallerToGetCamera
};

// Imports
const CommonJWTHelper = require('../../common/jwt/helpers/jwt');
const To = require('../../common/to/to');
const Constants = require('../constant/constant');
const CommonConstants = require('../../common/constant/constant');
const AuthConstants = require('../constant/auth-constant');
const CommonValidator = require('../../common/validate/validator');
const RejectData = require('../../common/response/reject-data');
const UserHelper = require('../routes/helpers/user');
const UserTokenBlacklistedHelper = require('../routes/helpers/usertokenblacklist');
const PostHelper = require('../routes/helpers/post');
const ResponseSendInterceptor = require('../../interceptors/res-send');
const ResolveData = require('../../common/response/resolve-data');
const JsonPath = require('jsonpath');
const CustomConstants = require('../custom/badminton/constant/custom-constant');

/**
 * initializeUserEndPoints
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
//This is not a reqular middleware function as it needs to have other parameters other than req, res, next
function initializeUserEndPoints(req, action, callerLoc, callerSubjectRelation, subjectLocation) {
    req.trace = {
        type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
        request: {
            resource: Constants.ASSETMGMT.APP_ACTION.RESOURCE.USER,
            action: action
        },
        auth: {
            callerLocation: callerLoc,
            callerSubjectRelation: callerSubjectRelation
        }
    };
    if ((callerSubjectRelation == AuthConstants.CALLER_USER_SUBJECT_USER_RELATION.OTHER) &&
        subjectLocation) {
        req.trace.auth.subjectLocation = subjectLocation;
    }
}

/**
 * initializePostEndPoints
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
//This is not a reqular middleware function as it needs to have other parameters other than req, res, next
function initializePostEndPoints(req, action, callerLoc, callerPostRelation, postLocation) {
    req.trace = {
        type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
        request: {
            resource: Constants.ASSETMGMT.APP_ACTION.RESOURCE.POST,
            action: action
        },
        auth: {
            callerLocation: callerLoc,
            callerPostRelation: callerPostRelation
        }
    };
    if (postLocation) {
        req.trace.auth.postLocation = postLocation;
    }
}

/**
 * initiliazeWhitelistEndpoints
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
//This is not a reqular middleware function as it needs to have other parameters other than req, res, next
function initiliazeWhitelistEndpoints(req, action, callerLoc) {
    req.trace = {
        type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
        request: {
            resource: Constants.ASSETMGMT.APP_ACTION.RESOURCE.WHITELIST,
            action: action
        },
        auth: {
            callerLocation: callerLoc
        }
    };
}

/**
 * initiliazeTestimonialEndpoints
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
//This is not a reqular middleware function as it needs to have other parameters other than req, res, next
function initiliazeTestimonialEndpoints(req, action, callerLoc) {
    req.trace = {
        type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
        request: {
            resource: Constants.ASSETMGMT.APP_ACTION.RESOURCE.TESTIMONIAL,
            action: action
        },
        auth: {
            callerLocation: callerLoc
        }
    };
}

/**
 * initiliazeWhitelistEndpoints
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
//This is not a reqular middleware function as it needs to have other parameters other than req, res, next
function initiliazeCourtEndpoints(req, action, callerLoc) {
    req.trace = {
        type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
        request: {
            resource: Constants.ASSETMGMT.APP_ACTION.RESOURCE.COURT,
            action: action
        },
        auth: {
            callerLocation: callerLoc
        }
    };
}

/**
 * authenticate the user
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function authenticateCaller(req, res, next) {
    /*
    *    Authentication:
    *         - establish the caller
    *             - caller location is in req.trace.auth.callerLocation: 
    *         - check caller existence
    *         - fill req.trace.caller
    *
    */

    try {
        if (req.trace.auth.callerLocation) {
            // Initialize
            let token, error, result, blacklistedTokenResult, decoded;
            var rejectObject;

            switch (req.trace.auth.callerLocation) {
                case AuthConstants.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN:
                    //console.log('caller location is - ' + AuthConstants.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN);
                    // Check if token is part of Authorization Bearer header and extract it
                    if (req.headers.authorization) {
                        //console.log('found authorization header');
                        var bearerArr = req.headers.authorization.split(' ');
                        if (bearerArr && Array.isArray(bearerArr) && bearerArr.length == 2
                            && (bearerArr[0] == 'bearer' || bearerArr[0] == 'Bearer')) {
                            token = bearerArr[1];
                        }

                        if (token) {
                            let validUserAudience = Constants.ASSETMGMT.APP_JWT.AUDIENCE.USERS;
                            //console.log('found token');
                            //Is token valid?
                            //console.log(validUserAudience);
                            [error, decoded] = await To(CommonJWTHelper.verifyJWT(token, validUserAudience));
                            if (!CommonValidator.isSuccessResponseAndNonEmptyData(decoded)) {
                                //invalid token
                                //console.log('invalid token - failed authentication');
                                rejectObject = new RejectData(
                                    CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                    error);
                                rejectObject.appendMessage(error.message);
                                req.trace.response = rejectObject.jsonObject();
                                ResponseSendInterceptor.sendResponse(req, res, next);
                            } else {
                                //valid token
                                //Check if token is blacklisted
                                error = null;
                                [error, blacklistedTokenResult] = await To(UserTokenBlacklistedHelper.checkIfBlacklisted(decoded.data.jti, token, null));

                                if (CommonValidator.isSuccessResponseAndNonEmptyData(blacklistedTokenResult)) {
                                    //token is blacklisted
                                    //console.log('token is blacklisted - failed authentication');
                                    rejectObject = new RejectData(
                                        CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                        CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                        null);
                                    req.trace.response = rejectObject.jsonObject();
                                    ResponseSendInterceptor.sendResponse(req, res, next);
                                } else {
                                    //Check if user(jti) is really existing?
                                    error = null;
                                    [error, result] = await To(UserHelper.getOneByIdInternal(decoded.data.jti));
                                    if (!CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                                        //user is not in existence
                                        //console.log('user is not in existence - failed authentication');
                                        rejectObject = new RejectData(
                                            CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                            error);
                                        rejectObject.appendMessage(error.message);
                                        req.trace.response = rejectObject.jsonObject();
                                        ResponseSendInterceptor.sendResponse(req, res, next);
                                    } else {
                                        //user is existing
                                        //console.log('caller is in existence');

                                        if (!req.session) {
                                            //console.log('it is not a session token');

                                            if (!(result.data.token.token === token)) {
                                                //token is not matching
                                                //console.log('token is not matching - failed authentication');
                                                rejectObject = new RejectData(
                                                    CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                                                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                                    error);
                                                req.trace.response = rejectObject.jsonObject();
                                                ResponseSendInterceptor.sendResponse(req, res, next);
                                            } else if (result.data.token.expiry < Date.now()) {
                                                //token has expired
                                                //console.log('token has expired - failed authentication');
                                                rejectObject = new RejectData(
                                                    CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                                                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                                    error);
                                                req.trace.response = rejectObject.jsonObject();
                                                ResponseSendInterceptor.sendResponse(req, res, next);
                                            } else {
                                                //console.log('successful authentication');
                                                req.trace.caller = result.data;
                                                req.trace.authenticated = true;
                                                next();
                                            }
                                        } else {
                                            //Validite of session tokens should be checked outside this function
                                            //console.log('it is a session token');
                                            req.trace.caller = result.data;
                                            req.trace.authenticated = true;
                                            next();
                                        }

                                    }
                                }
                            }
                        } else {
                            //Token is not provided
                            //console.log('token is not available - failed authentication');
                            rejectObject = new RejectData(
                                CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_NOT_PROVIDED,
                                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                null);
                            req.trace.response = rejectObject.jsonObject();
                            ResponseSendInterceptor.sendResponse(req, res, next);
                        }
                    } else {
                        //console.log('not found authorization header');
                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHENTICATION_ERROR,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null);
                        req.trace.response = rejectObject.jsonObject();
                        ResponseSendInterceptor.sendResponse(req, res, next);

                    }
                    break;
                case AuthConstants.CALLER_LOCATION_IN_REQ.REQ_PARAMS_ID:
                    ////console.log('caller location is - ' + AuthConstants.CALLER_LOCATION_IN_REQ.REQ_PARAMS_ID);
                    // Check if caller _id is part or req.params
                    if (req.params._id && CommonValidator.isValidMongoObjectId(req.params._id)) {
                        ////console.log('found _id in params');
                        error = result = null;
                        [error, result] = await To(UserHelper.getOneByIdInternal(req.params._id));
                        if (!CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                            //user is not in existence
                            ////console.log('user is not in existence - failed authentication');
                            rejectObject = new RejectData(
                                CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.USER_NOT_FOUND,
                                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                error);
                            rejectObject.appendMessage(error.message);
                            req.trace.response = rejectObject.jsonObject();
                            ResponseSendInterceptor.sendResponse(req, res, next);
                        } else {
                            //user is existing and authentication is done
                            ////console.log('user is in existence - successful authentication');
                            req.trace.caller = result.data;
                            req.trace.authenticated = true;
                            next();
                        }
                    } else {
                        ////console.log('not found _id in params - failed authentication');
                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHENTICATION_ERROR,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null);
                        req.trace.response = rejectObject.jsonObject();
                        ResponseSendInterceptor.sendResponse(req, res, next);
                    }
                    break;
                case AuthConstants.CALLER_LOCATION_IN_REQ.REQ_BODY_IDENTIFIER:
                    ////console.log('caller location is - ' + AuthConstants.CALLER_LOCATION_IN_REQ.REQ_BODY_IDENTIFIER);
                    // Check if caller identifier is part or req.body
                    if ((req.body.phone && CommonValidator.isValidPhone(req.body.phone)) ||
                        req.body.email && CommonValidator.isValidEmail(req.body.email)) {
                        ////console.log('found identifier in body');
                        let userWithIdentifier = {};
                        userWithIdentifier.identifier = {};

                        if (req.body.phone && CommonValidator.isValidPhone(req.body.phone)) {
                            ////console.log('found req.body.phone as identifier');
                            userWithIdentifier.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER;
                            userWithIdentifier.identifier.id = req.body.phone.cc + req.body.phone.number;
                        } else if (req.body.email && CommonValidator.isValidEmail(req.body.email)) {
                            ////console.log('found req.body.email as identifier');
                            userWithIdentifier.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
                            userWithIdentifier.identifier.id = req.body.email;
                        }
                        let error, result;
                        [error, result] = await To(UserHelper.getOneByIdentifierInternal(userWithIdentifier));
                        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                            ////console.log('successfully fetched the user from identifier - successful authentication');
                            req.trace.caller = result.data;
                            req.trace.authenticated = true;
                            next();
                        } else {
                            //user is not in existence
                            ////console.log('could not fetch the identifier in body - failed authentication');
                            rejectObject = new RejectData(
                                CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.USER_NOT_FOUND,
                                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                null);
                            req.trace.response = rejectObject.jsonObject();
                            ResponseSendInterceptor.sendResponse(req, res, next);
                        }
                    } else {
                        //caller identifier is not part of req.body
                        ////console.log('not found identifier in body - authentication error');
                        var msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;

                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.USER_DETAILS_NOT_PROVIDED,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null);
                        rejectObject.appendMessage(msg);
                        rejectObject.appendMessage('req.body.phone or req.body.email');

                        req.trace.response = rejectObject.jsonObject();
                        ResponseSendInterceptor.sendResponse(req, res, next);
                    }
                    break;
                case AuthConstants.CALLER_LOCATION_IN_REQ.UNKNOWN:
                default:
                    ////console.log('caller location is unknown - failed authentication');
                    rejectObject = new RejectData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                        CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHENTICATION_ERROR,
                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                        null);
                    req.trace.response = rejectObject.jsonObject();
                    ResponseSendInterceptor.sendResponse(req, res, next);
                    break;
            }
        } else {
            ////console.log('caller location is not provided - failed authentication');
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHENTICATION_ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejectObject.jsonObject();
            ResponseSendInterceptor.sendResponse(req, res, next);
        }
    } catch (e) {
        ////console.log('unknown error leading to exception');
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHENTICATION_ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        req.trace.response = rejectObject.jsonObject();
        ResponseSendInterceptor.sendResponse(req, res, next);
    }
}


/**
 * authorizeCallerRole
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
//This is not a reqular middleware function. We do not want to store allowedCallerRoles in req for security reasone

function authorizeCallerRole(req, allowedCallerRoles) {
    if (req.trace.caller && req.trace.caller.role) {
        if (allowedCallerRoles.includes(req.trace.caller.role)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

/**
 * authorize
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
//This is not a reqular middleware function. We do not want to store allowerSubjectRoles in req for security reasone
async function authorizeCallerSubjectRoleRelationOld3(req, authorizationMap) {

    ////console.log(req.trace.request.action);
    //Get the authorizationMap for this action
    ////console.log('$..[?(@.API_NAME==\'' + req.trace.request.action + '\')].ALLOWED_ROLE_MAP');
    authorizationMap = JsonPath.query(Constants.ASSETMGMT.APP_ACTION.ACTION, '$..[?(@.API_NAME==\'' + req.trace.request.action + '\')].ALLOWED_ROLE_MAP')[0];
    ////console.log(authorizationMap);

    var msg;
    try {
        if (req.trace.caller && req.trace.caller.role) {
            if (Object.keys(authorizationMap).includes(req.trace.caller.role)) {
                ////console.log('caller is allowed to call this api');

                if (req.trace.auth.callerSubjectRelation === AuthConstants.CALLER_USER_SUBJECT_USER_RELATION.SAME) {
                    ////console.log('caller and subject are same - authorization is successful');
                    let resObject = new ResolveData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                        CommonConstants.COMMON.APP_ERROR.SUCCESS,
                        req.trace.caller);

                    req.trace.subject = req.trace.caller;
                    return Promise.resolve(resObject.jsonObject());
                } else if (req.trace.auth.callerSubjectRelation === AuthConstants.CALLER_USER_SUBJECT_USER_RELATION.OTHER) {
                    if (req.trace.auth.subjectLocation) {
                        // Initialize
                        let error, result;
                        var rejectObject;

                        switch (req.trace.auth.subjectLocation) {
                            case AuthConstants.SUBJECT_LOCATION_IN_REQ.REQ_PARAMS_ID:
                                ////console.log('subject location is - ' + AuthConstants.SUBJECT_LOCATION_IN_REQ.REQ_PARAMS_ID);
                                // Check if subject _id is part or req.params
                                if (req.params._id) {
                                    if (CommonValidator.isValidMongoObjectId(req.params._id)) {
                                        ////console.log('found _id in params');
                                        error = result = null;
                                        [error, result] = await To(UserHelper.getOneByIdInternal(req.params._id));
                                        if (!CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                                            //subject is not in existence
                                            ////console.log('subject is not in existence - failed authorization');
                                            rejectObject = new RejectData(
                                                CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.USER_NOT_FOUND,
                                                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                                error);
                                            rejectObject.appendMessage(error.message);
                                            return Promise.reject(rejectObject.jsonObject());
                                        } else {
                                            //subject is existing
                                            ////console.log('subject is in existence');
                                            let allowedSubjectRoles = authorizationMap[req.trace.caller.role];
                                            if (allowedSubjectRoles && allowedSubjectRoles.includes(result.data.role)) {
                                                ////console.log('caller is allowed to access subject with this api - authorization is successful');
                                                let resObject = new ResolveData(
                                                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                                                    CommonConstants.COMMON.APP_ERROR.SUCCESS,
                                                    result.data);

                                                req.trace.subject = result.data;
                                                return Promise.resolve(resObject.jsonObject());
                                            } else {
                                                ////console.log('caller is not allowed to access subject with this api  - failed authorization');
                                                rejectObject = new RejectData(
                                                    CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION,
                                                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                                    null);
                                                return Promise.reject(rejectObject.jsonObject());
                                            }
                                        }
                                    } else {
                                        ////console.log('invalid _id in req.params - failed authorization');
                                        rejectObject = new RejectData(
                                            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                            null);
                                        return Promise.reject(rejectObject.jsonObject());
                                    }
                                } else {
                                    ////console.log('not found _id in req.params - failed authorization');
                                    rejectObject = new RejectData(
                                        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                        CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_NOT_PROVIDED,
                                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                        null);
                                    return Promise.reject(rejectObject.jsonObject());

                                }
                                break;
                            case AuthConstants.SUBJECT_LOCATION_IN_REQ.REQ_BODY_IDENTIFIER:
                                ////console.log('subject location is - ' + AuthConstants.SUBJECT_LOCATION_IN_REQ.REQ_BODY_IDENTIFIER);
                                // Check if subject identifier is part of req.body
                                if ((req.body.phone && CommonValidator.isValidPhone(req.body.phone)) ||
                                    req.body.email && CommonValidator.isValidEmail(req.body.email)) {
                                    ////console.log('found identifier in body');
                                    let userWithIdentifier = {};
                                    userWithIdentifier.identifier = {};

                                    if (req.body.phone && CommonValidator.isValidPhone(req.body.phone)) {
                                        ////console.log('found req.body.phone as identifier');
                                        userWithIdentifier.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER;
                                        userWithIdentifier.identifier.id = req.body.phone.cc + req.body.phone.number;
                                    } else if (req.body.email && CommonValidator.isValidEmail(req.body.email)) {
                                        ////console.log('found req.body.email as identifier');
                                        userWithIdentifier.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
                                        userWithIdentifier.identifier.id = req.body.email;
                                    }
                                    if (req.body.role) {
                                        ////console.log('found role in body');
                                        let allowedSubjectRoles = authorizationMap[req.trace.caller.role];
                                        if (allowedSubjectRoles.includes(req.body.role)) {
                                            ////console.log('caller allowed to access this subject role using this api - authorization is successful');
                                            let resObject = new ResolveData(
                                                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                                                CommonConstants.COMMON.APP_ERROR.SUCCESS,
                                                null);

                                            req.trace.subject = null;
                                            return Promise.resolve(resObject.jsonObject());
                                        } else {
                                            ////console.log('caller is not allowed to access this subject role using this api - failed authorization');
                                            rejectObject = new RejectData(
                                                CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION,
                                                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                                null);
                                            return Promise.reject(rejectObject.jsonObject());
                                        }

                                    } else {
                                        ////console.log('not found role in body - failed authorization');
                                        msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;

                                        rejectObject = new RejectData(
                                            CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.USER_DETAILS_NOT_PROVIDED,
                                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                            null);
                                        rejectObject.appendMessage(msg);
                                        rejectObject.appendMessage('req.body.role');
                                        return Promise.reject(rejectObject.jsonObject());

                                    }
                                } else {
                                    //caller identifier is not part of req.body
                                    ////console.log('not found identifier in body - failed authorization');
                                    msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;

                                    rejectObject = new RejectData(
                                        CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                        CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.USER_DETAILS_NOT_PROVIDED,
                                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                        null);
                                    rejectObject.appendMessage(msg);
                                    rejectObject.appendMessage('req.body.phone or req.body.email');

                                    return Promise.reject(rejectObject.jsonObject());
                                }
                                break;
                            case AuthConstants.SUBJECT_LOCATION_IN_REQ.UNKNOWN:
                            default:
                                ////console.log('subject location is unknown - failed authorization');
                                rejectObject = new RejectData(
                                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                    null);
                                return Promise.reject(rejectObject.jsonObject());
                                break;
                        }
                    } else {
                        ////console.log('subject location is not provided - failed authorization');
                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null);
                        return Promise.reject(rejectObject.jsonObject());
                    }
                } else {
                    ////console.log('caller-subject relationship is unknown - failed authorization');
                    rejectObject = new RejectData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                        CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                        null);
                    return Promise.reject(rejectObject.jsonObject());
                }
            } else {
                ////console.log('caller is not allowed to call this api - failed authorization');
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            ////console.log('caller or caller role is not found - failed authorization');
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }

    } catch (e) {
        ////console.log('error in authorization - failed authorization');
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
 * authorize
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function authorizeCallerSubjectRoleRelation(req, res, next) {
    //Get the authorizationMap for this action
    let authorizationMap = JsonPath.query(Constants.ASSETMGMT.APP_ACTION.ACTION, '$..[?(@.API_NAME==\'' + req.trace.request.action + '\')].ALLOWED_ROLE_MAP')[0];
    //console.log(authorizationMap);
    //console.log('caller role is - ' + req.trace.caller.role);
    //console.log(req.body);
    var msg;
    try {
        if (req.trace.caller && req.trace.caller.role) {
            if (Object.keys(authorizationMap).includes(req.trace.caller.role)) {
                //console.log('caller is allowed to call this api');

                if (req.trace.auth.callerSubjectRelation === AuthConstants.CALLER_USER_SUBJECT_USER_RELATION.SAME) {
                    //console.log('caller and subject are same - authorization is successful');
                    req.trace.subject = req.trace.caller;
                    let resObject = new ResolveData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                        CommonConstants.COMMON.APP_ERROR.SUCCESS,
                        req.trace.caller);
                    req.trace.subject = req.trace.caller;
                    req.trace.response = resObject.jsonObject();
                    next();
                } else if (req.trace.auth.callerSubjectRelation === AuthConstants.CALLER_USER_SUBJECT_USER_RELATION.OTHER) {
                    if (req.trace.auth.subjectLocation) {
                        // Initialize
                        let error, result;
                        var rejectObject;

                        switch (req.trace.auth.subjectLocation) {
                            case AuthConstants.SUBJECT_LOCATION_IN_REQ.REQ_PARAMS_ID:
                                //console.log('subject location is - ' + AuthConstants.SUBJECT_LOCATION_IN_REQ.REQ_PARAMS_ID);
                                // Check if subject _id is part or req.params
                                if (req.params._id) {
                                    if (CommonValidator.isValidMongoObjectId(req.params._id)) {
                                        //console.log('found _id in params');
                                        //console.log(req.params._id);
                                        error = result = null;
                                        [error, result] = await To(UserHelper.getOneByIdInternal(req.params._id));
                                        if (!CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                                            //subject is not in existence
                                            //console.log('subject is not in existence - failed authorization');
                                            rejectObject = new RejectData(
                                                CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.USER_NOT_FOUND,
                                                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                                error);
                                            rejectObject.appendMessage(error.message);
                                            req.trace.response = rejectObject.jsonObject();
                                            ResponseSendInterceptor.sendResponse(req, res, next);
                                        } else {
                                            //subject is existing
                                            //console.log('subject is in existence');
                                            let allowedSubjectRoles = authorizationMap[req.trace.caller.role];
                                            //console.log(allowedSubjectRoles);
                                            //console.log(req.trace.caller.role);
                                            if (allowedSubjectRoles && allowedSubjectRoles.includes(result.data.role)) {
                                                //console.log('caller is allowed to access subject with this api - authorization is successful');
                                                let resObject = new ResolveData(
                                                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                                                    CommonConstants.COMMON.APP_ERROR.SUCCESS,
                                                    result.data);

                                                req.trace.subject = result.data;
                                                req.trace.response = resObject.jsonObject();
                                                next();
                                            } else {
                                                //console.log('caller is not allowed to access subject with this api  - failed authorization');
                                                rejectObject = new RejectData(
                                                    CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION,
                                                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                                    null);
                                                req.trace.response = rejectObject.jsonObject();
                                                ResponseSendInterceptor.sendResponse(req, res, next);
                                            }
                                        }
                                    } else {
                                        //console.log('invalid _id in req.params - failed authorization');
                                        rejectObject = new RejectData(
                                            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                            null);
                                        req.trace.response = rejectObject.jsonObject();
                                        ResponseSendInterceptor.sendResponse(req, res, next);
                                    }
                                } else {
                                    //console.log('not found _id in req.params - failed authorization');
                                    rejectObject = new RejectData(
                                        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                        CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_NOT_PROVIDED,
                                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                        null);
                                    req.trace.response = rejectObject.jsonObject();
                                    ResponseSendInterceptor.sendResponse(req, res, next);
                                }
                                break;
                            case AuthConstants.SUBJECT_LOCATION_IN_REQ.REQ_BODY_IDENTIFIER:
                                //console.log('subject location is - ' + AuthConstants.SUBJECT_LOCATION_IN_REQ.REQ_BODY_IDENTIFIER);
                                // Check if subject identifier is part of req.body
                                if ((req.body.phone && CommonValidator.isValidPhone(req.body.phone)) ||
                                    req.body.email && CommonValidator.isValidEmail(req.body.email)) {
                                    //console.log('found identifier in body');
                                    let userWithIdentifier = {};
                                    userWithIdentifier.identifier = {};

                                    if (req.body.phone && CommonValidator.isValidPhone(req.body.phone)) {
                                        //console.log('found req.body.phone as identifier');
                                        userWithIdentifier.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER;
                                        userWithIdentifier.identifier.id = req.body.phone.cc + req.body.phone.number;
                                    } else if (req.body.email && CommonValidator.isValidEmail(req.body.email)) {
                                        //console.log('found req.body.email as identifier');
                                        userWithIdentifier.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
                                        userWithIdentifier.identifier.id = req.body.email;
                                    }
                                    if (req.body.role) {
                                        //console.log('found role in body');
                                        let allowedSubjectRoles = authorizationMap[req.trace.caller.role];
                                        //console.log(allowedSubjectRoles);
                                        //console.log(req.body.role);
                                        if (allowedSubjectRoles.includes(req.body.role)) {
                                            //console.log('caller allowed to access this subject role using this api - authorization is successful');
                                            let resObject = new ResolveData(
                                                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                                                CommonConstants.COMMON.APP_ERROR.SUCCESS,
                                                null);

                                            req.trace.subject = null;
                                            next();
                                        } else {
                                            //console.log('caller is not allowed to access this subject role using this api - failed authorization');
                                            rejectObject = new RejectData(
                                                CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION,
                                                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                                null);
                                            req.trace.response = rejectObject.jsonObject();
                                            ResponseSendInterceptor.sendResponse(req, res, next);
                                        }

                                    } else {
                                        //console.log('not found role in body - failed authorization');
                                        msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;

                                        rejectObject = new RejectData(
                                            CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.USER_DETAILS_NOT_PROVIDED,
                                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                            null);
                                        rejectObject.appendMessage(msg);
                                        rejectObject.appendMessage('req.body.role');
                                        req.trace.response = rejectObject.jsonObject();
                                        ResponseSendInterceptor.sendResponse(req, res, next);

                                    }
                                } else {
                                    //caller identifier is not part of req.body
                                    //console.log('not found identifier in body - failed authorization');
                                    msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;

                                    rejectObject = new RejectData(
                                        CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                        CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.USER_DETAILS_NOT_PROVIDED,
                                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                        null);
                                    rejectObject.appendMessage(msg);
                                    rejectObject.appendMessage('req.body.phone or req.body.email');
                                    req.trace.response = rejectObject.jsonObject();
                                    ResponseSendInterceptor.sendResponse(req, res, next);
                                }
                                break;
                            case AuthConstants.SUBJECT_LOCATION_IN_REQ.UNKNOWN:
                            default:
                                //console.log('subject location is unknown - failed authorization');
                                rejectObject = new RejectData(
                                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                    null);
                                req.trace.response = rejectObject.jsonObject();
                                ResponseSendInterceptor.sendResponse(req, res, next);
                                break;
                        }
                    } else {
                        //console.log('subject location is not provided - failed authorization');
                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null);
                        req.trace.response = rejectObject.jsonObject();
                        ResponseSendInterceptor.sendResponse(req, res, next);
                    }
                } else {
                    //console.log('caller-subject relationship is unknown - failed authorization');
                    rejectObject = new RejectData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                        CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                        null);
                    req.trace.response = rejectObject.jsonObject();
                    ResponseSendInterceptor.sendResponse(req, res, next);
                }
            } else {
                //console.log('caller is not allowed to call this api - failed authorization');
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                req.trace.response = rejectObject.jsonObject();
                ResponseSendInterceptor.sendResponse(req, res, next);
            }
        } else {
            //console.log('caller or caller role is not found - failed authorization');
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejectObject.jsonObject();
            ResponseSendInterceptor.sendResponse(req, res, next);
        }

    } catch (e) {
        //console.log('error in authorization - failed authorization');
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);
        req.trace.response = rejectObject.jsonObject();
        ResponseSendInterceptor.sendResponse(req, res, next);
    }
}

async function authorizeCallerSubjectHierarchyRelation(req, res, next) {
    try {
        let callerHierarchy = req.trace.caller.hierarchyCode;
        let subjectHierarchy = req.trace.subject.hierarchyCode;

        //console.log(callerHierarchy);
        //console.log(subjectHierarchy);

        let callerRole = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE.filter(function (el) {
            return el.CODE === req.trace.caller.role;
        })[0];

        if (callerRole.HIERARCHICAL_ROLE === Constants.ASSETMGMT.APP_USER_HIERARCHICAL_ROLE_TYPE.NONE) {
            //The role authorization would suffice andd hierarchy authorization is not needed
            next();
        } else {
            if (req.trace.caller.role === Constants.ASSETMGMT.APP_USER_ROLE_NAMES.ADMIN &&
                req.trace.subject.role === Constants.ASSETMGMT.APP_USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER
            ) {
                next();
            } else {
                if (subjectHierarchy.startsWith(callerHierarchy)) {
                    next();
                } else {
                    let rejectObject = new RejectData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                        CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR_NOT_IN_HIERARCHY,
                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                        null);
                    req.trace.response = rejectObject.jsonObject();
                    ResponseSendInterceptor.sendResponse(req, res, next);
                }
            }
        }

    } catch (e) {
        //console.log('error in hierarchy authorization - failed authorization');
        let rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);
        req.trace.response = rejectObject.jsonObject();
        ResponseSendInterceptor.sendResponse(req, res, next);
    }
}


/**
 * authorize
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
//This is not a reqular middleware function. We do not want to store allowedSubjectRoles in req for security reasone
async function authorizeCallerPostRelation(req, res, next) {
    //Get the authorizationMap for this action
    let authorizationMap = JsonPath.query(Constants.ASSETMGMT.APP_ACTION.ACTION, '$..[?(@.API_NAME==\'' + req.trace.request.action + '\')].ALLOWED_ROLE_MAP')[0];
    //console.log(authorizationMap);
    //console.log('caller role is - ' + req.trace.caller.role);
    let error, result;
    let postId = null;
    let existingPost = {};
    let rejectObject;
    try {
        if (req.trace.caller && req.trace.caller.role) 
        {
            //console.log('found caller and caller role');
            if (Object.keys(authorizationMap).includes(req.trace.caller.role)) {
                //console.log('caller is allowed to call this api');
                if (req.trace.auth.postLocation) {
                    //console.log('post location is - ' + req.trace.auth.postLocation);
                    switch (req.trace.auth.postLocation) {
                        case AuthConstants.POST_LOCATION_IN_REQ.REQ_PARAMS_ID:
                            //console.log('post location is - ' + AuthConstants.POST_LOCATION_IN_REQ.REQ_PARAMS_ID);
                            postId = req.params.postId;
                            break;
                        case AuthConstants.POST_LOCATION_IN_REQ.UNKNOWN:
                        default:
                            //console.log('post location is unknown - failed authorization');
                            rejectObject = new RejectData(
                                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                null);
                            req.trace.response = rejectObject.jsonObject();
                            ResponseSendInterceptor.sendResponse(req, res, next);
                            break;
                    }
                    if (postId && CommonValidator.isValidMongoObjectId(postId)) {
                        //console.log('postId is valid');
                        [error, result] = await To(PostHelper.getOneById(postId));
                        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                            //console.log('postId is existing');
                            existingPost = result.data;
                            if (req.trace.auth.callerPostRelation === AuthConstants.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST) {
                                //console.log('caller is a accessing his own post');
                                if (req.trace.caller.role === CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.PLAYER) {
                                    //console.log('caller is a player');
                                    if (existingPost.poster === req.trace.caller._id.toString()) {  //TODOCHECK
                                        //console.log('post belongs to caller - authorization is successful');
                                        req.trace.post = existingPost;
                                        next();
                                    } else {
                                        //console.log('post does not belong to caller - authorization failed');
                                        rejectObject = new RejectData(
                                            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                            null);
                                        req.trace.response = rejectObject.jsonObject();
                                        ResponseSendInterceptor.sendResponse(req, res, next);
                                    }
                                } else {
                                    //console.log('caller is not a player and trying to access self post - authorization failed');
                                    rejectObject = new RejectData(
                                        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                        CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                        null);
                                    req.trace.response = rejectObject.jsonObject();
                                    ResponseSendInterceptor.sendResponse(req, res, next);
                                }
                            } else if (req.trace.auth.callerPostRelation === AuthConstants.CALLER_USER_SUBJECT_POST_RELATION.OTHER_USER_POST) {
                                //either reviewer accessing any players post
                                if (req.trace.caller.role === CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.REVIEWER) {
                                    //console.log('caller is a reviewer - authorization is successful');
                                    req.post = existingPost;
                                    next();
                                }
                                //or coach accessing his players post
                                else if (req.trace.caller.role === CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.COACH) {
                                    //console.log('caller is a coach');
                                    if (existingPost.poster in req.trace.caller.roleAssociation.associates) {
                                        //console.log('post belongs to a player associated with the coach - authorization is successful');
                                        req.trace.post = existingPost;
                                        next();
                                    } else {
                                        //console.log('post belongs to a player not associated with the coach - authorization failed');
                                        rejectObject = new RejectData(
                                            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                            null);
                                        req.trace.response = rejectObject.jsonObject();
                                        ResponseSendInterceptor.sendResponse(req, res, next);
                                    }
                                } else {
                                    //console.log('caller is a neither a player nor coach nor reviewer - authorization failed');
                                    rejectObject = new RejectData(
                                        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                        CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                        null);
                                    req.trace.response = rejectObject.jsonObject();
                                    ResponseSendInterceptor.sendResponse(req, res, next);
                                }
                            } else {
                                //console.log('caller-subject relationship is unknown - failed authorization');
                                rejectObject = new RejectData(
                                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                    null);
                                req.trace.response = rejectObject.jsonObject();
                                ResponseSendInterceptor.sendResponse(req, res, next);
                            }
                        } else {
                            //console.log('postId is not existing');
                            rejectObject = new RejectData(
                                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                null);
                            rejectObject.appendMessage(error.message);
                            req.trace.response = rejectObject.jsonObject();
                            ResponseSendInterceptor.sendResponse(req, res, next);
                        }
                    } else {
                        //console.log('postId is not valid');
                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null);
                        req.trace.response = rejectObject.jsonObject();
                        ResponseSendInterceptor.sendResponse(req, res, next);
                    }
                } else {
                    //console.log('there is no subject-post - authorization is successful');
                    next();

                }
            } else {
                //console.log('caller is not allowed to call this api - failed authorization');
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                req.trace.response = rejectObject.jsonObject();
                ResponseSendInterceptor.sendResponse(req, res, next);
            }
        } else {
            //console.log('caller or caller role is not found - failed authorization');
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejectObject.jsonObject();
            ResponseSendInterceptor.sendResponse(req, res, next);
        }
    } catch (e) {
        //console.log('error in authorization - failed authorization');
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);
        req.trace.response = rejectObject.jsonObject();
        ResponseSendInterceptor.sendResponse(req, res, next);
    }
}

/**
 * authorize
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
//This is not a reqular middleware function. We do not want to store allowerSubjectRoles in req for security reasone
async function authorizeCallerForWhitelist(req, res, next) {
    //Get the authorizationMap for this action
    let authorizationMap = JsonPath.query(Constants.ASSETMGMT.APP_ACTION.ACTION, '$..[?(@.API_NAME==\'' + req.trace.request.action + '\')].ALLOWED_ROLE_MAP')[0];
    //console.log(authorizationMap);
    //console.log('caller role is - ' + req.trace.caller.role);
    var msg;
    try {
        if (req.trace.caller && req.trace.caller.role) {
            if (authorizationMap.includes(req.trace.caller.role)) {
                //console.log('caller is allowed to call this api');
                //console.log(req.trace.auth.callerPostRelation);
                next();
            } else {
                //console.log('caller is not allowed to call this api - failed authorization');
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                req.trace.response = rejectObject.jsonObject();
                ResponseSendInterceptor.sendResponse(req, res, next);
            }
        } else {
            //console.log('caller or caller role is not found - failed authorization');
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejectObject.jsonObject();
            ResponseSendInterceptor.sendResponse(req, res, next);
        }

    } catch (e) {
        //console.log('error in authorization - failed authorization');
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);
        req.trace.response = rejectObject.jsonObject();
        ResponseSendInterceptor.sendResponse(req, res, next);
    }
}

/**
 * authorize
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
//This is not a reqular middleware function. We do not want to store allowerSubjectRoles in req for security reasone
async function authorizeCallerForTestimonial(req, res, next) {
    //Get the authorizationMap for this action
    let authorizationMap = JsonPath.query(Constants.ASSETMGMT.APP_ACTION.ACTION, '$..[?(@.API_NAME==\'' + req.trace.request.action + '\')].ALLOWED_ROLE_MAP')[0];
    var msg;
    try {
        if (req.trace.caller && req.trace.caller.role) {
            if (authorizationMap.includes(req.trace.caller.role)) {
                // console.log(req.trace.auth.callerPostRelation);
                next();
            } else {
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                req.trace.response = rejectObject.jsonObject();
                ResponseSendInterceptor.sendResponse(req, res, next);
            }
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejectObject.jsonObject();
            ResponseSendInterceptor.sendResponse(req, res, next);
        }

    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);
        req.trace.response = rejectObject.jsonObject();
        ResponseSendInterceptor.sendResponse(req, res, next);
    }
}

/**
 * authorize
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
//This is not a reqular middleware function. We do not want to store allowerSubjectRoles in req for security reasone
async function authorizeCallerForCourt(req, res, next) {
    let rejectObject;
    //Get the authorizationMap for this action
    let authorizationMap = JsonPath.query(Constants.ASSETMGMT.APP_ACTION.ACTION, '$..[?(@.API_NAME==\'' + req.trace.request.action + '\')].ALLOWED_ROLE_MAP')[0];
    //console.log(authorizationMap);
    var msg;
    try {
        if (req.trace.caller && req.trace.caller.role) {
            if (authorizationMap.includes(req.trace.caller.role)) {
                // console.log(req.trace.auth.callerPostRelation);
                next();
            } else {
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                req.trace.response = rejectObject.jsonObject();
                ResponseSendInterceptor.sendResponse(req, res, next);
            }
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejectObject.jsonObject();
            ResponseSendInterceptor.sendResponse(req, res, next);
        }

    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);
        req.trace.response = rejectObject.jsonObject();
        ResponseSendInterceptor.sendResponse(req, res, next);
    }
}

/**
 * authorize
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
//This is not a reqular middleware function. We do not want to store allowerSubjectRoles in req for security reasone
async function authorizeCallerToGetCamera(req, res, next) {
    let rejectObject;
    try {
        if (req.trace.caller && (req.trace.caller.role == 'player')) {
            next();
        } else {
            //console.log('caller or caller role is not found - failed authorization');
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejectObject.jsonObject();
            ResponseSendInterceptor.sendResponse(req, res, next);
        }

    } catch (e) {
        //console.log('error in authorization - failed authorization');
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);
        req.trace.response = rejectObject.jsonObject();
        ResponseSendInterceptor.sendResponse(req, res, next);
    }
}

/**
 * authenticate the user
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function authenticateUserOld1(req, res, next) {
    /*
    *    get the caller details in this function(req.trace.caller is filled in this function) 
    *    caller comes from following cources:
    *      - bearer token in req.headers.authorization(for the following apis)
                CREATE: 'user.create',
                LOGOUT: 'user.logout',
                TOKEN_REFRESH: 'user.token_refresh',
                READ_SELF: 'user.read_self',
                READ: 'user.read',
                READ_PROFILE_PIC_SELF: 'user.read_profile_pic_self',
                UPDATE_SELF: 'user.update_self',
                UPDATE_PROFILE_PIC_SELF: 'update_profile_pic_self',
                UPDATE: 'user.update',
                DELETE_SELF: 'user.delete_self',
                DELETE: 'user.delete',
                SEARCH_COUNT: 'user.search_count',
                SEARCH: 'user.search'
    *      - _id in params(req.params._id for the following apis)
                OTP_REGISTER: 'user.register_using_otp',
                OTP_REGISTER_LOGIN: 'user.register_and_login_using_otp',
    *      - identifier in body(req.body.phone or req.body.email for the following apis)
                OTP_FOR_REGISTRATION: 'user.otp_for_register',
                OTP_FOR_LOGIN: 'user.otp_for_login',
                OTP_LOGIN: 'user.login_using_otp',
                PASSWORD_LOGIN: 'user.login_using_password',
    *    authenticate the caller
    *    fill req.trace.authenticated
    */
    try {
        // Initialize
        let token, error, result, blacklistedTokenResult, decoded;
        var rejectObject;

        // Check if token is part of Authorization Bearer header and extract it
        if (req.headers.authorization) {
            ////console.log('found authorization header');
            var bearerArr = req.headers.authorization.split(' ');
            if (bearerArr && Array.isArray(bearerArr) && bearerArr.length == 2
                && (bearerArr[0] == 'bearer' || bearerArr[0] == 'Bearer')) {
                token = bearerArr[1];
            }

            if (token) {
                let validUserAudience = Constants.ASSETMGMT.APP_JWT.AUDIENCE.USERS;
                ////console.log('found token');
                //Is token valid?
                ////console.log(validUserAudience);
                [error, decoded] = await To(CommonJWTHelper.verifyJWT(token, validUserAudience));
                if (!CommonValidator.isSuccessResponseAndNonEmptyData(decoded)) {
                    //invalid token
                    ////console.log('invalid token - failed authentication');
                    rejectObject = new RejectData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                        CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                        error);
                    rejectObject.appendMessage(error.message);
                    req.trace.response = rejectObject.jsonObject();
                    ResponseSendInterceptor.sendResponse(req, res, next);
                } else {
                    //valid token
                    //Check if token is blacklisted
                    error = null;
                    [error, blacklistedTokenResult] = await To(UserTokenBlacklistedHelper.checkIfBlacklisted(decoded.data.jti, token, null));

                    if (CommonValidator.isSuccessResponseAndNonEmptyData(blacklistedTokenResult)) {
                        //token is blacklisted
                        ////console.log('token is blacklisted - failed authentication');
                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null);
                        req.trace.response = rejectObject.jsonObject();
                        ResponseSendInterceptor.sendResponse(req, res, next);
                    } else {
                        //Check if user(jti) is really existing?
                        error = null;
                        [error, result] = await To(UserHelper.getOneByIdInternal(decoded.data.jti));
                        if (!CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                            //user is not in existence
                            ////console.log('user is not in existence - failed authentication');
                            rejectObject = new RejectData(
                                CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                error);
                            rejectObject.appendMessage(error.message);
                            req.trace.response = rejectObject.jsonObject();
                            ResponseSendInterceptor.sendResponse(req, res, next);
                        } else {
                            //user is existing and authentication is done
                            ////console.log('user is in existence');
                            if (!(result.data.token.token === token)) {
                                //token is not matching
                                ////console.log('token is not matching - failed authentication');
                                rejectObject = new RejectData(
                                    CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                    error);
                                rejectObject.appendMessage(error.message);
                                req.trace.response = rejectObject.jsonObject();
                                ResponseSendInterceptor.sendResponse(req, res, next);
                            } else if (result.data.token.expiry < Date.now()) {
                                //token has expired
                                ////console.log('token has expired - failed authentication');
                                rejectObject = new RejectData(
                                    CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                    error);
                                rejectObject.appendMessage(error.message);
                                req.trace.response = rejectObject.jsonObject();
                                ResponseSendInterceptor.sendResponse(req, res, next);
                            } else {
                                ////console.log('successful authentication');
                                req.trace.caller = result.data;
                                req.trace.authenticated = true;
                                next();
                            }
                        }
                    }
                }
            } else {
                //Token is not provided
                ////console.log('token is not available - failed authentication');
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_NOT_PROVIDED,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                req.trace.response = rejectObject.jsonObject();
                ResponseSendInterceptor.sendResponse(req, res, next);
            }
        } else if ((req.body.phone && CommonValidator.isValidPhone(req.body.phone)) ||
            req.body.email && CommonValidator.isValidEmail(req.body.email)) {
            ////console.log('found identifier in body');
            let userWithIdentifier = {};
            userWithIdentifier.identifier = {};

            if (req.body.phone && CommonValidator.isValidPhone(req.body.phone)) {
                ////console.log('found req.body.phone as identifier');
                userWithIdentifier.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER;
                userWithIdentifier.identifier.id = req.body.phone.cc + req.body.phone.number;
            } else if (req.body.email && CommonValidator.isValidEmail(req.body.email)) {
                ////console.log('found req.body.email as identifier');
                userWithIdentifier.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
                userWithIdentifier.identifier.id = req.body.email;
            }
            let error, result;
            [error, result] = await To(UserHelper.getOneByIdentifierInternal(userWithIdentifier, null));
            if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                ////console.log('successfully fetched the user from identifier - successful authentication');
                req.trace.caller = result.data;
                ////console.log(req.trace.caller);
                req.trace.authenticated = true;
                next();
            } else {
                //user is not in existence
                ////console.log('could not fetch the identifier in body - failed authentication');
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                    CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.USER_NOT_FOUND,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                req.trace.response = rejectObject.jsonObject();
                ResponseSendInterceptor.sendResponse(req, res, next);
            }
        } else {
            ////console.log('failed authentication');
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHENTICATION_ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejectObject.jsonObject();
            ResponseSendInterceptor.sendResponse(req, res, next);
        }
    } catch (e) {
        ////console.log('unknown error leading to exception');
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHENTICATION_ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        req.trace.response = rejectObject.jsonObject();
        ResponseSendInterceptor.sendResponse(req, res, next);
    }
}





/**
* authorize user
* @param {*} req
* @param {*} res
* @param {*} next
*/
async function authorizeUserActionOld(req, res, next) {
    try {
        req.trace.authorized = false;
        req.trace.subject = {};
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);
        switch (req.trace.request.action) {
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_FOR_REGISTRATION:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_FOR_LOGIN:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.PASSWORD_LOGIN:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_LOGIN:
            //authentication not needed(no known caller), authorization not needed(no subject), only for self. no restrictions for these APIs
            req.trace.subject = null;
            req.trace.authorized = true;
            break;
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_REGISTER:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.OTP_REGISTER_LOGIN:
            //authentication needed(known caller), authorization not needed(no subject, only for self). no restrictions for these APIs
            //Only fill in the req.trace.subject as data is available
            if (!req.params._id || !CommonValidator.isValidMongoObjectId(req.params._id)) {
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                    CommonConstants.COMMON.APP_ERROR.SUBJECT_ERROR.NOT_PROVIDED,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                rejectObject.appendMessage('req.params._id');
                req.trace.response = rejectObject.jsonObject();
                ResponseSendInterceptor.sendResponse(req, res, next);
            } else {
                req.trace.subject = {
                    _id: req.params._id,
                    role: null
                };
                req.trace.authorized = true;
            }
            break;
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.LOGOUT:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.TOKEN_REFRESH:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.READ_SELF:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.READ_PROFILE_PIC_SELF:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.UPDATE_SELF:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.DELETE_SELF:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.SEARCH_COUNT:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.SEARCH:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.POST.CREATE:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.POST.SEARCH_COUNT:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.POST.SEARCH:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.POST.READ:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.POST.UPDATE:
            //no authorization(no subject, only for self) for these API
            req.trace.authorized = true;
            req.trace.subject = req.trace.caller;
            break;
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.READ:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.UPDATE:
        case Constants.ASSETMGMT.APP_ACTION.ACTION.USER.DELETE:
            //Authorization is needed
            //1. deny if caller role level is lower than subject role level)
            //2. deny if caller does not belong to subject hierarchy
            //there is only one superadmin in the system
            //superadmin has crud authority on admin; no authority on lower levels
            //admin has no authority on other admins; can create next level user(enterprise_root_owner)
            //next level user(enterprise_root_owner) has crud authority on lower levels; however cannot use self apis on their behalf
            //next level user(enterprise_owner) has crud authority on lower levels; however cannot use self apis on their behalf
            //next level user(owner) can only use self apis

            //1. deny if caller role level is lower than subject role level)
            //Get the role level of the caller
            var callerRole, callerRoleLevel;
            var subjectUser, subjectId, subjectRole, subjectRoleLevel;
            var roles = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE;
            if (req.trace.caller && req.trace.caller.role) {
                callerRole = roles.filter(function (el) {
                    return el.CODE === req.trace.caller.role;
                });
                callerRoleLevel = callerRole.LEVEL;
            }

            //Get the role level of the subject
            if (req.params._id) {
                subjectId = req.params._id;
                let error, result;
                [error, result] = await To(UserHelper.getOneByIdInternal(subjectId));
                if (!CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                    //subject user is not in existence
                    rejectObject = new RejectData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                        CommonConstants.COMMON.APP_ERROR.RESOURCE_ERROR.NOT_FOUND,
                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                        error);
                    rejectObject.appendMessage(subjectId);
                    rejectObject.appendMessage(error.message);
                    req.trace.response = rejectObject.jsonObject();
                    ResponseSendInterceptor.sendResponse(req, res, next);
                } else {
                    //subject user is existing
                    subjectUser = result.data;
                    if (subjectUser && subjectUser.role) {
                        subjectRole = roles.filter(function (el) {
                            return el.CODE === subjectUser.role;
                        });
                        subjectRoleLevel = subjectRole.LEVEL;
                    }
                    if (subjectRoleLevel > callerRoleLevel) {
                        //TODO 2. deny if caller does not belong to subject hierarchy
                        req.trace.authorized = true;
                        req.trace.subject = subjectUser;

                    } else {
                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null);
                        req.trace.response = rejectObject.jsonObject();
                        ResponseSendInterceptor.sendResponse(req, res, next);
                    }
                }
            } else {
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                    CommonConstants.COMMON.APP_ERROR.SUBJECT_ERROR.NOT_FOUND,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                rejectObject.appendMessage('req.params._id');
                req.trace.response = rejectObject.jsonObject();
                ResponseSendInterceptor.sendResponse(req, res, next);
            }
            break;
        default:
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_VERIFICATION_ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
                null);
            req.trace.response = rejectObject.jsonObject();
            ResponseSendInterceptor.sendResponse(req, res, next);
            break;
        }

        if (req.trace.authorized) {
            next();
        }
    } catch (e) {
        ////console.log('unknown error leading to exception');
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_VERIFICATION_ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        req.trace.response = rejectObject.jsonObject();
        ResponseSendInterceptor.sendResponse(req, res, next);
    }
}


/**
* authorize user
* @param {*} req
* @param {*} res
* @param {*} next
*/
async function authorizeUserAction(req, res, next) {
    /*
    *    Authorization:
    *        - identify the needed authorization checks(fill req.trace.authorization.pendingAuthorization)
    *        - establish the subject(callee) from req.trace.authorization.subjectLocation. It can be one among the following:
    *            - CALLER_IS_SUBJECT
    *                - caller is already validated,
    *                - validate authorization as per user role 
    *                    - if successful; fill req.trace.subject and return success 
    *                    - if failed; return authorization failure
    *            - EXISTING_SUBJECT_ID_IN_PARAM
    *                - fetch subject; 
    *                - if existing, 
    *                    - validate authorization as per user role 
    *                        - if successful; fill req.trace.subject and return success 
    *                        - if failed; return authorization failure
    *                - if not existing, 
    *                    - return authorization failure
    *            - SUBJECT_TO_CREATE_IN_BODY
    *                - validate authorization as per user role 
    *                    - if successful; fill req.trace.subject and return success 
    *                    - if failed; return authorization failure
    *            - UNKNOWN_SUBJECT
    *                return authorization failure
    */

    try {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);

        let resObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.USER.GET_ONE_BY_ID.SUCCESS,
            null);
        let error, result;

        let callerRole, callerRoleArray;
        var roles = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE;
        if (req.trace.caller && req.trace.caller.role) {
            ////console.log('got caller role');
            callerRoleArray = roles.filter(function (el) {
                return el.CODE === req.trace.caller.role;
            });
            callerRole = callerRoleArray[0];
            if (callerRole.AUTHORIZATIONS[req.trace.request.action]) {
                ////console.log('got caller role authorizations');
                req.trace.authorization.pendingAuthorization = callerRole.AUTHORIZATIONS[req.trace.request.action];
                switch (req.trace.authorization.subjectLocation) {
                    case AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.CALLER_IS_SUBJECT:
                        ////console.log('subject location - ' + AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.CALLER_IS_SUBJECT);
                        error = result = null;
                        [error, result] = await To(AuthConstants.checkAuthorization(req.trace.caller, req.trace.authorization));
                        if (error) {
                            ////console.log('authorization failed');
                            req.trace.authorization.authorized = false;
                            delete req.trace.authorization.pendingAuthorization;
                            req.trace.response = error;
                            ResponseSendInterceptor.sendResponse(req, res, next);
                        } else {
                            ////console.log('authorization success');
                            req.trace.subject = req.trace.caller;
                            req.trace.authorization.authorized = true;
                            delete req.trace.authorization.pendingAuthorization;
                            if (!req.trace.authorization.processingBeyondAuthenticationAndAuthorization) {
                                resObject.setData(req.trace.subject);
                                req.trace.response = resObject.jsonObject();
                            }
                            next();
                        }
                        break;
                    case AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.EXISTING_SUBJECT_ID_IN_PARAM:
                        ////console.log('subject location - ' + AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.EXISTING_SUBJECT_ID_IN_PARAM);
                        if (req.params._id && CommonValidator.isValidMongoObjectId(req.params._id)) {
                            ////console.log('found req.params._id');
                            error = result = null;
                            [error, result] = await To(UserHelper.getOneByIdInternal(req.params._id));
                            if (CommonValidator.isSuccessResponseAndNonEmptyData(result) &&
                                (req.params._id === result.data._id)) {
                                ////console.log('successfully fetched the subject');
                                let subject = result.data;
                                error = result = null;
                                [error, result] = await To(AuthConstants.checkAuthorization(subject, req.trace.authorization));
                                if (error) {
                                    ////console.log('authorization failed');
                                    req.trace.authorization.authorized = false;
                                    delete req.trace.authorization.pendingAuthorization;
                                    req.trace.response = error;
                                    ResponseSendInterceptor.sendResponse(req, res, next);
                                } else {
                                    ////console.log('authorization success');
                                    req.trace.subject = subject;
                                    req.trace.authorization.authorized = true;
                                    delete req.trace.authorization.pendingAuthorization;
                                    if (!req.trace.authorization.processingBeyondAuthenticationAndAuthorization) {
                                        resObject.setData(req.trace.subject);
                                        req.trace.response = resObject.jsonObject();
                                    }
                                    next();
                                }
                            } else {
                                //user is not in existence
                                ////console.log('could not fetch the subject - authorization failed');
                                rejectObject = new RejectData(
                                    CommonConstants.COMMON.APP_HTTP.STATUS.NOT_FOUND.CODE,
                                    Constants.ASSETMGMT.USER.GET_ONE_BY_ID.ERROR,
                                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                    null);
                                req.trace.response = rejectObject.jsonObject();
                                ResponseSendInterceptor.sendResponse(req, res, next);
                            }
                        } else {
                            ////console.log('not found req.params._id - authorization failed');
                            rejectObject = new RejectData(
                                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                Constants.ASSETMGMT.USER.GET_ONE_BY_ID.ERROR,
                                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                null);
                            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
                            rejectObject.appendMessage('req.params._id');
                            req.trace.response = rejectObject.jsonObject();
                            ResponseSendInterceptor.sendResponse(req, res, next);
                        }
                        break;
                    case AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.SUBJECT_TO_CREATE_IN_BODY:
                        ////console.log('subject location - ' + AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.SUBJECT_TO_CREATE_IN_BODY);
                        error = result = null;
                        [error, result] = await To(AuthConstants.checkAuthorization(req.body, req.trace.authorization));
                        if (error) {
                            ////console.log('authorization failed');
                            req.trace.authorization.authorized = false;
                            delete req.trace.authorization.pendingAuthorization;
                            req.trace.response = error;
                            ResponseSendInterceptor.sendResponse(req, res, next);
                        } else {
                            ////console.log('authorization success');
                            req.trace.subject = req.body;
                            req.trace.authorization.authorized = true;
                            delete req.trace.authorization.pendingAuthorization;
                            if (!req.trace.authorization.processingBeyondAuthenticationAndAuthorization) {
                                resObject.setData(req.trace.subject);
                                req.trace.response = resObject.jsonObject();
                            }
                            next();
                        }
                        break;
                    case AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.UNKNOWN_SUBJECT:
                        ////console.log('subject location - ' + AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.UNKNOWN_SUBJECT);
                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.NOT_FOUND.CODE,
                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null);
                        req.trace.response = rejectObject.jsonObject();
                        ResponseSendInterceptor.sendResponse(req, res, next);
                        break;
                    default:
                        ////console.log('subject location - default');
                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.NOT_FOUND.CODE,
                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null);
                        req.trace.response = rejectObject.jsonObject();
                        ResponseSendInterceptor.sendResponse(req, res, next);
                        break;
                }
            } else {
                ////console.log('not got caller role authorizations - authorization failed');
                req.trace.authorization.authorized = false;
                delete req.trace.authorization.pendingAuthorization;
                req.trace.response = rejectObject.jsonObject();
                ResponseSendInterceptor.sendResponse(req, res, next);
            }
        }


    } catch (e) {
        ////console.log('unknown error leading to exception');
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        req.trace.response = rejectObject.jsonObject();
        ResponseSendInterceptor.sendResponse(req, res, next);
    }
}

/**
* authorize user
* @param {*} req
* @param {*} res
* @param {*} next
*/
async function authorizeUserActionOld1(req, res, next) {
    //if possible authorize the action here
    //    this means that the following should be known here
    //    req.trace.authorization.pendingAuthorization(empty means known and if empty, req.trace.subject is same as req.trace.caller )
    //    fill req.trace.subject
    //else prepare data to conduct authorizations in postAuthorizeUserAction
    //    req.trace.authorization.pendingAuthorization must be known here, so fill it here
    //    req.trace.subject shall be filled in next()
    //    and authorization will happen in postAuthorizeUserAction

    //Another perspective:
    /*
    *    fill req.trace.authorization.pendingAuthorization
    *    check req.trace.authorization.pendingAuthorization
    *    if empty => 
    *      req.trace.subject is same as caller; fill req.trace.authorization.authorized;
    *    else => 
    *      identify the location of subject from req.trace.authorization.subjectLocation
    *      if subject is available(like in body in the case of creation)
    *        use it for performing authorization
    *      else if subjectId is available(like in param in the case of get, update, delete)
    *        use it to fetch the subject and perform authorization
    *      else
    *        error case
    *
    * */
    try {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);

        let resObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.USER.GET_ONE_BY_ID.SUCCESS,
            null);
        // eslint-disable-next-line no-case-declarations
        let error, result;

        //fill req.trace.authorization.pendingAuthorization
        let callerRole, callerRoleArray;
        var roles = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE;
        if (req.trace.caller && req.trace.caller.role) {
            ////console.log('got caller role');
            callerRoleArray = roles.filter(function (el) {
                return el.CODE === req.trace.caller.role;
            });
            callerRole = callerRoleArray[0];
            /*
            *    fill req.trace.authorization.pendingAuthorization
            */
            if (callerRole.AUTHORIZATIONS[req.trace.request.action]) {
                ////console.log('got caller role authorizations');
                req.trace.authorization.pendingAuthorization = callerRole.AUTHORIZATIONS[req.trace.request.action];
                /*
                *    check req.trace.authorization.pendingAuthorization
                *    if empty => 
                *      req.trace.subject is same as caller; fill req.trace.authorization.authorized;
                *    else => 
                *      identify the location of subject from req.trace.authorization.subjectLocation
                *      if subject is available(like in body in the case of creation)
                *        use it for performing authorization
                *      else if subjectId is available(like in param in the case of get, update, delete)
                *        use it to fetch the subject and perform authorization
                *      else
                *        error case
                *
                */

                /*
                *    check req.trace.authorization.pendingAuthorization
                */

                if (!CommonValidator.isNonEmptyObject(req.trace.authorization.pendingAuthorization)) {
                    /*
                    *    if empty => 
                    *      req.trace.subject is same as caller; fill req.trace.authorization.authorized;
                    */
                    ////console.log('caller role authorization is empty');
                    req.trace.subject = req.trace.caller;
                    req.trace.authorization.authorized = true;
                    delete req.trace.authorization.pendingAuthorization;
                    if (!req.trace.authorization.processingBeyondAuthenticationAndAuthorization) {
                        resObject.setData(req.trace.subject);
                        req.trace.response = resObject.jsonObject();
                    }
                    next();
                } else {
                    /*
                    *    else => 
                    *      identify the location of subject from req.trace.authorization.subjectLocation
                    */
                    ////console.log('caller role authorization is not empty');
                    switch (req.trace.authorization.subjectLocation) {
                        case AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.SUBJECT_TO_CREATE_IN_BODY:
                            ////console.log('subject location - ' + AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.SUBJECT_TO_CREATE_IN_BODY);
                            /*
                            *      if subject is available(like in body in the case of creation)
                            *        use it for performing authorization
                            */
                            // eslint-disable-next-line no-case-declarations
                            let subject = req.body;
                            error = result = null;
                            [error, result] = await To(AuthConstants.checkAuthorization(subject, req.trace.authorization));
                            if (error) {
                                ////console.log('authorization failed');
                                req.trace.authorization.authorized = false;
                                delete req.trace.authorization.pendingAuthorization;
                                req.trace.response = error;
                                ResponseSendInterceptor.sendResponse(req, res, next);
                            } else {
                                ////console.log('authorization success');
                                req.trace.subject = subject;
                                req.trace.authorization.authorized = true;
                                delete req.trace.authorization.pendingAuthorization;
                                if (!req.trace.authorization.processingBeyondAuthenticationAndAuthorization) {
                                    resObject.setData(req.trace.subject);
                                    req.trace.response = resObject.jsonObject();
                                }
                                next();
                            }
                            break;
                        case AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.EXISTING_SUBJECT_ID_IN_PARAM:
                            ////console.log('subject location - ' + AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.EXISTING_SUBJECT_ID_IN_PARAM);
                            /*
                            *      else if subjectId is available(like in param in the case of get, update, delete)
                            *        use it to fetch the subject and perform authorization
                            */
                            if (req.params._id && CommonValidator.isValidMongoObjectId(req.params._id)) {
                                ////console.log('found req.params._id');
                                error = result = null;
                                [error, result] = await To(UserHelper.getOneByIdInternal(req.params._id));
                                if (CommonValidator.isSuccessResponseAndNonEmptyData(result) &&
                                    (req.params._id === result.data._id)) {
                                    ////console.log('successfully fetched the subject');
                                    let subject = result.data;
                                    error = result = null;
                                    [error, result] = await To(AuthConstants.checkAuthorization(subject, req.trace.authorization));
                                    if (error) {
                                        ////console.log('authorization failed');
                                        req.trace.authorization.authorized = false;
                                        delete req.trace.authorization.pendingAuthorization;
                                        req.trace.response = error;
                                        ResponseSendInterceptor.sendResponse(req, res, next);
                                    } else {
                                        ////console.log('authorization success');
                                        req.trace.subject = subject;
                                        req.trace.authorization.authorized = true;
                                        delete req.trace.authorization.pendingAuthorization;
                                        if (!req.trace.authorization.processingBeyondAuthenticationAndAuthorization) {
                                            resObject.setData(req.trace.subject);
                                            req.trace.response = resObject.jsonObject();
                                        }
                                        next();
                                    }
                                } else {
                                    //user is not in existence
                                    ////console.log('could not fetch the subject');
                                    rejectObject = new RejectData(
                                        CommonConstants.COMMON.APP_HTTP.STATUS.NOT_FOUND.CODE,
                                        Constants.ASSETMGMT.USER.GET_ONE_BY_ID.ERROR,
                                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                        null);
                                    req.trace.response = rejectObject.jsonObject();
                                    ResponseSendInterceptor.sendResponse(req, res, next);
                                }
                            } else {
                                ////console.log('authorization failed');
                                rejectObject = new RejectData(
                                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                    Constants.ASSETMGMT.USER.GET_ONE_BY_ID.ERROR,
                                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                    null);
                                rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
                                rejectObject.appendMessage('req.params._id');
                                req.trace.response = rejectObject.jsonObject();
                                ResponseSendInterceptor.sendResponse(req, res, next);
                            }
                            break;
                        case AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.EXISTING_SUBJECT_IDENTIFIER_IN_BODY:
                            ////console.log('subject location - ' + AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.EXISTING_SUBJECT_IDENTIFIER_IN_BODY);
                            if ((req.body.phone && CommonValidator.isValidPhone(req.body.phone)) ||
                                req.body.email && CommonValidator.isValidPhone(req.body.email)) {
                                let identifier;

                                if (req.body.phone && CommonValidator.isValidPhone(req.body.phone)) {
                                    ////console.log('found req.body.phone');
                                    identifier = req.body.phone.cc + req.body.phone.number;
                                } else if (req.body.email && CommonValidator.isValidPhone(req.body.email)) {
                                    ////console.log('found req.body.email');
                                    identifier = req.body.email;
                                }

                                error = result = null;
                                ////console.log(identifier);
                                [error, result] = await To(UserHelper.getOneByIdentifierInternal(identifier));
                                if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                                    ////console.log('successfully fetched the subject');
                                    let subject = result.data;
                                    error = result = null;
                                    [error, result] = await To(AuthConstants.checkAuthorization(subject, req.trace.authorization));
                                    if (error) {
                                        ////console.log('authorization failed');
                                        req.trace.authorization.authorized = false;
                                        delete req.trace.authorization.pendingAuthorization;
                                        req.trace.response = error;
                                        ResponseSendInterceptor.sendResponse(req, res, next);
                                    } else {
                                        ////console.log('authorization success');
                                        req.trace.subject = subject;
                                        req.trace.authorization.authorized = true;
                                        delete req.trace.authorization.pendingAuthorization;
                                        if (!req.trace.authorization.processingBeyondAuthenticationAndAuthorization) {
                                            resObject.setData(req.trace.subject);
                                            req.trace.response = resObject.jsonObject();
                                        }
                                        next();
                                    }
                                } else {
                                    //user is not in existence
                                    ////console.log('could not fetch the subject');
                                    rejectObject = new RejectData(
                                        CommonConstants.COMMON.APP_HTTP.STATUS.NOT_FOUND.CODE,
                                        Constants.ASSETMGMT.USER.GET_ONE_BY_ID.ERROR,
                                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                        null);
                                    req.trace.response = rejectObject.jsonObject();
                                    ResponseSendInterceptor.sendResponse(req, res, next);
                                }
                            } else {
                                ////console.log('authorization failed');
                                rejectObject = new RejectData(
                                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                                    Constants.ASSETMGMT.USER.GET_ONE_BY_ID.ERROR,
                                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                    null);
                                rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
                                rejectObject.appendMessage('req.params._id');
                                req.trace.response = rejectObject.jsonObject();
                                ResponseSendInterceptor.sendResponse(req, res, next);
                            }
                            break;
                        case AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.SUBJECT_TO_SEARCH_IN_BODY_CONDITION:
                            ////console.log('subject location - ' + AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.SUBJECT_TO_SEARCH_IN_BODY_CONDITION);
                            subject = req.body.condition;
                            // eslint-disable-next-line no-case-declarations
                            error = result = null;
                            [error, result] = await To(AuthConstants.checkAuthorization(subject, req.trace.authorization));
                            if (error) {
                                ////console.log('authorization failed');
                                req.trace.authorization.authorized = false;
                                delete req.trace.authorization.pendingAuthorization;
                                req.trace.response = error;
                                ResponseSendInterceptor.sendResponse(req, res, next);
                            } else {
                                ////console.log('authorization success');
                                req.trace.subject = subject;
                                req.trace.authorization.authorized = true;
                                delete req.trace.authorization.pendingAuthorization;
                                if (!req.trace.authorization.processingBeyondAuthenticationAndAuthorization) {
                                    resObject.setData(req.trace.subject);
                                    req.trace.response = resObject.jsonObject();
                                }
                                next();
                            }
                            break;
                        case AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.CALLER_IS_SUBJECT:
                            ////console.log('subject location - ' + AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.CALLER_IS_SUBJECT);
                            /*
                            *      if subject is available(like in body in the case of creation)
                            *        use it for performing authorization
                            */
                            // eslint-disable-next-line no-case-declarations
                            //let subject = req.trace.subject;
                            // eslint-disable-next-line no-case-declarations
                            error = result = null;
                            ////console.log(req.trace);
                            [error, result] = await To(AuthConstants.checkAuthorization(req.trace.subject, req.trace.authorization));
                            ////console.log(error);
                            ////console.log(result);
                            if (error) {
                                ////console.log('authorization failed');
                                req.trace.authorization.authorized = false;
                                delete req.trace.authorization.pendingAuthorization;
                                req.trace.response = error;
                                ResponseSendInterceptor.sendResponse(req, res, next);
                            } else {
                                ////console.log('authorization success');
                                req.trace.subject = subject;
                                req.trace.authorization.authorized = true;
                                delete req.trace.authorization.pendingAuthorization;
                                if (!req.trace.authorization.processingBeyondAuthenticationAndAuthorization) {
                                    resObject.setData(req.trace.subject);
                                    req.trace.response = resObject.jsonObject();
                                }
                                next();
                            }
                        case AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.UNKNOWN_SUBJECT:
                            ////console.log('subject location - ' + AuthConstants.AUTHORIZATION_SUBJECT_IN_REQ.UNKNOWN_SUBJECT);
                        //return error
                        default:
                            ////console.log('subject location - default');
                            rejectObject = new RejectData(
                                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_VERIFICATION_ERROR,
                                CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
                                null);
                            req.trace.response = rejectObject.jsonObject();
                            ResponseSendInterceptor.sendResponse(req, res, next);
                            break;
                    }
                }
            } else {
                ////console.log('no authorization for this api for this role');
                req.trace.response = rejectObject.jsonObject();
                ResponseSendInterceptor.sendResponse(req, res, next);
            }
        } else {
            //user role(mandatory field) is not populated - this should never happen
            ////console.log('caller role not populated');
            let rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejectObject.jsonObject();
            ResponseSendInterceptor.sendResponse(req, res, next);
        }


    } catch (e) {
        ////console.log('unknown error leading to exception');
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_VERIFICATION_ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        req.trace.response = rejectObject.jsonObject();
        ResponseSendInterceptor.sendResponse(req, res, next);
    }
}

/**
* authorize user
* @param {*} req
* @param {*} res
* @param {*} next
*/
async function postAuthorizeUserAction(req, res, next) {
    //expect req.trace.subject to be filled by this time
    //and perform the authorization based on the condition in req.trace.authorization.pendingAuthorization

    let rejectObject, resObject;

    if (!req.trace.authorization.authorized) {
        let error, result;
        [error, result] = await To(AuthConstants.checkAuthorization(req.trace.subject, req.trace.authorization.pendingAuthorization));
        req.trace.response = error || result;
    } else {
        if (CommonValidator.isNonEmptyObject(req.trace.response)) {
            //Nothing to do
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_VERIFICATION_ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
                null);
            req.trace.response = rejectObject.jsonObject();
        }
    }
    next();
}