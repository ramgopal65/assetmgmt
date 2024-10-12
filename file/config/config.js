// Imports
const CommonConstants = require('../../common/constant/constant');
require('dotenv').config();

//VARIABLES FROM ENV FILE
let ENV = process.env;
let PORT = ENV.ASSETMGMT_FILE_PORT;
let DEPLOYMENT_ENV = ENV.ASSETMGMT_DEPLOYMENT_ENV;
console.log('deploying in - ' + DEPLOYMENT_ENV);

//FILES CONFIGURATION
let FILE = {
    APPLICATION: {
        CODE: CommonConstants.COMMON.APP_MICRO_SERVICES.FILE.CODE,
        NAME: CommonConstants.COMMON.APP_MICRO_SERVICES.FILE.NAME
    },
    DEPLOYMENT: {
        ENVIRONMENT: DEPLOYMENT_ENV
    },
    DEFAULT_PORT: PORT
};

module.exports = { FILE };