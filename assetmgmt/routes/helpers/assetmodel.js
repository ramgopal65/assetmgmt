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
const AssetModelService = require('../services/assetmodel');
const RejectData = require('../../../common/response/reject-data');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const CommonValidator = require('../../../common/validate/validator');

/**
 * Create one asset model
 * @param {*} authUser 
 * @param {*} assetModel 
 * @param {*} params 
 * @param {*} flags 
 */
async function createOne(authUser, assetModel, params, flags) {
    try {
        // Initialize
        let error, result;

        // Assign
        if (authUser && CommonValidator.isValidMongoObjectId(authUser.id)) {
            assetModel.createdBy = authUser.id;
        }

        // Create
        [error, result] = await To(AssetModelService.createOne(assetModel, params, flags));
        if (error) {
            return Promise.reject(error);
        }

        if (result && result.code == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE) {
            return Promise.resolve(result);
        } else {
            //This should never happen
            var rejectObject = new RejectData(result.code, result.message, CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN, result.data);
            return Promise.reject(rejectObject.jsonObject());
        }

    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.COMMON.ASSET_MODELS.CREATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Create multiple asset models
 * @param {*} authUser 
 * @param {*} assetModels 
 * @param {*} params 
 * @param {*} flags 
 */
async function createMultiple(authUser, assetModels, params, flags) {
    try {
        // Initialize
        let error, result;
        // Assign
        if (authUser && CommonValidator.isValidMongoObjectId(authUser._id)) {
            assetModels.forEach(function (assetModel) {
                assetModel.createdBy = authUser._id;
                assetModel.updatedBy = authUser._id;
            });
        }

        [error, result] = await To(AssetModelService.createMultiple(assetModels, params, flags));
        if (error) {
            return Promise.reject(error);
        }

        if (result && result.code == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE) {
            return Promise.resolve(result);
        } else {
            //This should never happen
            var rejectObject = new RejectData(result.code, result.message, CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN, result.data);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.COMMON.ASSET_MODELS.CREATE_MULTIPLE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

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

        [error, result] = await To(AssetModelService.getAll(params, query));
        if (CommonValidator.isSuccessResponse(result)) {
            return Promise.resolve(result);
        } else {
            return Promise.reject(error);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.ASSET_MODELS.GET_ALL.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        return Promise.reject(rejObject.jsonObject());
    }
}
/**
 * Get the count of all assetmodels
 * @param {*} params 
 * @param {*} query 
 */
async function getAllCount(params, query) {
    try {
        // Initialize
        let error, result;

        [error, result] = await To(AssetModelService.getAllCount(params, query));
        if (CommonValidator.isSuccessResponse(result)) {
            return Promise.resolve(result);
        } else {
            return Promise.reject(error);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.ASSET_MODELS.GET_ALL_COUNT.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        return Promise.reject(rejObject.jsonObject());
    }
}
/**
 * Get one asset model by id
 * @param {*} authUser 
 * @param {*} assetModelId 
 * @param {*} params 
 * @param {*} flags 
 */
async function getOneById(authUser, assetModelId, params, flags) {
    try {
        // Initialize
        let error, result;

        [error, result] = await To(AssetModelService.getOneById(authUser, assetModelId, params, flags));
        if (error) {
            return Promise.reject(error);
        }

        if (result && result.code == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE) {
            return Promise.resolve(result);
        } else {
            //This should never happen
            var rejectObject = new RejectData(result.code, result.message, CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN, result.data);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.ASSET_MODELS.GET_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
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
        let error, result;

        [error, result] = await To(AssetModelService.getOneByCode(authUser, assetModelCode, params, flags));
        if (error) {
            return Promise.reject(error);
        }

        if (result && result.code == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE) {
            return Promise.resolve(result);
        } else {
            //This should never happen
            var rejectObject = new RejectData(result.code, result.message, CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN, result.data);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.ASSET_MODELS.GET_ONE_BY_CODE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
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
        let error, result;
        [error, result] = await To(AssetModelService.search(authUser, assetModel, params, flags));

        if (error) {
            return Promise.reject(error);
        }

        if (result && result.code == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE) {
            return Promise.resolve(result);
        } else {
            //This should never happen
            var rejectObject = new RejectData(result.code, result.message, CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN, result.data);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.COMMON.ASSET_MODELS.SEARCH.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
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
        let error, result;

        //Do not want to update code
        if (assetModel.code && flags && flags.isUpdateCode) {
            // Nothing.
        } else {
            delete assetModel.code;
        }

        [error, result] = await To(AssetModelService.updateOneById(authUser, assetModel, params, flags));
        if (error) {
            return Promise.reject(error);
        }

        if (result && result.code == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE) {
            return Promise.resolve(result);
        } else {
            //This should never happen
            var rejectObject = new RejectData(result.code, result.message, CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN, result.data);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.ASSET_MODELS.UPDATE_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
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
        let error, result;

        [error, result] = await To(AssetModelService.deleteOneById(authUser, assetModelId, params, flags));
        if (error) {
            return Promise.reject(error);
        }

        if (result && result.code == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE) {
            return Promise.resolve(result);
        } else {
            //This should never happen
            var rejectObject = new RejectData(result.code, result.message, CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN, result.data);
            return Promise.reject(rejectObject.jsonObject());
        }

    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.ASSET_MODELS.DELETE_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
    }
}
