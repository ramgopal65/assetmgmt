module.exports = {
    addToBlacklist: addToBlacklist,
    checkIfBlacklisted: checkIfBlacklisted,
};

const CommonJWTHelper = require('../../../common/jwt/helpers/jwt');
const To = require('../../../common/to/to');
const CommonValidator = require('../../../common/validate/validator');
const RejectData = require('../../../common/response/reject-data');
const ResolveData = require('../../../common/response/resolve-data');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const UserTokenBlacklistService = require('../services/usertokenblacklist');

/**
 * Create one
 * @param {*} authUser 
 * @param {*} token 
 * @param {*} flags 
 */
async function addToBlacklist(callerId, token, flags) {
    try {
        // Initialize
        let error, decoded, result;
        let ttl = null;
        let oTBl = {};

        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER_TOKEN_BLACKLIST.ADD.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            null);

        // Retrieve ttl from JWT token
        let validUserAudience = CommonConstants.COMMON.APP_JWT.AUDIENCE.USERS;
        // console.log('From blacklist - ' + token);
        [error, decoded] = await To(CommonJWTHelper.verifyJWT(token, validUserAudience));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(decoded)) {
            if (callerId == decoded.data.jti) {
                ttl = decoded.data.exp - Date.now();
                if (ttl < 0) {
                    //If expired, there is no need to add to blacklist
                    //Expired tokens are expected to fail the ttl check and become invalid, not thru blacklist
                    //Send success
                    var resolveObject = new ResolveData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                        CommonConstants.COMMON.APP_ERROR.SUCCESS,
                        null);
                    resolveObject.appendMessage(Constants.ASSETMGMT.USER_TOKEN_BLACKLIST.ADD.ERROR_EXPIRED);
                    return Promise.resolve(resolveObject.jsonObject());
                } else {
                    oTBl.token = token;
                    oTBl.expiry = new Date(decoded.data.exp);
                    error = null;
                    [error, result] = await To(UserTokenBlacklistService.createOne(oTBl));
                    if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                        return Promise.resolve(result);
                    } else {
                        return Promise.reject(error);
                    }
                }
            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                rejectObject.setDetails(null);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(error.message);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            rejectObject.setDetails(error);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        rejectObject.appendMessage(e.message);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}


/**
* check if given token is in blacklist
 * @param {*} authUser 
* @param {*} token string
* @param {*} flags json
*/
async function checkIfBlacklisted(authUser, token, flags) {
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.USER_TOKEN_BLACKLIST.ADD.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null);
    try {
        // Initialize
        let error, result;

        // Create
        [error, result] = await To(UserTokenBlacklistService.getOneByToken(token));
        if (error) {
            return Promise.reject(error);
        }
        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        rejectObject.appendMessage(e.message);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}
