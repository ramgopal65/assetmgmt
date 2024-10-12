module.exports = {
    createOne: createOne,
    createMultiple: createMultiple,
    getAll: getAll,
    getAllCount: getAllCount,
    getOneById: getOneById,
    getOneByCode: getOneByCode,
    search: search,
    updateOneById: updateOneById,
    deleteOneById: deleteOneById,
};

// Imports
const Mongoose = require('mongoose');
const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');
const CommonSettingsKeys = require('../../../common/setting/keys');
const CommonValidator = require('../../../common/validate/validator');
const To = require('../../../common/to/to');
const TrackerModelModel = require('../models/trackermodel');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const ResolveData = require('../../../common/response/resolve-data');
const RejectData = require('../../../common/response/reject-data');
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
 * Create one tracker model
 * @param {*} authUser 
 * @param {*} trackerModel 
 * @param {*} params 
 * @param {*} flags 
 */
async function createOne(authUser, trackerModel, params, flags) {
    try {
        // Initialize
        let result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.TRACKER_MODELS.CREATE_ONE.SUCCESS,
            null
        );

        if (!params) {
            params = {};
        }
        if (!flags) {
            flags = {};
        }

        // Assign
        if (authUser && CommonValidator.isValidMongoObjectId(authUser.id)) {
            trackerModel.createdBy = authUser.id;
        }

        // Create
        result = await new TrackerModelModel(trackerModel).save();

        if (result) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.TRACKER_MODELS.CREATE_ONE.ERROR));
    }
}

/**
 * Create multiple tracker models
 * @param {*} authUser 
 * @param {*} trackerModels 
 * @param {*} params 
 * @param {*} flags 
 */
async function createMultiple(authUser, trackerModels, params, flags) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.TRACKER_MODELS.CREATE_MULTIPLE.SUCCESS,
            null
        );

        if (!params) {
            params = {};
        }
        if (!flags) {
            flags = {};
        }

        // Assign
        if (authUser && CommonValidator.isValidMongoObjectId(authUser._id)) {
            trackerModels.forEach(function (trackerModel) {
                trackerModel.createdBy = authUser._id;
                trackerModel.updatedBy = authUser._id;
            });
        }

        // Create
        //Correct
        //result = await TrackerModelModel.insertMany(trackerModels, { options: { ordered: true, rawResult: true } });
        [error, result] = await To(TrackerModelModel.insertMany(trackerModels, { options: { ordered: true, rawResult: true } }));

        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.TRACKER_MODELS.CREATE_MULTIPLE.ERROR));
        }
        if (result) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.TRACKER_MODELS.CREATE_MULTIPLE.ERROR));
    }
}

/**
 * Get one tracker model by id
 * @param {*} authUser 
 * @param {*} trackerModelId 
 * @param {*} params 
 * @param {*} flags 
 */
async function getOneById(authUser, trackerModelId, params, flags) {
    try {
        // Initialize
        let query = {};
        let result = null;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.TRACKER_MODELS.GET_ONE_BY_ID.SUCCESS,
            null
        );

        if (!params) {
            params = {};
        }
        if (!flags) {
            flags = {};
        }

        // Assign
        query._id = trackerModelId;

        // Get
        result = await TrackerModelModel.findOne(query);

        if (result) {
            if (!CommonValidator.isNonEmptyArray(result)) {
                resolveObject.appendMessage(Constants.ASSETMGMT.TRACKER_MODELS.GET_ONE_BY_ID.SUCCESS_NO_DATA);
            }
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.TRACKER_MODELS.GET_ONE_BY_ID.ERROR));
    }
}

/**
 * Get one tracker model by code
 * @param {*} authUser 
 * @param {*} trackerModelCode 
 * @param {*} params 
 * @param {*} flags 
 */
async function getOneByCode(authUser, trackerModelCode, params, flags) {
    try {
        // Initialize
        let query = {};
        let result = null;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.TRACKER_MODELS.GET_ONE_BY_CODE.SUCCESS,
            null
        );

        if (!params) {
            params = {};
        }
        if (!flags) {
            flags = {};
        }

        // Assign
        query._id = trackerModelCode;

        // Get
        result = await TrackerModelModel.findOne(query);

        if (result) {
            if (!CommonValidator.isNonEmptyArray(result)) {
                resolveObject.appendMessage(Constants.ASSETMGMT.TRACKER_MODELS.GET_ONE_BY_CODE.SUCCESS_NO_DATA);
            }
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.TRACKER_MODELS.GET_ONE_BY_CODE.ERROR));
    }
}


/**
 * Get all features
 * @param {*} params 
 * @param {*} query 
 */
async function getAll(params, query) {
    try {
        // Initialize
        let error, result;

        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.TRACKER_MODELS.GET_ALL.SUCCESS,
            null
        );

        // Get all
        [error, result] = await To(TrackerModelModel.find().sort(params.sort).select(params.select).skip(query.skip).limit(query.limit).exec());
        if (result && CommonValidator.isNonEmptyArray(result)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else if (result) {
            resolveObject.appendMessage(Constants.ASSETMGMT.TRACKER_MODELS.GET_ALL.SUCCESS_NO_DATA);
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.TRACKER_MODELS.GET_ALL.ERROR));
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.TRACKER_MODELS.GET_ALL.ERROR));
    }
}

//TODO: fetch count and items parallely
/**
 * Get all trackermodel count
 */
async function getAllCount() {
    try {
        // Initialize
        let error, count;

        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.TRACKER_MODELS.GET_ALL_COUNT.SUCCESS,
            null
        );

        // Get all
        [error, count] = await To(TrackerModelModel.estimatedDocumentCount().exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.TRACKER_MODELS.GET_ALL_COUNT.ERROR));
        }
        // Response
        //count = 0 is success; build it to avoid failures for truth checks
        if ((count != null) && (count >= 0)) {
            resolveObject.setData({ count: count });
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.TRACKER_MODELS.GET_ALL_COUNT.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.TRACKER_MODELS.GET_ALL_COUNT.ERROR));
    }
}

/**
 * Search
 * @param {*} authUser 
 * @param {*} trackerModel 
 * @param {*} params 
 * @param {*} flags 
 */
async function search(authUser, trackerModel, params, flags) {
    try {
        // Initialize
        let error, result = {};
        let query = {};
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.TRACKER_MODELS.SEARCH.SUCCESS,
            null
        );

        if (trackerModel.name) {
            query.name = { $regex: trackerModel.name, $options: 'i' };
        }
        if (trackerModel.code) {
            query.code = { $regex: trackerModel.code, $options: 'i' };
        }
        else if (trackerModel.codes) {
            query.code = {
                $in: trackerModel.codes
            };
        }

        // Validate query
        if (!query || (query && Object.keys(query).length == 0)) {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.TRACKER_MODELS.SEARCH.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                error);
            rejectObject.appendMessage(Constants.ASSETMGMT.TRACKER_MODELS.SEARCH.ERROR_KEY);
            Promise.reject(rejectObject.jsonObject());
        }

        if (!params) {
            params = {};
        }
        if (!flags) {
            flags = {};
        }

        // Set limit
        params.limit = (params.limit && CommonValidator.isNumericAndPositive(params.limit)) ? parseInt(params.limit) : SettingsMap.get(CommonSettingsKeys.COMMONDATABASE.MAXIMUM.RESULTS.SEARCH);
        // Set skip
        params.skip = (params.skip && CommonValidator.isNumericAndPositive(params.skip)) ? parseInt(params.skip) : SettingsMap.get(CommonSettingsKeys.COMMONDATABASE.SKIP.RESULTS.SEARCH);
        // Set sort
        params.sort = (params.sort && params.sort == 1) ? { _id: parseInt(params.sort) } : SettingsMap.get(CommonSettingsKeys.COMMONDATABASE.SORT.RESULTS.SEARCH);

        // Get
        //Corect
        [error, result] = await TrackerModelModel.find(query).sort(params.sort).skip(params.skip).limit(params.limit);
        if (error) {
            var rejObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.TRACKER_MODELS.SEARCH.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                error);
            Promise.reject(rejObject.jsonObject());
        }

        if (result) {
            if (CommonValidator.isNonEmptyArray(result)) {
                resolveObject.setData(result);
                return Promise.resolve(resolveObject.jsonObject());
            }
            else {
                resolveObject.setMessage(Constants.ASSETMGMT.TRACKER_MODELS.SEARCH.SUCCESS_NO_DATA);
                resolveObject.setData(result);
                return Promise.resolve(resolveObject.jsonObject());
            }
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.TRACKER_MODELS.SEARCH.ERROR));
    }
}
/**
 * Update one tracker model by id
 * @param {*} authUser 
 * @param {*} trackerModel 
 * @param {*} params 
 * @param {*} flags 
 */
async function updateOneById(authUser, trackerModel, params, flags) {
    try {
        // Initialize
        let error, result, updateObj = {};
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.TRACKER_MODELS.UPDATE_ONE_BY_ID.SUCCESS,
            null
        );

        if (!params) {
            params = {};
        }
        if (!flags) {
            flags = {};
        }

        // Assign
        updateObj = trackerModel;
        updateObj.updatedBy = authUser.id;

        // Update
        [error, result] = await TrackerModelModel.findByIdAndUpdate(trackerModel._id, { $set: updateObj }, { new: true });

        if (error) {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.NOT_FOUND.CODE,
                Constants.ASSETMGMT.TRACKER_MODELS.UPDATE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                error);
            rejectObject.appendMessage(Constants.ASSETMGMT.TRACKER_MODELS.UPDATE_ONE_BY_ID.ERROR_ID_NOT_FOUND);
            return Promise.reject(rejectObject.jsonObject());
        }
        if (result && result.code == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.TRACKER_MODELS.UPDATE_ONE_BY_ID.ERROR));
    }
}

/**
 * Delete one tracker model by id
 * @param {*} authUser 
 * @param {*} trackerModelId 
 * @param {*} params 
 * @param {*} flags 
 */
async function deleteOneById(authUser, trackerModelId, params, flags) {

    try {
        // Initialize
        let error, result = {};
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.TRACKER_MODELS.DELETE_ONE_BY_ID.SUCCESS,
            null
        );

        if (!params) {
            params = {};
        }
        if (!flags) {
            flags = {};
        }

        // Delete
        [error, result] = await TrackerModelModel.findByIdAndRemove(trackerModelId).exec();

        if (error) {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.NOT_FOUND.CODE,
                Constants.ASSETMGMT.TRACKER_MODELS.DELETE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                error);
            rejectObject.appendMessage(Constants.ASSETMGMT.TRACKER_MODELS.DELETE_ONE_BY_ID.ERROR_ID_NOT_FOUND);
            return Promise.reject(rejectObject.jsonObject());
        }
        if (result && result.code == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.TRACKER_MODELS.DELETE_ONE_BY_ID.ERROR));
    }
}
