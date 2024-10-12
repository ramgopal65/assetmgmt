module.exports = {
    generateHash: generateHash,
    comparePasswords: comparePasswords,
    convertStringToBoolean: convertStringToBoolean,
    generateTemporaryToken: generateTemporaryToken,
};

// Imports
const Bcrypt = require('bcrypt');
const Moment = require('moment');
const JWT = require('jsonwebtoken');
const ModuleError = require('../error/module');

const SettingsMap = require('../wrappers/bootstrap/settings-map');
const SettingsKeysCommon = require('../setting/keys');

const Constants = require('../constant/constant');
const CommonValidator = require('../validate/validator');


/**
 * Generate hash
 * @param {*} str 
 */
function generateHash(str) {
    let hash = Bcrypt.hashSync(str, Bcrypt.genSaltSync(10));
    return hash;
}

/**
 * Compare passwords
 * @param {String} p1 
 * @param {String} p2 
 */
function comparePasswords(p1, p2) {
    let ret = Bcrypt.compareSync(p1, p2);
    return ret;
}

/**
 * Convert string to boolean
 * @param {Boolean} value 
 */
function convertStringToBoolean(value) {
    if (CommonValidator.isString(value)) {
        if (value == Constants.STRING.TRUE) {
            return true;
        } else if (value == Constants.STRING.FALSE) {
            return false;
        } else {
            throw new ModuleError(value + ' cannot be converted to Boolean.', 409, null);
        }
    } else {
        return value;
    }
}

/**
 * Generate temporary token
 * @param {*} entity 
 * @param {*} params 
 * @param {*} flags 
 */
async function generateTemporaryToken(entity, params, flags) {
    try {
        // Expiry
        let expiry = new Date();
        expiry = expiry.getTime() + SettingsMap.get(SettingsKeysCommon.COMMON.JWT.EXPIRY.TEMPORARY_TOKEN.MILLISECONDS);

        // Generate a token
        let token = await JWT.sign(
            {
                iss: SettingsMap.get(SettingsKeysCommon.COMMON.JWT.ISSUER),
                iat: Math.ceil(Date.now() / 1000),
                jti: entity._id,
                aud: entity.audience,
                exp: Math.ceil(expiry / 1000),
                sub: 'Temporary Access Token'
            },
            SettingsMap.get(SettingsKeysCommon.COMMON.JWT.SECRET)
        );

        // Response
        return Promise.resolve({ code: 200, message: 'Temporary token generated successfully.', data: { token: token, expiry: expiry } });
    } catch (error) {
        if (error && error.code && error.message) {
            return Promise.reject({ code: error.code, message: error.message, data: error.data });
        } else {
            return Promise.reject({ code: 409, message: 'Error while generating temporary token: ' + error });
        }
    }
}

