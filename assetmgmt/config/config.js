const CipherEnvUtil = require('../../common/cipher/cipher-env');
const CommonConstants = require('../../common/constant/constant');
require('dotenv').config();

const ENV = process.env;
let PUBLIC_KEY = ENV.ASSETMGMT_PUB_KEY;
let DB_URL = ENV.ASSETMGMT_BOOTSTRAP_DB_URL;
let PORT = ENV.ASSETMGMT_ASSETMGMT_PORT;
let DEPLOYMENT_ENV = ENV.ASSETMGMT_DEPLOYMENT_ENV;
let TESTIMONIAL_PORT = ENV.ASSETMGMT_TESTIMONIAL_PORT;
let TESTIMONIAL_URL = ENV.ASSETMGMT_TESTIMONIAL_URL;

//let encrypted = CipherEnvUtil.encryptEnvParams('jwtsecert', PUBLIC_KEY);
//let decrypted = CipherEnvUtil.decryptEnvParams(encrypted, PUBLIC_KEY);

if (PUBLIC_KEY) {
    DB_URL = CipherEnvUtil.decryptEnvParams(DB_URL, PUBLIC_KEY);
}

console.log('deploying in - ' + DEPLOYMENT_ENV);
module.exports = {
    APPLICATION: {
        CODE: CommonConstants.COMMON.APP_MICRO_SERVICES.ASSETMGMT.CODE,
        NAME: CommonConstants.COMMON.APP_MICRO_SERVICES.ASSETMGMT.NAME
    },
    DEPLOYMENT: {
        ENVIRONMENT: DEPLOYMENT_ENV
    },
    DEFAULT_PORT: PORT,
    TESTIMONIAL_PORT: TESTIMONIAL_PORT,
    TESTIMONIAL_URL: TESTIMONIAL_URL,
    DB: {
        URL: DB_URL + DEPLOYMENT_ENV,
        USE_NEW_URL_PARSER: false
    },
    SUPERADMIN: {
        NAME: ENV.ASSETMGMT_SA_NAME,
        EMAIL: ENV.ASSETMGMT_SA_EMAIL,
        PASSWORD: ENV.ASSETMGMT_SA_PWD
    },
    REVIEWER: {
        NAME: ENV.ASSETMGMT_REVIEWER_NAME,
        EMAIL: ENV.ASSETMGMT_REVIEWER_EMAIL,
        PASSWORD: ENV.ASSETMGMT_REVIEWER_PWD
    },
    NOTIFICATION: {
        URL: ENV.ASSETMGMT_NOTIFICATION_URL + ':' + ENV.ASSETMGMT_NOTIFICATION_PORT,
        SEND_SMS: '/notification/sms',
        SEND_SMS_LOCAL: '/notification/sms-gateway-local',
        SEND_EMAIL: '/notification/email'
    },
    FILE: {
        URL: ENV.ASSETMGMT_FILE_URL + ':' + ENV.ASSETMGMT_FILE_PORT,
        STREAM: '/file',
    }
};
