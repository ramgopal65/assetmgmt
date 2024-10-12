module.exports = {
    applicationLogin: applicationLogin
};

// Imports
const To = require('../../../common/to/to');
const Axios = require('axios');
const RejectData = require('../../response/reject-data');
const Constants = require('./constant');
const CommonConstants = require('../../constant/constant');
const Config = require('./config'); 


function handleError(e, message) {
    var rejectObject = new RejectData(
        e.code,
        message + ' - ' + e.message,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        e);
    return rejectObject.jsonObject();
}

/**
 * Application login
 */
async function applicationLogin(applicationCode) {
    try {
        // Initialize
        let error, result, url, requestHeaders, requestBody;

        // Construct data
        url = Config.BOOTSTRAP_BASE_URL + Config.APPLICATION_LOGIN;
        requestHeaders = { 'Content-Type': 'application/json' };
        requestBody = { code: applicationCode };

        // login
        [error, result] = await To(Axios.post(url, requestBody, { headers: requestHeaders }));
        if (error) {
            return Promise.reject(handleError(error, Constants.HTTP_BOOTSTRAP.APPLICATION_LOGIN.ERROR + applicationCode));
        }
        if (result &&
            result.data &&
            (result.data.code == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE) &&
            result.data.data.token) {
            return Promise.resolve(result.data);
        } else {
            //This should never happen
            var rejectObject = new RejectData(result.data.code, Constants.HTTP_BOOTSTRAP.APPLICATION_LOGIN.TOKEN_UNAVAILABLE, CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN, result.data);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleError(e, Constants.HTTP_BOOTSTRAP.APPLICATION_LOGIN.ERROR + applicationCode));
    }
}