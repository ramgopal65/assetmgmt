// Imports
const CommonConstants = require('../../common/constant/constant');
require('dotenv').config();
const SettingsKey = require('../setting/keys');

//VARIABLES FROM ENV FILE
const ENV = process.env;
let JWT_SECRET = ENV.ASSETMGMT_JWT_SECRET;
let PORT = ENV.ASSETMGMT_NOTIFICATION_PORT;
let DEPLOYMENT_ENV = ENV.ASSETMGMT_DEPLOYMENT_ENV;
console.log('deploying in - ' + DEPLOYMENT_ENV);

//NOTIFICATION CONFIGURATION
const NOTIFICATION = {
    APPLICATION: {
        CODE: CommonConstants.COMMON.APP_MICRO_SERVICES.NOTIFICATION.CODE,
        NAME: CommonConstants.COMMON.APP_MICRO_SERVICES.NOTIFICATION.NAME
    },
    DEPLOYMENT: {
        ENVIRONMENT: DEPLOYMENT_ENV
    },
    DEFAULT_PORT: PORT,
    JWT: {
        SECRET: JWT_SECRET
    },
    AWS: {
        SUBJECT: SettingsKey.NOTIFICATION.AWS.SNS.TOPIC,
        API_VERSION: SettingsKey.NOTIFICATION.AWS.SNS.API_VERSION
    }
};

module.exports = { NOTIFICATION };
