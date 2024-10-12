module.exports = {
    authenticateApplication: authenticateApplication,
};

// Imports
const CommonJWTHelper = require('../../common/jwt/helpers/jwt');
const To = require('../../common/to/to');
const Constants = require('../constant/constant');
const CommonConstants = require('../../common/constant/constant');
const CommonValidator = require('../../common/validate/validator');
const ResponseSendInterceptor = require('../../interceptors/res-send');
const RejectData = require('../../common/response/reject-data');
const ApplicationHelper = require('../routes/helpers/application');

//TODO: Application user should not be able to create/update/delete settings. Only read
/**
 * Verify application token
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function authenticateApplication(req, res, next) {
    try {
        req.trace.caller = {};
        req.trace.authenticated = false;
        // Initialize
        let token, error, result, decoded;
        var rejectObject;

        // Check if it is part of Authorization Bearer header and extract it
        if (req.headers.authorization) {
            var bearerArr = req.headers.authorization.split(' ');
            if (bearerArr && Array.isArray(bearerArr) && bearerArr.length == 2
                && (bearerArr[0] == 'bearer' || bearerArr[0] == 'Bearer')) {
                token = bearerArr[1];
            }
        }
        if (token) {
            let validUserAudience = [Constants.BOOTSTRAP.APP_JWT.AUDIENCE.APPLICATION];
            //Is token valid?
            [error, decoded] = await To(CommonJWTHelper.verifyJWT(token, validUserAudience));
            if (!CommonValidator.isSuccessResponseAndNonEmptyData(decoded)) {
                //invalid token
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
                //Check if user(jti) is really existing?
                error = null;
                [error, result] = await To(ApplicationHelper.getOneById(decoded.data.jti));
                if (!CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                    //app is not in existence
                    rejectObject = new RejectData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                        CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN,
                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                        error);
                    rejectObject.appendMessage(error.message);
                    req.trace.response = rejectObject.jsonObject();
                    ResponseSendInterceptor.sendResponse(req, res, next);
                } else {
                    //app is existing and authentication is done
                    //console.log('app is in existence');
                    //console.log('authentication is done');
                    req.trace.caller = result.data;
                    req.trace.authenticated = true;
                    next();
                }
            }
        } else {
            //Token is not provided
            //console.log('token is not available');
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_NOT_PROVIDED,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejectObject.jsonObject();
            ResponseSendInterceptor.sendResponse(req, res, next);
        }
    } catch (e) {
        //console.log('unknown error leading to exception');
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
