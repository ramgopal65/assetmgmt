module.exports = {
    password: password,
    hashedPassword: hashedPassword,
    string: string,
    numeric: numeric,
    alphabet: alphabet,
    getRandomIntWithinMax: getRandomIntWithinMax,
    getRandomStringOfOneChar: getRandomStringOfOneChar,
    getRandomHexString: getRandomHexString
};

// Imports
const Bcrypt = require('bcrypt');
const Crypto = require('crypto');
const SettingsMap = require('../wrappers/bootstrap/settings-map');
const SettingsKeysCommon = require('../setting/keys');

const ModuleError = require('../error/module');  //TODO - get rid of this
const CommonValidator = require('../validate/validator');

/**
 * Generates a random password
 */
function password() {
    return string(10);
}

/**
 * Generates a random hashed password
 */
function hashedPassword() {
    let password = string(10);

    return {
        password: password,
        hashed: Bcrypt.hashSync(password, Bcrypt.genSaltSync(10))
    };
}

/**
 * Generates a random string
 * @param {*} size 
 */
function string(size) {
    try {
        if (!CommonValidator.isNumericAndPositive(size)) {
            size = SettingsMap.get(SettingsKeysCommon.COMMON.OTP.LENGTH);
        }

        return Crypto.randomBytes(size).toString('hex').slice(0, size);
    } catch (error) {
        //TODO standardize this
        throw new ModuleError('An error occured while generating random alphanumerics', 409, null);
    }
}

//TODO: Fix the bugs
/**
 * Generates a random number
 * @param {*} size 
 */
function numeric(size) {
    try {
        if (!CommonValidator.isNumericAndPositive(size)) {
            size = SettingsMap.get(SettingsKeysCommon.COMMON.OTP.LENGTH);
        }
        return ('0'.repeat(size) + Math.floor(Math.random() * 10 ** size)).slice(-size);
        //return parseInt(Crypto.randomBytes(size).readUInt32BE().toString().slice(0, size));
    } catch (error) {
        throw new ModuleError('An error occured while generating random numerics', 409, null);
    }
}

//TODO: purpose of this function is not clear
/**
 * Generates a random string using alphabets
 */
function alphabet(size) {
    try {
        if (!CommonValidator.isNumericAndPositive(size)) {
            size = SettingsMap.get(SettingsKeysCommon.COMMON.OTP.LENGTH);
        }

        return Crypto.randomBytes(size).toString('hex').slice(0, size);
    } catch (error) {
        throw new ModuleError('An error occured while generating random alphabets', 409, null);
    }
}

//TODO: rename this function
/**
 * Generates a random integer less than a maximum
 * @param {*} max 
 */
function getRandomIntWithinMax(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

//TODO: rename this function
/**
 * replace the string with a special char
 * @param {*} str 
 * @param {*} char 
 */
function getRandomStringOfOneChar(str, char = '#') {
    let newStr = '';
    newStr += new Array(str.length + 1).join(char);

    return newStr;
}


/**
* @param {*} size 
*/
function getRandomHexString(size) {
    return Crypto.randomBytes(size).toString('hex');;
}
