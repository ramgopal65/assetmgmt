module.exports = {
    loginApplicationAndFetchRelevantSettings: loginApplicationAndFetchRelevantSettings
};
const To = require('../../../common/to/to');
const Axios = require('axios');
const ResolveData = require('../../response/resolve-data');
const RejectData = require('../../response/reject-data');
const Constants = require('./constant');
const ApplicationtWrapper = require('./application-login');
const SettingsMap = require('./settings-map');
const Config = require('./config');
const CommonConstants = require('../../constant/constant');
const SettingsKeysCommon = require('../../setting/keys');

function handleError(e, message) {
    var rejectObject = new RejectData(
        e.code,
        message + ' - ' + e.message,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        e);
    return rejectObject.jsonObject();
}

/**
 * Login and populate settings for given app
 */
async function loginApplicationAndFetchRelevantSettings(applicationCode) {

    // Initialize
    let error, result, countError, countResult, fetchError, fetchResult, countUrl, url, requestHeaders;
    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.HTTP_BOOTSTRAP.GET_ALL_SETTINGS.SUCCESS + applicationCode,
        null
    );
    [error, result] = await To(ApplicationtWrapper.applicationLogin(applicationCode));
    if (error) {
        return Promise.reject(error);
    }
    if (result && result.data.token) {
        let token = result.data.token;
        // Construct data
        ////////////////////////////////////////////
        countUrl = Config.BOOTSTRAP_BASE_URL + Config.POST_SETTINGS_SEARCH_COUNT;
        url = Config.BOOTSTRAP_BASE_URL + Config.POST_SETTINGS_SEARCH;
        requestHeaders = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
        let searchCondition = { applicationCode: ['common', applicationCode] };
        let searchData = { condition: searchCondition };
        [countError, countResult] = await To(Axios.post(countUrl, searchData, { headers: requestHeaders }));
        if (countError) {
            return Promise.reject(handleError(countError, Constants.HTTP_BOOTSTRAP.POST_SETTINGS_SEARCH_COUNT.ERROR + applicationCode));
        }
        let allSettings = [];
        if (countResult) {
            let limit = 5; //CommonConstants.COMMON.APP_DB.FETCH_ALL.LIMIT.DEFAULT;
            let skip = 0;
            let count = parseInt(countResult.data.data.count);
            let got = 0;

            for (; got < count; got += limit, skip += limit) {

                let sortJson = { categoryCode: 1 };
                let selectStr = 'applicationCode categoryCode property value valueType';
                searchData = {
                    skip: skip,
                    limit: limit,
                    sort: sortJson,
                    select: selectStr,
                    condition: searchCondition
                };

                [fetchError, fetchResult] = await To(Axios.post(url, searchData, { headers: requestHeaders }));
                if (fetchError) {
                    return Promise.reject(fetchError);
                }
                allSettings = allSettings.concat(fetchResult.data.data);
            }
        }
        //console.log(allSettings.length);


        ////////////////////////////////////////
        
/*        countUrl = Config.BOOTSTRAP_BASE_URL + Config.GET_ALL_SETTINGS_COUNT;
        url = Config.BOOTSTRAP_BASE_URL + Config.GET_ALL_SETTINGS;
        requestHeaders = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
        [countError, countResult] = await To(HttpRestHelper.get(countUrl, requestHeaders, null, null));
        if (countError) {
            return Promise.reject(handleError(error, Constants.HTTP_BOOTSTRAP.GET_ALL_SETTINGS_COUNT.ERROR + applicationCode));
        }

        let allSettings = [];
        if (countResult) {
            let limit = 5;// CommonConstants.COMMON.APP_DB.FETCH_ALL.LIMIT.DEFAULT;
            let skip = 0;
            let count = parseInt(countResult.data.count);
            let got = 0;

            for (; got < count; got += limit, skip += limit) {
                let query = { skip: skip, limit: limit };
                let queryString = '?' + QueryStringHelper.stringify(query);
                let sortJson = {categoryCode:1};
                let strSortJson = JSON.stringify(sortJson);
                let encodedStrSortJson = encodeURIComponent(strSortJson);
                let selectJson = ['applicationCode','categoryCode','property','value'];
                let strSelectJson = JSON.stringify(selectJson);
                let encodedStrSelectJson = encodeURIComponent(strSelectJson);
                let paramString = encodedStrSortJson + '&' + encodedStrSelectJson;

                [fetchError, fetchResult] = await To(HttpRestHelper.get(url + paramString + queryString, requestHeaders, null , null));
                if (fetchError) {
                    return Promise.reject(fetchError);
                }
                allSettings = allSettings.concat(fetchResult.data);
            }
        }

*/        ////////////////////////////////////////


        if (fetchResult) {
            // Clear
            SettingsMap.clear();
            // Populate
            allSettings.forEach(s => {
                if (s.applicationCode && s.categoryCode && s.property && s.value) {
                    // Convert value to proper type
                    let value = s.value;
                    if (s.valueType == CommonConstants.COMMON.APP_OBJECT.SETTINGS.VALUE_TYPE.STRING) {
                        //value = s.value;
                    } else if (s.valueType == CommonConstants.COMMON.APP_OBJECT.SETTINGS.VALUE_TYPE.BOOLEAN) {
                        value = (value == 'true');
                    } else if (s.valueType == CommonConstants.COMMON.APP_OBJECT.SETTINGS.VALUE_TYPE.INTEGER) {
                        value = parseInt(value);
                    } else if (s.valueType == CommonConstants.COMMON.APP_OBJECT.SETTINGS.VALUE_TYPE.FLOAT) {
                        value = parseFloat(value);
                    } else if (s.valueType == CommonConstants.COMMON.APP_OBJECT.SETTINGS.VALUE_TYPE.LIST) {
                        // TODO value = parseFloat(value);
                    } else if (s.valueType == CommonConstants.COMMON.APP_OBJECT.SETTINGS.VALUE_TYPE.JSON) {
                        value = JSON.parse(value);
                    }

                    //console.log(s.applicationCode + '.' + s.categoryCode + '.' + s.property + ' = ' + value + ' = ' + s.valueType);
                    SettingsMap.set(
                        s.applicationCode + '.' + s.categoryCode + '.' + s.property,
                        value
                    );
                }
            });
            const CipherEnvUtil = require('../../../common/cipher/cipher-env');

            const ENV = process.env;
            let JWT_SECRET = ENV.ASSETMGMT_JWT_SECRET;
            let PUBLIC_KEY = ENV.ASSETMGMT_PUB_KEY;
            if (PUBLIC_KEY) {
                JWT_SECRET = CipherEnvUtil.decryptEnvParams(JWT_SECRET, PUBLIC_KEY);
            }

            SettingsMap.set(SettingsKeysCommon.COMMON.JWT.SECRET, JWT_SECRET);

            resolveObject.setData(SettingsMap);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } else {
        var rejectObject = new RejectData(result.code, Constants.HTTP_BOOTSTRAP.GET_ALL_SETTINGS.ERROR, CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN, result.data);
        return Promise.reject(rejectObject.jsonObject());
    }
}