const CipherEnvUtil = require('../../common/cipher/cipher-env');
const CommonConstants = require('../../common/constant/constant');
require('dotenv').config();

//TODO: move to vaults in cloud from ENV for authentication keys
const ENV = process.env;
let PUBLIC_KEY = ENV.ASSETMGMT_PUB_KEY;
let DB_URL = ENV.ASSETMGMT_BOOTSTRAP_DB_URL;
let JWT_SECRET = ENV.ASSETMGMT_JWT_SECRET;
let PORT = ENV.ASSETMGMT_BOOTSTRAP_PORT;
let DEPLOYMENT_ENV = ENV.ASSETMGMT_DEPLOYMENT_ENV;

//let encrypted = CipherEnvUtil.encryptEnvParams('jwtsecert', PUBLIC_KEY);
//let decrypted = CipherEnvUtil.decryptEnvParams(encrypted, PUBLIC_KEY);

if (PUBLIC_KEY) {
    DB_URL = CipherEnvUtil.decryptEnvParams(DB_URL, PUBLIC_KEY);
    JWT_SECRET = CipherEnvUtil.decryptEnvParams(JWT_SECRET, PUBLIC_KEY);
}

console.log('deploying in - ' + DEPLOYMENT_ENV);
module.exports = {
    APPLICATION: {
        CODE: CommonConstants.COMMON.APP_MICRO_SERVICES.BOOTSTRAP.CODE,
        NAME: CommonConstants.COMMON.APP_MICRO_SERVICES.BOOTSTRAP.NAME
    },
    DEPLOYMENT: {
        ENVIRONMENT: DEPLOYMENT_ENV
    },
    DEFAULT_PORT: PORT,
    DB: {
        URL: DB_URL + DEPLOYMENT_ENV,
        USE_NEW_URL_PARSER: false
    },
    PROVISION: {
        APPLICATIONS: 'missing',
        SETTINGS: 'missing'
    },
    JWT: {
        SECRET: JWT_SECRET
    }
};
