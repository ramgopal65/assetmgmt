module.exports = {
    provision: provision,
    provisionMissingApplications: provisionMissingApplications,
    provisionMissingSettings: provisionMissingSettings,
};

// Imports
const To = require('../../common/to/to');
const CommonValidator = require('../../common/validate/validator');
const Config = require('../config/config');
const SettingHelper = require('../routes/helpers/setting');
const ApplicationHelper = require('../routes/helpers/application');
const DefaultSettingJson = require('../data/default-settings-' + Config.DEPLOYMENT.ENVIRONMENT.toLowerCase());
const CommonConstants = require('../../common/constant/constant');
const RejectData = require('../../common/response/reject-data');
const ResolveData = require('../../common/response/resolve-data');
const Constants = require('../constant/constant');
const DefaultApplicationJson = require('../data/default-application');
const SettingsMap = require('../../common/wrappers/bootstrap/settings-map');
const SettingsKeysCommon = require('../../common/setting/keys');

let bootstrapUser = null;
let bootstrapApplication = {
    name: CommonConstants.COMMON.APP_MICRO_SERVICES.BOOTSTRAP.NAME,
    code: CommonConstants.COMMON.APP_MICRO_SERVICES.BOOTSTRAP.CODE,
    description: CommonConstants.COMMON.APP_MICRO_SERVICES.BOOTSTRAP.DESCRIPTION
};


/**
 * Fetch settings
 */
async function fetchSettings() {
    try {
        // Initialize
        let countError, countResult, fetchError, fetchResult;

        // Check if all environment variables are set
        if (!Config.JWT.SECRET) {
            throw new Error('ASSETMGMT_JWT_SECRET environment variable is not set. Please set it and restart this service to continue', 417, null);
        }

        // Get all settings
        // Get the list of all existing settings
        let limit = CommonConstants.COMMON.APP_DB.FETCH_ALL.LIMIT.DEFAULT;
        let skip = 0;
        [countError, countResult] = await To(SettingHelper.getAllCount());
        if (countError) {
            return Promise.reject(countError);
        }
        let count = parseInt(countResult.data.count);
        let got = 0;

        let allSettings = [];
        for (; got < count; got += limit, skip += limit) {
            let params = { sort: { _id: 1 }, select: 'applicationCode categoryCode property value valueType'};
            let query = { skip: skip, limit: limit };
            [fetchError, fetchResult] = await To(SettingHelper.getAll(params, query));
            if (fetchError) {
                return Promise.reject(fetchError);
            }
            allSettings = allSettings.concat(fetchResult.data);
            fetchResult = null;
        }

        // Populate Cache
        if (allSettings) {
            // Clear
            SettingsMap.clear();

            // Populate
            allSettings.forEach(s => {
                if (s.applicationCode && s.categoryCode && s.property && (s.value || (s.value == null) || (s.value == '')) ) {
                    // Convert value to proper type
                    let value;
                    if (s.valueType == CommonConstants.COMMON.SUPPORTED_DATA_TYPE.STRING) {
                        value = s.value;
                    } else if (s.valueType == CommonConstants.COMMON.SUPPORTED_DATA_TYPE.BOOLEAN) {
                        value = (s.value == 'true');
                    } else if (s.valueType == CommonConstants.COMMON.SUPPORTED_DATA_TYPE.INTEGER) {
                        value = parseInt(s.value);
                    } else if (s.valueType == CommonConstants.COMMON.SUPPORTED_DATA_TYPE.FLOAT) {
                        value = parseFloat(s.value);
                    } else if (s.valueType == CommonConstants.COMMON.SUPPORTED_DATA_TYPE.JSON) {
                        value = JSON.parse(s.value);
                    } else {
                        console.log('strange');
                    }

                    //console.log(s.applicationCode + ' - ' + s.categoryCode + ' - ' + s.property + ' - ' + value + ' - ' + s.valueType + ' - ' + typeof (value));
                    let r = SettingsMap.set(
                        s.applicationCode + '.' + s.categoryCode + '.' + s.property,
                        value
                    );
                    //console.log(r);
                } else {
                    console.log('Not populating this - ' + s.applicationCode + '; ' + s.categoryCode + '; ' + s.property);
                }
            });

            // Set settings from environment
            SettingsMap.set(SettingsKeysCommon.COMMON.JWT.SECRET, Config.JWT.SECRET);
            //console.log([...SettingsMap.entries()]);


            console.log('adding one local settings');
            console.log('settings populated successfully with ' + SettingsMap.size() + ' settings');
            return Promise.resolve({ code: 200, message: 'Settings populated successfully', data: SettingsMap });
        } else {
            return Promise.reject({ code: 409, message: 'Unable to populate settings' });
        }
    } catch (error) {
        if (error && error.code && error.message) {
            return Promise.reject(error);
        } else {
            return Promise.reject({ code: 409, message: 'Error while fetching settings: ' + error });
        }
    }
}

/**
 * provision missing data
 */
async function provision() {

    let error, result;
    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.EXPECTATION_FAILED.CODE,
        '',
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null);

    let resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK,
        Constants.BOOTSTRAP.GENERIC.PROVISION_SUCCESS,
        null
    );

    try {
        // Check if all environment variables are set
        if (!Config.JWT.SECRET) {
            rejectObject.setMessage(Constants.BOOTSTRAP.GENERIC.ERROR_ENV_JWT_SECRET_NOT_SET);
            return Promise.reject(rejectObject.jsonObject());
        }

        error = result = null;
        // Check if we should provision missing applications
        [error, result] = await To(provisionBootstrapApplication());
        if (error) {
            return Promise.reject(error);
        }
        if (result) {
            //Nothing
        }

        error = result = null;
        // Check if we should provision missing applications
        if (Config.PROVISION.APPLICATIONS == 'missing') {
            [error, result] = await To(provisionMissingApplications());
            if (error) {
                return Promise.reject(error);
            }
            if (result) {
                //Nothing
            }
        }

        error = result = null;
        // Check if we should provision all settings
        if (Config.PROVISION.SETTINGS == 'missing') {
            [error, result] = await To(provisionMissingSettings());
            if (error) {
                return Promise.reject(error);
            }
            if (result) {
                //Nothing
            }
        }

        error = result = null;
        // Populate Settings
        [error, result] = await To(fetchSettings());
        if (error) {
            return Promise.reject(error);
        }
        if (result) {
            console.log(Constants.BOOTSTRAP.SETTINGS_FETCH_SUCCESS);
        }
        return Promise.resolve(resolveObject);


    } catch (e) {
        rejectObject.setMessage(Constants.BOOTSTRAP.GENERIC.ERROR + ' - ' + Constants.BOOTSTRAP.GENERIC.ERROR);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
 * Provision bootstrap application
 */
async function provisionBootstrapApplication() {
    // Initialize
    let error, result;
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        '',
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        '',
        null
    );
    try {

        //check if bootstrap application is existing
        [error, result] = await To(ApplicationHelper.getOneByCode(Config.APPLICATION.CODE));
        if (CommonValidator.isSuccessResponse(result)) {
            //Already provisioned. Nothing to do
            console.log(Constants.BOOTSTRAP.PROVISION.APPLICATIONS.BOOTSTRAP.NOTHING_TO_PROVISION);
            resolveObject.appendMessage(Constants.BOOTSTRAP.PROVISION.APPLICATIONS.BOOTSTRAP.NOTHING_TO_PROVISION);
            bootstrapUser = result.data;
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            error = result = null;
            //provision bootstrap application
            [error, result] = await To(ApplicationHelper.createBootstrapApp(bootstrapApplication));
            if (CommonValidator.isSuccessResponse(result)) {
                console.log(Constants.BOOTSTRAP.PROVISION.APPLICATIONS.BOOTSTRAP.SUCCESS);
                resolveObject.appendMessage(Constants.BOOTSTRAP.PROVISION.APPLICATIONS.BOOTSTRAP.SUCCESS);
                bootstrapUser = result.data;
                return Promise.resolve(resolveObject.jsonObject());
            } else {
                rejectObject.setMessage(Constants.BOOTSTRAP.PROVISION.APPLICATIONS.BOOTSTRAP.ERROR);
                rejectObject.appendMessage(error.message);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                rejectObject.setDetails(error);
                return Promise.reject(rejectObject.jsonObject());
            }
        }
    } catch (e) {
        rejectObject.setMessage(Constants.BOOTSTRAP.PROVISION.APPLICATIONS.BOOTSTRAP.ERROR);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
 * Provision missing applications
 */
async function provisionMissingApplications() {
    // Initialize
    let error, allResult, result;
    let missingApplications = [];
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        '',
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        '',
        null
    );
    try {
        let params = { sort: {}, select: {} };
        let limit = CommonConstants.COMMON.APP_DB.FETCH_ALL.LIMIT.DEFAULT;
        let skip = CommonConstants.COMMON.APP_DB.FETCH_ALL.SKIP.DEFAULT;
        let query = { skip: skip, limit: limit };

        // Get the list of all existing applications
        [error, allResult] = await To(ApplicationHelper.getAll(params, query));
        if (error) {
            let temp = error.message;
            error.message = Constants.BOOTSTRAP.PROVISION.APPLICATIONS.MISSING.ERROR
                + Constants.BOOTSTRAP.PROVISION.APPLICATIONS.MISSING.GET_ALL_ERROR
                + temp;
            return Promise.reject(error);
        }

        // Prepare the list of all missing applications
        if (CommonValidator.isNonEmptyArray(DefaultApplicationJson.all)) {
            let allApplications = allResult.data;
            let isExists = false;

            DefaultApplicationJson.all.forEach(s => {
                isExists = false;

                allApplications.every(el => {
                    if (el.code == s.code) {
                        isExists = true;
                        return false;
                    } else {
                        return true;
                    }
                });

                if (!isExists) {
                    missingApplications.push(s);
                }
            });

            console.log(Constants.BOOTSTRAP.PROVISION.APPLICATIONS.MISSING.NUM_TO_PROVISION + missingApplications.length);
        }

        if (CommonValidator.isNonEmptyArray(missingApplications)) {
            error = result = null;
            // Provision missing applications
            [error, result] = await To(ApplicationHelper.createMultiple(bootstrapUser, missingApplications, null, null));
            if (error) {
                let temp = error.message;
                error.message = Constants.BOOTSTRAP.PROVISION.APPLICATIONS.MISSING.ERROR
                    + Constants.BOOTSTRAP.PROVISION.APPLICATIONS.MISSING.CREATE_ERROR
                    + temp;
                return Promise.reject(error);
            }

            if (result.code == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE) {
                let temp = result.message;
                result.message = Constants.BOOTSTRAP.PROVISION.APPLICATIONS.MISSING.ERROR
                    + Constants.BOOTSTRAP.PROVISION.APPLICATIONS.MISSING.SUCCESS
                    + temp;
                console.log(Constants.BOOTSTRAP.PROVISION.APPLICATIONS.MISSING.SUCCESS);
                return Promise.resolve(result);
            } else {
                //This should never happen
                rejectObject.setCode(result.code);
                rejectObject.setMessage(result.message);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN);
                rejectObject.setDetails(result.data);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            console.log(Constants.BOOTSTRAP.PROVISION.APPLICATIONS.MISSING.NOTHING_TO_PROVISION);
            resolveObject.appendMessage(Constants.BOOTSTRAP.PROVISION.APPLICATIONS.MISSING.NOTHING_TO_PROVISION);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        rejectObject.appendMessage(Constants.BOOTSTRAP.PROVISION.APPLICATIONS.ERROR);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
 * Provision missing settings
 */
async function provisionMissingSettings() {

    // Initialize
    let error, result, countResult, fetchResult;
    let missingSettings = [];
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        '',
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        '',
        null
    );
    try {
        // Get the list of all existing settings
        let limit = CommonConstants.COMMON.APP_DB.FETCH_ALL.LIMIT.DEFAULT;
        let skip = CommonConstants.COMMON.APP_DB.FETCH_ALL.SKIP.DEFAULT;
        [error, countResult] = await To(SettingHelper.getAllCount());
        if (error) {
            let temp = error.message;
            error.message = Constants.BOOTSTRAP.PROVISION.SETTINGS.MISSING.GET_ALL_COUNT_ERROR
                + temp;
            return Promise.reject(error);
        }
        let count = parseInt(countResult.data.count);
        let got = 0;

        error = null;
        let allSettings = [];
        for (; got < count; got += limit, skip += limit) {
            let params = { sort: { _id: 1 }, select: ['applicationCode', 'categoryCode', 'property', 'value'] };
            let query = { skip: skip, limit: limit };
            [error, fetchResult] = await To(SettingHelper.getAll(params, query));
            if (error) {
                let temp = error.message;
                error.message = Constants.BOOTSTRAP.PROVISION.SETTINGS.MISSING.ERROR
                    + Constants.BOOTSTRAP.PROVISION.SETTINGS.MISSING.GET_ALL_ERROR
                    + temp;
                return Promise.reject(error);
            }
            allSettings = allSettings.concat(fetchResult.data);
            error = null;
            fetchResult = null;
        }


        // Prepare the list of all missing settings
        if (DefaultSettingJson.all && Array.isArray(DefaultSettingJson.all) && DefaultSettingJson.all.length > 0) {
            let isExists = false;

            DefaultSettingJson.all.forEach(s => {
                isExists = false;

                allSettings.every(el => {
                    if (el.applicationCode == s.applicationCode
                        && el.categoryCode == s.categoryCode
                        && el.property == s.property) {
                        isExists = true;
                        return false;
                    } else {
                        return true;
                    }
                });

                if (!isExists) {
                    missingSettings.push(s);
                }
            });

            console.log(Constants.BOOTSTRAP.PROVISION.SETTINGS.MISSING.NUM_TO_PROVISION + missingSettings.length);
        }

        if (CommonValidator.isNonEmptyArray(missingSettings)) { 
            error = result = null;
            // Provision missing settings
            [error, result] = await To(SettingHelper.createMultiple(bootstrapUser, missingSettings, null, null));
            if (error) {
                let temp = error.message;
                error.message = Constants.BOOTSTRAP.PROVISION.SETTINGS.MISSING.ERROR
                    + Constants.BOOTSTRAP.PROVISION.SETTINGS.MISSING.CREATE_ERROR
                    + temp;
                return Promise.reject(error);
            }
            if (result.code == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE) {
                let temp = result.message;
                result.message = Constants.BOOTSTRAP.PROVISION.SETTINGS.MISSING.ERROR
                    + Constants.BOOTSTRAP.PROVISION.SETTINGS.MISSING.SUCCESS
                    + temp;
                console.log(Constants.BOOTSTRAP.PROVISION.SETTINGS.MISSING.SUCCESS);
                return Promise.resolve(result);
            } else {
                //This should never happen
                rejectObject.setCode(result.code);
                rejectObject.setMessage(result.message);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN);
                rejectObject.setDetails(result.data);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            console.log(Constants.BOOTSTRAP.PROVISION.SETTINGS.MISSING.NOTHING_TO_PROVISION);
            resolveObject.setMessage(Constants.BOOTSTRAP.PROVISION.SETTINGS.MISSING.NOTHING_TO_PROVISION);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        rejectObject.appendMessage(Constants.BOOTSTRAP.PROVISION.SETTINGS.MISSING.ERROR);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}
