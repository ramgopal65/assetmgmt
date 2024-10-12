module.exports = {
    createOne: createOne,
    createMultiple: createMultiple,
    getAll: getAll,
    getAllCount: getAllCount,
    getOneById: getOneById,
    getOneByCode: getOneByCode,
    search: search,
    updateOneById: updateOneById,
    deleteOneById: deleteOneById
};

// Imports
const Mongoose = require('mongoose');
const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');
const CommonSettingsKeys = require('../../../common/setting/keys');
const CommonValidator = require('../../../common/validate/validator');
const FeatureModel = require('../models/feature');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const ResolveData = require('../../../common/response/resolve-data');
const RejectData = require('../../../common/response/reject-data');
const To = require('../../../common/to/to');

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

//TODO: use authUser
/**
 * Create one feature
 * @param {*} feature 
 */
async function createOne(feature) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.FEATURES.CREATE_ONE.SUCCESS,
            null
        );

        // Create
        [error, result] = await To(FeatureModel(feature).save());
        if (CommonValidator.isNonEmptyObject(result) && CommonValidator.isValidMongoObjectId(result._id)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.FEATURES.CREATE_ONE.ERROR));
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.FEATURES.CREATE_ONE.ERROR));
    }
}

/**
 * Create multiple features
 * @param {*} features 
 */
async function createMultiple(features) {
    try {
        // Initialize
        let error, result;

        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.FEATURES.CREATE_MULTIPLE.SUCCESS,
            null
        );

        // Create
        [error, result] = await To(FeatureModel.insertMany(features, { options: { ordered: true, rawResult: false } }));
        if (CommonValidator.isNonEmptyArray(result) && (features.length == result.length)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.FEATURES.CREATE_MULTIPLE.ERROR));
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.FEATURES.CREATE_MULTIPLE.ERROR));
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
            Constants.ASSETMGMT.FEATURES.GET_ALL.SUCCESS,
            null
        );

        // Get all
        [error, result] = await To(FeatureModel.find().sort(params.sort).select(params.select).skip(query.skip).limit(query.limit).exec());
        if (result && CommonValidator.isNonEmptyArray(result)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else if (result) {
            resolveObject.appendMessage(Constants.ASSETMGMT.FEATURES.GET_ALL.SUCCESS_NO_DATA);
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.FEATURES.GET_ALL.ERROR));
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.FEATURES.GET_ALL.ERROR));
    }
}

//TODO: fetch count and items parallely
/**
 * Get all feature count
 */
async function getAllCount() {
    try {
        // Initialize
        let error, count;

        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.FEATURES.GET_ALL_COUNT.SUCCESS,
            null
        );

        // Get all
        [error, count] = await To(FeatureModel.estimatedDocumentCount().exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.FEATURES.GET_ALL_COUNT.ERROR));
        }
        // Response
        //count = 0 is success; build it to avoid failures for truth checks
        if ((count != null) && (count >= 0)) {
            resolveObject.setData({ count: count });
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.FEATURES.GET_ALL_COUNT.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.FEATURES.GET_ALL_COUNT.ERROR));
    }
}

/**
 * Get one feature by id
 * @param {*} featureId 
 */
async function getOneById(featureId) {
    try {
        // Initialize
        let error, result;
        let searchCondition = {};
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.FEATURES.GET_ONE_BY_ID.SUCCESS,
            null
        );

        // Assign
        searchCondition._id = featureId;

        // Get
        [error, result] = await To(FeatureModel.findOne(searchCondition));
        if (CommonValidator.isNonEmptyObject(result) && (searchCondition._id.equals(result._id))) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.FEATURES.GET_ONE_BY_ID.ERROR));
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.FEATURES.GET_ONE_BY_ID.ERROR));
    }
}

/**
 * Get one feature by code
 * @param {*} featureCode 
 */
async function getOneByCode(featureCode) {
    try {
        // Initialize
        let error, result;
        let searchCondition = {};

        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.FEATURES.GET_ONE_BY_CODE.SUCCESS,
            null
        );
        // Assign
        searchCondition.code = featureCode;

        // Get
        [error, result] = await To(FeatureModel.findOne(searchCondition));
        if (CommonValidator.isNonEmptyObject(result) && (searchCondition.code == result.code)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.FEATURES.GET_ONE_BY_CODE.ERROR));
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.FEATURES.GET_ONE_BY_CODE.ERROR));
    }
}

/**
 * Search
 * @param {*} feature 
 */
async function search(feature, params, flags) {
    try {
        // Initialize
        let error, result = {};
        let query = {};
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.FEATURES.SEARCH.SUCCESS,
            null
        );

        if (feature.name) {
            query.name = { $regex: feature.name, $options: 'i' };
        }
        if (feature.code) {
            query.code = { $regex: feature.code, $options: 'i' };
        }
        else if (feature.codes) {
            query.code = {
                $in: feature.codes
            };
        }
        // Validate query
        if (!query || (query && Object.keys(query).length == 0)) {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.FEATURES.SEARCH.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                error);
            rejectObject.appendMessage(Constants.ASSETMGMT.FEATURES.SEARCH.ERROR_KEY);
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
        [error, result] = await To(FeatureModel.find(query).sort(params.sort).skip(params.skip).limit(params.limit));
        if (CommonValidator.isSuccessResponseAndNonEmptyDataArray(result)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else if (CommonValidator.isSuccessResponse(result)){
            resolveObject.setMessage(Constants.ASSETMGMT.FEATURES.SEARCH.SUCCESS_NO_DATA);
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.FEATURES.SEARCH.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                error);
            Promise.reject(rejObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.FEATURES.SEARCH.ERROR));
    }
}

/**
 * Update one feature by id
 * @param {*} feature 
 */
async function updateOneById(featureId, feature) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.FEATURES.UPDATE_ONE_BY_ID.SUCCESS,
            null
        );

        // Update
        [error, result] = await To(FeatureModel.findByIdAndUpdate(featureId, feature, { new: true }));
        if (CommonValidator.isNonEmptyObject(result) && (result._id.equals(featureId))) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.NOT_FOUND.CODE,
                Constants.ASSETMGMT.FEATURES.UPDATE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                error);
            rejectObject.appendMessage(Constants.ASSETMGMT.FEATURES.UPDATE_ONE_BY_ID.ERROR_ID_NOT_FOUND);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.FEATURES.UPDATE_ONE_BY_ID.ERROR));
    }
}

/**
 * Delete one feature by id
 * @param {*} featureId 
 */
async function deleteOneById(featureId) {
    try {
        // Initialize
        let error, result = {};
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.FEATURES.DELETE_ONE_BY_ID.SUCCESS,
            null
        );

        // Delete
        [error, result] = await To(FeatureModel.findByIdAndRemove(featureId).exec());
        if (CommonValidator.isNonEmptyObject(result) && (result._id.equals(featureId))) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.NOT_FOUND.CODE,
                Constants.ASSETMGMT.FEATURES.DELETE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                error);
            rejectObject.appendMessage(Constants.ASSETMGMT.FEATURES.DELETE_ONE_BY_ID.ERROR_ID_NOT_FOUND);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.FEATURES.DELETE_ONE_BY_ID.ERROR));
    }
}