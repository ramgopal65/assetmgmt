module.exports = {
    encryptEnvParams: encryptEnvParams,
    decryptEnvParams: decryptEnvParams
};

// Imports
const Crypto = require('crypto');
const PubKey = 'EnCrYpTmYStRiNg';

/**
 * Encrypt Env params
 * @param {*} data 
 * @param {*} pubKey 
 */
function encryptEnvParams(data, pubKey = PubKey) {
    try {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }

        let cipher = Crypto.createCipheriv('aes-256-ecb', pubKey, null);
        let ciphered = cipher.update(data, 'utf8', 'hex');
        ciphered += cipher.final('hex');

        return ciphered;

    } catch (e) {
        return e;
    }
}

/**
 * Decrypt Env params
 * @param {*} data 
 * @param {*} pubKey 
 */
function decryptEnvParams(data, pubKey = PubKey) {
    try {
        let decipher = Crypto.createDecipheriv('aes-256-ecb', pubKey, null);
        let deciphered = decipher.update(data, 'hex', 'utf8');
        deciphered += decipher.final('utf8');

        return deciphered;
    } catch (e) {
        return e;
    }
}

