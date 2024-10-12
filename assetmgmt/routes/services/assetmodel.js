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
const AssetModelModel = require('../models/assetmodel');
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
 * Create one asset model
 * @param {*} authUser 
 * @param {*} assetModel 
 * @param {*} params 
 * @param {*} flags 
 */
async function createOne(assetModel, params, flags) {
    try {
        // Initialize
        let result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.ASSET_MODELS.CREATE_ONE.SUCCESS,
            null
        );

        if (!params) {
            params = {};
        }
        if (!flags) {
            flags = {};
        }

        // Create
        result = await new AssetModelModel(assetModel).save();

        if (result) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.ASSET_MODELS.CREATE_ONE.ERROR));
    }
}

/**
 * Create multiple asset models
 * @param {*} authUser 
 * @param {*} assetModels 
 * @param {*} params 
 * @param {*} flags 
 */
async function createMultiple(assetModels, params, flags) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.ASSET_MODELS.CREATE_MULTIPLE.SUCCESS,
            null
        );

        if (!params) {
            params = {};
        }
        if (!flags) {
            flags = {};
        }

        // Create
        [error, result] = await To(AssetModelModel.insertMany(assetModels, { options: { ordered: true, rawResult: true } }));

        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.ASSET_MODELS.CREATE_MULTIPLE.ERROR));
        }
        if (result) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.ASSET_MODELS.CREATE_MULTIPLE.ERROR));
    }
}

/**
 * Get one asset model by id
 * @param {*} authUser 
 * @param {*} assetodelId 
 * @param {*} params 
 * @param {*} flags 
 */
async function getOneById(authUser, assetModelId, params, flags) {
    try {
        // Initialize
        let query = {};
        let result = null;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.ASSET_MODELS.GET_ONE_BY_ID.SUCCESS,
            null
        );

        if (!params) {
            params = {};
        }
        if (!flags) {
            flags = {};
        }

        // Assign
        query._id = assetModelId;

        // Get
        result = await AssetModelModel.findOne(query);

        if (result) {
            if (!CommonValidator.isNonEmptyArray(result)) {
                resolveObject.appendMessage(Constants.ASSETMGMT.ASSET_MODELS.GET_ONE_BY_ID.SUCCESS_NO_DATA);
            }
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.ASSET_MODELS.GET_ONE_BY_ID.ERROR));
    }
}

/**
 * Get one asset model by code
 * @param {*} authUser 
 * @param {*} assetModelCode 
 * @param {*} params 
 * @param {*} flags 
 */
async function getOneByCode(authUser, assetModelCode, params, flags) {
    try {
        // Initialize
        let query = {};
        let result = null;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.ASSET_MODELS.GET_ONE_BY_CODE.SUCCESS,
            null
        );

        if (!params) {
            params = {};
        }
        if (!flags) {
            flags = {};
        }

        // Assign
        query._id = assetModelCode;

        // Get
        result = await AssetModelModel.findOne(query);

        if (result) {
            if (!CommonValidator.isNonEmptyArray(result)) {
                resolveObject.appendMessage(Constants.ASSETMGMT.ASSET_MODELS.GET_ONE_BY_CODE.SUCCESS_NO_DATA);
            }
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.ASSET_MODELS.GET_ONE_BY_CODE.ERROR));
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
            Constants.ASSETMGMT.ASSET_MODELS.GET_ALL.SUCCESS,
            null
        );

        // Get all
        [error, result] = await To(AssetModelModel.find().sort(params.sort).select(params.select).skip(query.skip).limit(query.limit).exec());
        if (result && CommonValidator.isNonEmptyArray(result)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else if (result) {
            resolveObject.appendMessage(Constants.ASSETMGMT.ASSET_MODELS.GET_ALL.SUCCESS_NO_DATA);
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.ASSET_MODELS.GET_ALL.ERROR));
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.ASSET_MODELS.GET_ALL.ERROR));
    }
}

//TODO: fetch count and items parallely
/**
 * Get all assetmodel count
 */
async function getAllCount() {
    try {
        // Initialize
        let error, count;

        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.ASSET_MODELS.GET_ALL_COUNT.SUCCESS,
            null
        );

        // Get all
        [error, count] = await To(AssetModelModel.estimatedDocumentCount().exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.ASSET_MODELS.GET_ALL_COUNT.ERROR));
        }
        // Response
        //count = 0 is success; build it to avoid failures for truth checks
        if ((count != null) && (count >= 0)) {
            resolveObject.setData({ count: count });
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.ASSET_MODELS.GET_ALL_COUNT.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.ASSET_MODELS.GET_ALL_COUNT.ERROR));
    }
}

/**
 * Search
 * @param {*} authUser 
 * @param {*} assetModel 
 * @param {*} params 
 * @param {*} flags 
 */
async function search(authUser, assetModel, params, flags) {
    try {
        // Initialize
        let error, result = {};
        let query = {};
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.ASSET_MODELS.SEARCH.SUCCESS,
            null
        );

        if (assetModel.name) {
            query.name = { $regex: assetModel.name, $options: 'i' };
        }
        if (assetModel.code) {
            query.code = { $regex: assetModel.code, $options: 'i' };
        }
        else if (assetModel.codes) {
            query.code = {
                $in: assetModel.codes
            };
        }

        // Validate query
        if (!query || (query && Object.keys(query).length == 0)) {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.ASSET_MODELS.SEARCH.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                error);
            rejectObject.appendMessage(Constants.ASSETMGMT.ASSET_MODELS.SEARCH.ERROR_KEY);
            Promise.reject(rejectObject.jsonObject());
        }

        if (!params) {
            params = {};
        }
        if (!flags) {
            flags = {};
        }

        // Set limit
        params.limit = (params.limit && CommonValidator.isNumericAndPositive(params.limit)) ? parseInt(params.limit) : SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.MAXIMUM.RESULTS.SEARCH);
        // Set skip
        params.skip = (params.skip && CommonValidator.isNumericAndPositive(params.skip)) ? parseInt(params.skip) : SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.SKIP.RESULTS.SEARCH);
        // Set sort
        params.sort = (params.sort && params.sort == 1) ? { _id: parseInt(params.sort) } : SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.SORT.RESULTS.SEARCH);

        // Get
        //Corect
        [error, result] = await AssetModelModel.find(query).sort(params.sort).skip(params.skip).limit(params.limit);
        if (error) {
            var rejObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.ASSET_MODELS.SEARCH.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                error);
            Promise.rej(rejectObject.jsonObject());
        }

        if (result) {
            if (CommonValidator.isNonEmptyArray(result)) {
                resolveObject.setData(result);
                return Promise.resolve(resolveObject.jsonObject());
            }
            else {
                resolveObject.setMessage(Constants.ASSETMGMT.ASSET_MODELS.SEARCH.SUCCESS_NO_DATA);
                resolveObject.setData(result);
                return Promise.resolve(resolveObject.jsonObject());
            }
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.ASSET_MODELS.SEARCH.ERROR));
    }
}
/**
 * Update one asset model by id
 * @param {*} authUser 
 * @param {*} assetModel 
 * @param {*} params 
 * @param {*} flags 
 */
async function updateOneById(authUser, assetModel, params, flags) {
    try {
        // Initialize
        let error, result, updateObj = {};
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.ASSET_MODELS.UPDATE_ONE_BY_ID.SUCCESS,
            null
        );

        if (!params) {
            params = {};
        }
        if (!flags) {
            flags = {};
        }

        // Assign
        updateObj = assetModel;
        updateObj.updatedBy = authUser.id;

        // Update
        [error, result] = await AssetModelModel.findByIdAndUpdate(assetModel._id, { $set: updateObj }, { new: true });

        if (error) {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.NOT_FOUND.CODE,
                Constants.ASSETMGMT.ASSET_MODELS.UPDATE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                error);
            rejectObject.appendMessage(Constants.ASSETMGMT.ASSET_MODELS.UPDATE_ONE_BY_ID.ERROR_ID_NOT_FOUND);
            return Promise.reject(rejectObject.jsonObject());
        }
        if (result && result.code == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.ASSET_MODELS.UPDATE_ONE_BY_ID.ERROR));
    }
}

/**
 * Delete one asset model by id
 * @param {*} authUser 
 * @param {*} assetModelId 
 * @param {*} params 
 * @param {*} flags 
 */
async function deleteOneById(authUser, assetModelId, params, flags) {

    try {
        // Initialize
        let error, result = {};
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.ASSET_MODELS.DELETE_ONE_BY_ID.SUCCESS,
            null
        );

        if (!params) {
            params = {};
        }
        if (!flags) {
            flags = {};
        }

        // Delete
        [error, result] = await AssetModelModel.findByIdAndRemove(assetModelId).exec();

        if (error) {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.NOT_FOUND.CODE,
                Constants.ASSETMGMT.ASSET_MODELS.DELETE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                error);
            rejectObject.appendMessage(Constants.ASSETMGMT.ASSET_MODELS.DELETE_ONE_BY_ID.ERROR_ID_NOT_FOUND);
            return Promise.reject(rejectObject.jsonObject());
        }
        if (result && result.code == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.ASSET_MODELS.DELETE_ONE_BY_ID.ERROR));
    }
}
