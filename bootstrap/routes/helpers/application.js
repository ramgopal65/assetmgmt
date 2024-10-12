module.exports = {
    createBootstrapApp: createBootstrapApp,
    createOne: createOne,
    createMultiple: createMultiple,
    getOneById: getOneById,
    getOneByCode: getOneByCode,
    getAll: getAll,
    applicationLogin: applicationLogin
};

// Imports
const JWT = require('jsonwebtoken');
const To = require('../../../common/to/to');
const CommonValidator = require('../../../common/validate/validator');
const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');
const SettingsKeysCommon = require('../../../common/setting/keys');
const ResolveData = require('../../../common/response/resolve-data');
const RejectData = require('../../../common/response/reject-data');
const Constants = require('../../constant/constant');
const CommonConstants = require('../../../common/constant/constant');

const ApplicationService = require('../services/application');


/**
 * Create bootstrap app
 * @param {*} authUser 
 * @param {*} application 
 */
async function createBootstrapApp( application) {
    try {
        // Initialize
        let error, result;
        // Assign
        application.createdBy = 'self';
        application.updatedBy = 'self';

        // Create one
        [error, result] = await To(ApplicationService.createOne(application));
        if (error) {
            return Promise.reject(error);
        } else {
            let bootstrapAppId = result.data._id;
            let bootstrapApp = {};
            if ('self' == result.data.createdBy) {
                bootstrapApp.createdBy = result.data._id;
            }
            if ('self' == result.data.updatedBy) {
                bootstrapApp.updatedBy = result.data._id;
            }
            error = result = null;
            [error, result] = await To(ApplicationService.updateOneById(bootstrapAppId, bootstrapApp));
            if (error) {
                return Promise.reject(error);
            }
            // Response
            if (result) {
                return Promise.resolve(result);
            }
        }
    } catch (e) {
        var rejObj = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.CREATE_ONE.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObj.jsonObject());
    }
}

/**
 * Create one application
 * @param {*} authUser 
 * @param {*} application 
 */
async function createOne(authUser, application) {
    try {
        // Initialize
        let error, result;
        // Assign
        if (authUser && CommonValidator.isValidMongoObjectId(authUser.id)) {
            application.createdBy = authUser.id;
            application.updatedBy = authUser.id;
        }

        // Create one
        [error, result] = await To(ApplicationService.createOne(application));
        if (error) {
            return Promise.reject(error);
        }

        // Response
        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObj = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.CREATE_ONE.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObj.jsonObject());
    }
}

/**
 * Create multiple applications
 * @param {*} authUser 
 * @param {*} applications 
 */
async function createMultiple(authUser, applications) {
    try {
        // Initialize
        let error, result;


        // Assign
        if (authUser && CommonValidator.isValidMongoObjectId(authUser._id)) {
            applications.forEach(function (a) {
                a.createdBy = authUser._id;
                a.updatedBy = authUser._id;
            });
        }
        // Create multiple
        [error, result] = await To(ApplicationService.createMultiple(applications));
        if (error) {
            return Promise.reject(error);
        }

        // Response
        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObj = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.CREATE_MULTIPLE.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObj.jsonObject());
    }
}

/**
 * Get one application by id
 * @param {*} applicationId 
 */
async function getOneById(applicationId) {
    try {
        // Initialize
        let error, result;

        // Create
        [error, result] = await To(ApplicationService.getOneById(applicationId));
        if (error) {
            return Promise.reject(error);
        }

        // Response
        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObj = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.GET_ONE_BY_ID.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObj.jsonObject());
    }
}

/**
 * Get one application by id
 * @param {*} applicationCode 
 */
async function getOneByCode(applicationCode) {
    try {
        // Initialize
        let error, result;

        // Create
        [error, result] = await To(ApplicationService.getOneByCode(applicationCode));
        if (error) {
            return Promise.reject(error);
        }

        // Response
        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObj = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.GET_ONE_BY_CODE.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObj.jsonObject());
    }
}

/**
 * Get all applications
 * @param {*} params 
 * @param {*} flags 
 */
async function getAll(params, flags) {
    try {
        // Initialize
        let error, result;

        // Get all
        [error, result] = await To(ApplicationService.getAll(params, flags));
        if (error) {
            return Promise.reject(error);
        }

        // Response
        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObj = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.GET_ALL.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObj.jsonObject());
    }
}

/**
* Application login
* @param {*} application 
* @param {*} params 
* @param {*} flags 
*/
async function applicationLogin(application) {
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.UNKNOWN.CODE,
        Constants.BOOTSTRAP.APPLICATIONS.APPLICATION_LOGIN.ERROR + application.code,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );
    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.BOOTSTRAP.APPLICATIONS.APPLICATION_LOGIN.SUCCESS + application.code,
        null
    );
    try {
        // Initialize
        let error, result;

        // Get
        [error, result] = await To(ApplicationService.getOneByCode(application.code));
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            // Expiry
            let expiry;
            expiry = Date.now() + SettingsMap.get(SettingsKeysCommon.COMMON.JWT.EXPIRY_DURATION_SECONDS) * 1000;

            // Generate a token
            let token = JWT.sign(
                {
                    iss: SettingsMap.get(SettingsKeysCommon.COMMON.JWT.ISSUER),
                    iat: Date.now(),
                    jti: result.data._id,
                    aud: CommonConstants.COMMON.APP_JWT.AUDIENCE.APPLICATION,
                    exp: expiry,
                    sub: 'Bootstrap Server Access Token'
                },
                SettingsMap.get(SettingsKeysCommon.COMMON.JWT.SECRET)
            );

            // Response
            resolveObject.setData({
                token: token,
                token_expiry: expiry
            });

            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        var rejObj = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.APPLICATION_LOGIN.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject()); 
    }
}