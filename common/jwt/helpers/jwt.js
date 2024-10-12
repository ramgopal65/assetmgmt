'use strict';

module.exports = {
    generateJWT: generateJWT,
    verifyJWT: verifyJWT
};

const JWT = require('jsonwebtoken');
const Constants = require('./constant');
const RejectData = require('../../response/reject-data');
const ResolveData = require('../../response/resolve-data');
const To = require('../../../common/to/to');
const CommonConstants = require('../../../common/constant/constant');

const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');
const SettingsKeysCommon = require('../../../common/setting/keys');


async function verifyJWT(token, audList) {
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
        Constants.JWT.VERIFY.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null);

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.JWT.VERIFY.SUCCESS,
        null);
    //console.log('VERIFY >>> token - ' + token +
    //    '; iss - ' + SettingsMap.get(SettingsKeysCommon.COMMON.JWT.ISSUER) +
    //    '; aud - ' + audList);
    let result, error;
    try {
        //Verify the authenticity of the token
        error = result = null;
        [error, result] = await To(new Promise((resolve, reject) => {

            JWT.verify(token,
                SettingsMap.get(SettingsKeysCommon.COMMON.JWT.SECRET),
                {
                    issuer: SettingsMap.get(SettingsKeysCommon.COMMON.JWT.ISSUER),
                    audience: audList
                },
                (error, decoded) => {
                    try {
                        if (error) {
                            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                            rejectObject.setDetails(error);
                            reject(rejectObject.jsonObject());
                        } else if (decoded) {
                            resolve(decoded);
                        }
                    } catch (err) {
                        rejectObject.setDetails(err);
                        reject(rejectObject.jsonObject());
                    }
                }
            );
        }));
        if (result) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            rejectObject.setDetails(error);
            return Promise.reject(rejectObject.jsonObject());
        }

    } catch (e) {
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
        rejectObject.appendMessage(e.message);
        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
 * Generate token
 * @param {*} entity 
 * @param {*} params 
 * @param {*} flags 
 */
async function generateJWT(jti, audience, subject, expiry) {

    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.UNKNOWN.CODE,
        Constants.JWT.GENERATE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null);

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.JWT.GENERATE.SUCCESS,
        null);

    try {
        // Expiry
        let exp = Date.now() + expiry;

        //console.log('CREATE >>> iss - ' + SettingsMap.get(SettingsKeysCommon.COMMON.JWT.ISSUER) +
        //    '; jti - ' + jti +
        //    '; aud - ' + audience +
        //    '; sub - ' + subject +
        //    '; exp - ' + expiry);
        // Generate a token
        let token = await JWT.sign(
            {
                iss: SettingsMap.get(SettingsKeysCommon.COMMON.JWT.ISSUER),
                jti: jti,
                aud: audience,
                sub: subject,
                iat: Date.now(),
                exp: exp
            },
            SettingsMap.get(SettingsKeysCommon.COMMON.JWT.SECRET)
        );

        // Response
        resolveObject.setData({ token: token, expiry: exp });
        return Promise.resolve(resolveObject.jsonObject());
    } catch (error) {
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
        rejectObject.appendMessage(error.message);
        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
        rejectObject.setDetails(error);
        return Promise.reject(rejectObject.jsonObject());
    }
}