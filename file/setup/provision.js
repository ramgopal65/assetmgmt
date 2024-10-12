module.exports = {
    provision: provision,
};

const Constants = require('../constant/constant');

const RejectData = require('../../common/response/reject-data');
const ResolveData = require('../../common/response/resolve-data');
const CommonConstants = require('../../common/constant/constant');
const To = require('../../common/to/to');
const SettingsMap = require('../../common/wrappers/bootstrap/settings-map');
const CommonValidator = require('../../common/validate/validator');

const SettingsKey = require('../setting/keys');
const path = require('path');

/**
 * provision missing data
 */
async function provision() {
    //TODO100
    //1- get default profile pic file path and name from setting
    //2- check if this file is in s3; if not create


    let resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK,
        Constants.FILE.GENERIC.SUCCESS,
        null
    );
    return Promise.resolve(resolveObject.jsonObject());

}