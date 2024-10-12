module.exports = {
    createOne: createOne,
    createMultiple: createMultiple,
    getOneById: getOneById,
    getOne: getOne,
    getAll: getAll,
    getAllCount: getAllCount,
    search: search,
    searchCount: searchCount,
    updateOneById: updateOneById,
    deleteOneById: deleteOneById,
    deleteMultipleById: deleteMultipleById
};

// Imports
const Mongoose = require('mongoose');
const ResolveData = require('../../../common/response/resolve-data');
const RejectData = require('../../../common/response/reject-data');
const CommonValidator = require('../../../common/validate/validator');
const To = require('../../../common/to/to');
const Constants = require('../../constant/constant');
const CommonConstants = require('../../../common/constant/constant');
const SettingModel = require('../models/setting');


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
 * Create one setting
 * @param {*} setting 
 */
async function createOne(setting) {

    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.BOOTSTRAP.SETTINGS.CREATE_ONE.SUCCESS,
            null
        );

        // Create
        [error, result] = await To(SettingModel(setting).save());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.SETTINGS.CREATE_ONE.ERROR));
        }
        if (CommonValidator.isNonEmptyObject(result) && CommonValidator.isValidMongoObjectId(result._id)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.BOOTSTRAP.SETTINGS.CREATE_ONE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.SETTINGS.CREATE_ONE.ERROR));
    }
}

/**
 * Create multiple setting
 * @param {*} settings 
 */
async function createMultiple(settings) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.BOOTSTRAP.SETTINGS.CREATE_MULTIPLE.SUCCESS,
            null
        );

        //console.dir(settings);
        // Create
        [error, result] = await To(SettingModel.insertMany(settings, { options: { ordered: false, rawResult: false } }));
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.SETTINGS.CREATE_MULTIPLE.ERROR));
        }
        if (settings.length == result.length) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.BOOTSTRAP.SETTINGS.CREATE_MULTIPLE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());

        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.SETTINGS.CREATE_MULTIPLE.ERROR));
    }
}

/**
 * Get one setting by id
 * @param {*} settingId 
 */
async function getOneById(settingId) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.BOOTSTRAP.SETTINGS.GET_ONE_BY_ID.SUCCESS,
            null
        );

        // Get
        [error, result] = await To(SettingModel.findById(settingId).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.SETTINGS.GET_ONE_BY_ID.ERROR));
        }

        // Response
        if (result && (settingId == result._id)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.GET_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.SETTINGS.GET_ONE_BY_ID.ERROR));
    }
}

/**
 * Get one setting by property
 * @param {*} app id 
 * @param {*} catefory id 
 * @param {*} property 
 */
async function getOne(app, cat, prop) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.BOOTSTRAP.SETTINGS.GET_ONE.SUCCESS,
            null
        );

        // Get
        [error, result] = await To(SettingModel.findOne({ applicationCode: app, categoryCode: cat, property: prop }).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.SETTINGS.GET_ONE.ERROR));
        }

        // Response
        if (result && (result.applicationCode == app) && (result.categoryCode == cat) && (result.property == prop)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.GET_ONE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.SETTINGS.GET_ONE.ERROR));
    }
}

/**
 * Get all settings
 * @param {*} params 
 * @param {*} query 
 */
async function getAll(params, query) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.BOOTSTRAP.SETTINGS.GET_ALL.SUCCESS,
            null
        );

        // Get all
        [error, result] = await To(SettingModel.find().sort(params.sort).select(params.select).skip(query.skip).limit(query.limit).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.SETTINGS.GET_ALL.ERROR));
        }
        // Response
        if (result) {
            if (!CommonValidator.isNonEmptyArray(result)) {
                resolveObject.appendMessage(Constants.BOOTSTRAP.SETTINGS.GET_ALL.SUCCESS_NO_DATA);
            }
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.GET_ALL.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }

    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.SETTINGS.GET_ALL.ERROR));
    }
}

//TODO: fetch count and items parallely
/**
 * Get all settings count
 */
async function getAllCount() {
    try {
        // Initialize
        let error, count;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.BOOTSTRAP.SETTINGS.GET_ALL.SUCCESS,
            null
        );

        // Get all
        [error, count] = await To(SettingModel.estimatedDocumentCount().exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.SETTINGS.GET_ALL_COUNT.ERROR));
        }
        // Response
        //count = 0 is success; build it to avoid failures for truth checks
        if ((count != null) && (count >= 0)) {
            resolveObject.setData({ count: count });
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.GET_ALL_COUNT.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.SETTINGS.GET_ALL_COUNT.ERROR));
    }
}

/**
 * Search
 * @param {*} setting 
 * @param {*} query 
 */
async function search(searchData) {
    // Initialize
    let dbQuery = {};
    let error, result;
    let sort, select;
    let skip, limit;
    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.BOOTSTRAP.SETTINGS.SEARCH.SUCCESS,
        null
    );

    try {
        //#region setdbquery 
        //TODO: make these regex based match
        if (searchData.condition._id) {
            dbQuery._id = searchData.condition._id;
        }
        if (Array.isArray(searchData.condition.applicationCode)) {
            dbQuery.applicationCode = { $in: searchData.condition.applicationCode };
        } else if (searchData.condition.applicationCode) {
            dbQuery.applicationCode = searchData.condition.applicationCode;
        }
        if (searchData.condition.applicationName) {
            dbQuery.applicationName = searchData.condition.applicationName;
        }
        if (searchData.condition.categoryCode) {
            dbQuery.categoryCode = searchData.condition.categoryCode;
        }
        if (searchData.condition.categoryName) {
            dbQuery.categoryName = searchData.condition.categoryName;
        }
        if (searchData.condition.property) {
            dbQuery.property = searchData.condition.property;
        }
        if (searchData.condition.value) {
            dbQuery.value = searchData.condition.value;
        }
        if (Object.keys(searchData.condition).includes('isEditable')) {
            dbQuery.isEditable = searchData.condition.isEditable;
        }
        //#endregion setdbquery

        sort = searchData.sort;
        select = searchData.select;
        skip = searchData.skip;
        limit = searchData.limit;

        // Search
        [error, result] = await To(SettingModel.find(dbQuery).select(select).sort(sort).skip(skip).limit(limit).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.SETTINGS.SEARCH.ERROR));
        }

        // Result
        if (result) {
            if (!CommonValidator.isNonEmptyArray(result)) {
                resolveObject.appendMessage(Constants.BOOTSTRAP.SETTINGS.SEARCH.SUCCESS_NO_DATA);
            }
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.SEARCH.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.SETTINGS.SEARCH.ERROR));
    }
}
/**
 * Search count
 * @param {*} setting 
 */
async function searchCount(searchData) {
    // Initialize
    let dbQuery = {};
    let error, count;
    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.BOOTSTRAP.SETTINGS.SEARCH_COUNT.SUCCESS,
        null
    );

    try {
        //#region setdbquery 
        //TODO: make these regex based match
        if (searchData.condition._id) {
            dbQuery._id = searchData.condition._id;
        }
        if (Array.isArray(searchData.condition.applicationCode)) {
            dbQuery.applicationCode = { $in: searchData.condition.applicationCode };
        } else if (searchData.condition.applicationCode) {
            dbQuery.applicationCode = searchData.condition.applicationCode;
        }
        if (searchData.condition.applicationName) {
            dbQuery.applicationName = searchData.condition.applicationName;
        }
        if (searchData.condition.categoryCode) {
            dbQuery.categoryCode = searchData.condition.categoryCode;
        }
        if (searchData.condition.categoryName) {
            dbQuery.categoryName = searchData.condition.categoryName;
        }
        if (searchData.condition.property) {
            dbQuery.property = searchData.condition.property;
        }
        if (searchData.condition.value) {
            dbQuery.value = searchData.condition.value;
        }
        if (Object.keys(searchData.condition).includes('isEditable')) {
            dbQuery.isEditable = searchData.condition.isEditable;
        }
        //#endregion setdbquery

        // Search count
        [error, count] = await To(SettingModel.find(dbQuery).countDocuments().exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.SETTINGS.SEARCH_COUNT.ERROR));
        }
        if ((count != null) && (count >= 0)) {
            resolveObject.setData({ count: count });
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.SEARCH_COUNT.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
        // Result

    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.SETTINGS.SEARCH_COUNT.ERROR));
    }
}

/**
 * Update one setting by id
 * @param {*} setting 
 */
async function updateOneById(settingId, setting) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.BOOTSTRAP.SETTINGS.UPDATE_ONE_BY_ID.SUCCESS,
            null
        );

        // Assign
        let updateObj = setting;
        // Update
        //Correct this
        [error, result] = await To(SettingModel.findByIdAndUpdate(settingId, updateObj, { new: true }).exec());

        // Response
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.SETTINGS.UPDATE_ONE_BY_ID.ERROR));
        }
        if (result && (result._id.equals(settingId))) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.UPDATE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.SETTINGS.UPDATE_ONE_BY_ID.ERROR));
    }
}

/**
 * Delete one setting by id
 * @param {*} settingId 
 */
async function deleteOneById(settingId) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.BOOTSTRAP.SETTINGS.DELETE_ONE_BY_ID.SUCCESS,
            null
        );

        // Delete
        [error, result] = await To(SettingModel.findByIdAndRemove(settingId).exec());

        // Response
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.SETTINGS.DELETE_ONE_BY_ID.ERROR));
        }

        if (result && (result._id.equals(settingId))) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.DELETE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.SETTINGS.DELETE_ONE_BY_ID.ERROR));
    }
}

/**
 * Delete multiple settings by id
 * @param {*} settingIds 
 */
async function deleteMultipleById(settingIds) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.BOOTSTRAP.SETTINGS.DELETE_MULTIPLE_BY_ID.SUCCESS,
            null
        );

        // Update
        [error, result] = await To(SettingModel.deleteMany({ _id: { $in: settingIds } }).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.SETTINGS.DELETE_MULTIPLE_BY_ID.ERROR));
        }
        if (result && (result.deletedCount == settingIds.length)) {
            // Response
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.DELETE_MULTIPLE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.BOOTSTRAP.SETTINGS.DELETE_MULTIPLE_BY_ID.ERROR));
    }
}