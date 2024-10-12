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
const TrackerModelService = require('../services/trackermodel');
const RejectData = require('../../../common/response/reject-data');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const CommonValidator = require('../../../common/validate/validator');

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
        let error, result;

        // Create
        [error, result] = await To(TrackerModelService.createOne(authUser, trackerModel, params, flags));
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
            Constants.ASSETMGMT.TRACKER_MODELS.CREATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
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

        [error, result] = await To(TrackerModelService.createMultiple(authUser, trackerModels, params, flags));
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
            Constants.ASSETMGMT.TRACKER_MODELS.CREATE_MULTIPLE.ERROR,
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

        [error, result] = await To(TrackerModelService.getAll(params, query));
        if (CommonValidator.isSuccessResponse(result)) {
            return Promise.resolve(result);
        } else {
            return Promise.reject(error);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.TRACKER_MODELS.GET_ALL.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Get the count of all trackermodels
 * @param {*} params 
 * @param {*} query 
 */
async function getAllCount(params, query) {
    try {
        // Initialize
        let error, result;

        [error, result] = await To(TrackerModelService.getAllCount(params, query));
        if (CommonValidator.isSuccessResponse(result)) {
            return Promise.resolve(result);
        } else {
            return Promise.reject(error);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.TRACKER_MODELS.GET_ALL_COUNT.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        return Promise.reject(rejObject.jsonObject());
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
        let error, result;

        [error, result] = await To(TrackerModelService.getOneById(authUser, trackerModelId, params, flags));
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
            Constants.ASSETMGMT.TRACKER_MODELS.GET_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
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
        let error, result;

        [error, result] = await To(TrackerModelService.getOneByCode(authUser, trackerModelCode, params, flags));
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
            Constants.ASSETMGMT.TRACKER_MODELS.GET_ONE_BY_CODE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
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
        let error, result;
        [error, result] = await To(TrackerModelService.search(authUser, trackerModel, params, flags));

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
            Constants.ASSETMGMT.TRACKER_MODELS.SEARCH.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
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
        let error, result;

        //Do not want to update code
        if (trackerModel.code && flags && flags.isUpdateCode) {
            // Nothing.
        } else {
            delete trackerModel.code;
        }

        [error, result] = await To(TrackerModelService.updateOneById(authUser, trackerModel, params, flags));
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
            Constants.ASSETMGMT.TRACKER_MODELS.UPDATE_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
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
        let error, result;

        [error, result] = await To(TrackerModelService.deleteOneById(authUser, trackerModelId, params, flags));
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
            Constants.ASSETMGMT.TRACKER_MODELS.DELETE_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
    }
}
