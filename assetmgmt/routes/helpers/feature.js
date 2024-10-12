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
const To = require('../../../common/to/to');
const FeatureService = require('../services/feature');
const RejectData = require('../../../common/response/reject-data');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const CommonValidator = require('../../../common/validate/validator');

/**
 * Create one feature
 * @param {*} authUser 
 * @param {*} feature 
 * @param {*} params 
 * @param {*} flags 
 */
async function createOne(authUser, feature, params, flags) {
    try {
        if (authUser && CommonValidator.isValidMongoObjectId(authUser._id)) {
            feature.createdBy = authUser._id;
            feature.updatedBy = authUser._id;
        }

        // Initialize
        let error, result;
        [error, result] = await To(FeatureService.createOne(feature));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
            return Promise.resolve(result);
        } else {
            return Promise.reject(error);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.FEATURES.CREATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejObject.appendMessage(e.message);
        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Create multiple features
 * @param {*} authUser 
 * @param {*} features 
 * @param {*} params 
 * @param {*} flags 
 */
async function createMultiple(authUser, features, params, flags) {
    try {

        if (authUser && CommonValidator.isValidMongoObjectId(authUser._id)) {
            features.forEach(function (f) {
                f.createdBy = authUser._id;
                f.updatedBy = authUser._id;
            });
        }

        // Initialize
        let error, result;
        [error, result] = await To(FeatureService.createMultiple(features));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
            return Promise.resolve(result);
        } else {
            return Promise.reject(error);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.FEATURES.CREATE_MULTIPLE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejObject.appendMessage(e.message);
        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Get the list of all features
 * @param {*} params 
 * @param {*} query 
 */
async function getAll(params, query) {
    try {
        // Initialize
        let error, result;

        [error, result] = await To(FeatureService.getAll(params, query));
        if (CommonValidator.isSuccessResponse(result)) {
            return Promise.resolve(result);
        } else {
            return Promise.reject(error);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.FEATURES.GET_ALL.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Get the count of all features
 * @param {*} params 
 * @param {*} query 
 */
async function getAllCount(params, query) {
    try {
        // Initialize
        let error, result;

        [error, result] = await To(FeatureService.getAllCount(params, query));
        if (CommonValidator.isSuccessResponse(result)) {
            return Promise.resolve(result);
        } else {
            return Promise.reject(error);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.FEATURES.GET_ALL_COUNT.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Get one feature by id
 * @param {*} FeatureId 
 */
async function getOneById(featureId) {
    try {
        // Initialize
        let error, result;

        [error, result] = await To(FeatureService.getOneById(featureId));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
            return Promise.resolve(result);
        } else {
            return Promise.reject(error);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.FEATURES.GET_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Get one feature by code
 * @param {*} authUser 
 * @param {*} featureCode 
 * @param {*} params 
 * @param {*} flags 
 */
async function getOneByCode(featureCode) {
    try {
        // Initialize
        let error, result;

        [error, result] = await To(FeatureService.getOneByCode(featureCode));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
            return Promise.resolve(result);
        } else {
            return Promise.reject(error);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.FEATURES.GET_ONE_BY_CODE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Search
 * @param {*} feature 
 * @param {*} params 
 * @param {*} flags 
 */
async function search(authUser, feature, params, flags) {
    try {
        // Initialize
        let error, result;

        [error, result] = await To(FeatureService.search(authUser, feature, params, flags));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
            return Promise.resolve(result);
        } else {
            return Promise.reject(error);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.FEATURES.SEARCH.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Update one tracker feature by id
 * @param {*} authUser 
 * @param {*} feature 
 * @param {*} params 
 * @param {*} flags 
 */
async function updateOneById(authUser, feature, params, flags) {
    try {
        if (authUser && CommonValidator.isValidMongoObjectId(authUser._id)) {
            feature.updatedBy = authUser._id;
        }

        // Initialize
        let error, result;

        //Do not want to update code
        if (feature.code) {
            delete feature.code;
        }

        [error, result] = await To(FeatureService.updateOneById(feature._id, feature));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
            return Promise.resolve(result);
        } else {
            return Promise.reject(error);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.FEATURES.UPDATE_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Delete one feature by id
 * @param {*} authUser 
 * @param {*} featureId 
 * @param {*} params 
 * @param {*} flags 
 */
async function deleteOneById(authUser, featureId, params, flags) {
    try {
        // Initialize
        let error, result;

        // Delete feature
        [error, result] = await To(FeatureService.deleteOneById(featureId));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
            return Promise.resolve(result);
        } else {
            return Promise.reject(error);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.FEATURES.DELETE_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        return Promise.reject(rejObject.jsonObject());
    }
}