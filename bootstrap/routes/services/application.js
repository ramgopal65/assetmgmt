module.exports = {
    createOne: createOne,
    createMultiple: createMultiple,
    getOneById: getOneById,
    getOneByCode: getOneByCode,
    getAll: getAll,
    updateOneById: updateOneById
};

// Import
const Mongoose = require('mongoose');
const ResolveData = require('../../../common/response/resolve-data');
const RejectData = require('../../../common/response/reject-data');
const CommonValidator = require('../../../common/validate/validator');
const To = require('../../../common/to/to');
const Constants = require('../../constant/constant');
const CommonConstants = require('../../../common/constant/constant');
const ApplicationModel = require('../models/application');


function handleMongooseError(e, message) {
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.UNKNOWN.CODE,
        message,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        e);

    if (e instanceof Mongoose.mongo.MongoError) {
        if (e.code == CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_PROVIDED_KEY_ALREADY_IN_USE.MONGO_CODE) {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_PROVIDED_KEY_ALREADY_IN_USE);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
        } else if ((e.code == CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_CURSOR_NOT_FOUND.MONGO_CODE) || (e != null && JSON.stringify(e).includes('Cursor not found'))) {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_CURSOR_NOT_FOUND);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
        } else if (e.name == 'CastError') {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_MONGO_CAST);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
        } else {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_UNKNOWN_MONGO);
            rejectObject.appendMessage(e.message);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN);
            rejectObject.setDetails(e);
        }
    } else if (e instanceof Mongoose.Error.ValidationError) {
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
        rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_VALIDATION);
        rejectObject.appendMessage(e.message);
        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
    } else if (e.name == 'CastError') {
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
        rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_CAST);
        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
    } else {
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
        rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_UNKNOWN);
        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN);
    }
    return rejectObject.jsonObject();
}

/**
 * Create one application
 * @param {*} application 
 */
async function createOne(application) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.CREATE_ONE.SUCCESS,
            null
        );
        // Create
        [error, result] = await To(ApplicationModel(application).save());
        if (CommonValidator.isNonEmptyObject(result)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }else {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.APPLICATIONS.CREATE_ONE.ERROR));
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.APPLICATIONS.CREATE_ONE.ERROR));
    }
}

/**
 * Create multiple applications
 * @param {*} applications 
 */
async function createMultiple(applications) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.CREATE_MULTIPLE.SUCCESS,
            null
        );

        // Create
        [error, result] = await To(ApplicationModel.insertMany(applications, { options: { ordered: false, rawResult: false } }));
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.APPLICATIONS.CREATE_MULTIPLE.ERROR));
        }
        if (applications.length == result.length) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.BOOTSTRAP.APPLICATIONS.CREATE_MULTIPLE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());

        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.SETTINGS.CREATE_MULTIPLE.ERROR));
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
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.GET_ONE_BY_ID.SUCCESS,
            null
        );

        // Get
        [error, result] = await To(ApplicationModel.findById(applicationId).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.APPLICATIONS.GET_ONE_BY_ID.ERROR));
        }

        // Response
        if (result && (applicationId == result._id)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.BOOTSTRAP.APPLICATIONS.GET_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.APPLICATIONS.GET_ONE_BY_ID.ERROR));
    }
}

/**
 * Get one application by code
 * @param {*} applicationCode 
 */
async function getOneByCode(applicationCode) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.GET_ONE_BY_CODE.SUCCESS,
            null
        );

        // Get
        [error, result] = await To(ApplicationModel.findOne({ code: applicationCode }).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.APPLICATIONS.GET_ONE_BY_CODE.ERROR));
        }

        // Response
        if (result && CommonValidator.isNonEmptyObject(result) && (applicationCode == result.code)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.APPLICATIONS.GET_ONE_BY_CODE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());

        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.APPLICATIONS.GET_ONE_BY_CODE.ERROR));
    }
}
/**
 * Get all applications
 * @param {*} params 
 * @param {*} query 
 */
async function getAll(params, query) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.GET_ALL.SUCCESS,
            null
        );

        // Get all
        [error, result] = await To(ApplicationModel.find().sort(params.sort).select(params.select).skip(query.skip).limit(query.limit).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.APPLICATIONS.GET_ALL.ERROR));
        }

        // Response
        if (result) {
            if (!CommonValidator.isNonEmptyArray(result)) {
                resolveObject.appendMessage(Constants.BOOTSTRAP.APPLICATIONS.GET_ALL.SUCCESS_NO_DATA);
            }
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.BOOTSTRAP.APPLICATIONS.GET_ALL.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.APPLICATIONS.GET_ALL.ERROR));
    }
}

/**
* Update one application by id
* @param {*} setting 
*/
async function updateOneById(applicationId, application) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.UPDATE_ONE_BY_ID.SUCCESS,
            null
        );

        // Assign
        let updateObj = application;
        // Update
        //Correct this
        [error, result] = await To(ApplicationModel.findByIdAndUpdate(applicationId, updateObj, { new: true }).exec());

        // Response
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.SETTINGS.UPDATE_ONE_BY_ID.ERROR));
        }
        if (result && (JSON.stringify(result._id) == JSON.stringify(applicationId))) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.APPLICATIONS.UPDATE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.APPLICATIONS.UPDATE_ONE_BY_ID.ERROR));
    }
}