module.exports = {
    create: create,
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
const To = require('../../../common/to/to');
const CommonValidator = require('../../../common/validate/validator');
const RejectData = require('../../../common/response/reject-data');
const Constants = require('../../constant/constant');
const SettingHelper = require('../helpers/setting');
const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');
const CommonSettingsKeys = require('../../../common/setting/keys');
const CommonConstants = require('../../../common/constant/constant');

/**
 * Create setting
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function create(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;
        //Check if array
        if (CommonValidator.isVaildAndNonEmptyArray(req.body)) {
            [error, result] = await To(SettingHelper.createMultiple(req.authUser, req.body));
            req.trace.response = error || result;
        } else if (CommonValidator.isVaildAndNonEmptyObject(req.body)) {
            [error, result] = await To(SettingHelper.createOne(req.authUser, req.body));
            req.trace.response = error || result;
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.CREATE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            var msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body');
            req.trace.response = rejectObject.jsonObject();
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.CREATE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * Get one by id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function getOneById(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;

        if (req.params._id && CommonValidator.isValidMongoObjectId(req.params._id)) {
            // Get
            [error, result] = await To(SettingHelper.getOneById(req.params._id));
            req.trace.response = error || result;
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.GET_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            var msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.params._id');
            req.trace.response = rejectObject.jsonObject();
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.GET_ONE_BY_ID.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}
/**
 * Get one by full qualifier
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function getOne(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;

        if (req.params.applicationCode && (req.params.applicationCode != '') &&
            req.params.categoryCode && (req.params.categoryCode != '') &&
            req.params.property && (req.params.property != '')
        ) {
            // Get
            [error, result] = await To(SettingHelper.getOne(req.params.applicationCode, req.params.categoryCode, req.params.property));
            req.trace.response = error || result;
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.GET_ONE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            var msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.params.applicationCode or req.params.categoryCode or req.params.property');
            req.trace.response = rejectObject.jsonObject();
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.GET_ONE.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * Get all settings
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function getAll(req, res, next) {
    try {
        //#region preparesortselectforget - from params for get methods, from body for post methods. body overrides
        //This is get
        //Do the necessary uri decoding for req.params and req.query. not needed for req.body
        let sort = {};
        let select = '';

        if (req.params && req.params.sort && CommonValidator.isNonEmptyAndValidJsonString(req.params.sort) && CommonValidator.isVaildAndNonEmptyObject(JSON.parse(req.params.sort))) {
            sort = JSON.parse(req.params.sort);
        } else {
            if (CommonValidator.isValidObject(SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.SORT_ORDER.DEFAULT))) {
                sort = SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.SORT_ORDER.DEFAULT);
            } else {
                sort = CommonConstants.COMMON.APP_DB.SORT_ORDER.DEFAULT;
            }
        }

        if (req.params.select) {
            select = req.params.select;
        }
        //#endregion preparesortselect

        //#region skiplimitfromquery
        let skip, limit;

        if (CommonValidator.isValidDBQueryObject(req.query)) {
            skip = parseInt(req.query.skip);
            limit = parseInt(req.query.limit);
        } else {
            if (CommonValidator.isIntegerAndPositive(SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.SKIP.DEFAULT))) {
                skip = SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.SKIP.DEFAULT);
            } else {
                skip = CommonConstants.COMMON.APP_DB.FETCH_ALL.SKIP.DEFAULT;
            }
            if (CommonValidator.isIntegerAndPositive(SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.LIMIT.DEFAULT))) {
                limit = SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.LIMIT.DEFAULT);
            } else {
                limit = CommonConstants.COMMON.APP_DB.FETCH_ALL.LIMIT.DEFAULT;
            }
        }
        //#endregion skiplimitfromquery

        let params = { sort: sort, select: select };
        let query = { skip: skip, limit: limit };

        // Initialize
        let error, result;
        var rejectObject;

        [error, result] = await To(SettingHelper.getAll(params, query));
        req.trace.response = error || result;
        next();
    } catch (e) {
        //console.log(e);
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.GET_ALL.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}
/**
 * Get all settings count
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function getAllCount(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;

        // Get all count
        [error, result] = await To(SettingHelper.getAllCount());
        req.trace.response = error || result;
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.GET_ALL_COUNT.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * Search
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function search(req, res, next) {
    try {
        //condidion is mandatory(at the least empty json must be supplied)
        //sort, select, skip and limit are not(they will use default values when not populated by caller)
        let condition;
        if (req.body.condition && CommonValidator.isVaildAndNonEmptyObject(req.body.condition)) {
            condition = req.body.condition;

            //#region preparesortselect - from params for get methods, from body for post methods
            //Do the necessary uri decoding for req.params and req.query. not needed for req.body
            let sort = {};
            let select = {};

            if (req.body && req.body.sort && CommonValidator.isVaildAndNonEmptyObject(req.body.sort)) {
                sort = req.body.sort;
            } else {
                if (CommonValidator.isValidObject(SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.SORT_ORDER.DEFAULT))) {
                    sort = SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.SORT_ORDER.DEFAULT);
                } else {
                    sort = CommonConstants.COMMON.APP_DB.SORT_ORDER.DEFAULT;
                }
            }

            if (req.body.select) {
                select = req.body.select;
            } else {
                if ((SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.SELECT.DEFAULT) === '') || (SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.SELECT.DEFAULT)) ) {
                    select = SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.SELECT.DEFAULT);
                } else {
                    select = CommonConstants.COMMON.APP_DB.SELECT.DEFAULT;
                }
            }
            //#endregion preparesortselect

            //#region skiplimitfromquery
            let skip, limit, skipLimitJson;
            if (CommonValidator.isIntegerAndPositive(req.body.skip)) {
                skip = parseInt(req.body.skip);
            }
            if (CommonValidator.isIntegerAndPositive(req.body.limit)) {
                limit = parseInt(req.body.limit);
            }
            skipLimitJson = { skip: skip, limit: limit };

            if (!CommonValidator.isValidDBQueryObject(skipLimitJson)) {
                if (CommonValidator.isIntegerAndPositive(SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.SKIP.DEFAULT))) {
                    skip = SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.SKIP.DEFAULT);
                } else {
                    skip = CommonConstants.COMMON.APP_DB.FETCH_ALL.SKIP.DEFAULT;
                }
                if (CommonValidator.isIntegerAndPositive(SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.LIMIT.DEFAULT))) {
                    limit = SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.LIMIT.DEFAULT);
                } else {
                    limit = CommonConstants.COMMON.APP_DB.FETCH_ALL.LIMIT.DEFAULT;
                }
                skipLimitJson = { skip: skip, limit: limit };
            }
            //#endregion skiplimitfromquery

            let searchData = {
                skip: skip,
                limit: limit,
                sort: sort,
                select: select,
                condition: condition
            };

            // Initialize
            let error, result;
            [error, result] = await To(SettingHelper.search(searchData));
            req.trace.response = error || result;
        } else {
            let rejObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.SEARCH.ERROR_INVALID_CONDITION,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejObject.jsonObject();
        }

        next();
    } catch (e) {
        let rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.SEARCH.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}
/**
 * Search count
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function searchCount(req, res, next) {
    try {
        // Initialize
        let error, result;

        //condidion is mandatory(at the least empty json must be supplied)
        if (req.body.condition && CommonValidator.isValidObject(req.body.condition)) {

            let searchData = {
                condition: req.body.condition
            };

            // Search
            [error, result] = await To(SettingHelper.searchCount(searchData));
            req.trace.response = error || result;
        } else {
            let rejObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.SEARCH_COUNT.ERROR_INVALID_CONDITION,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejObject.jsonObject();
        }

        next();
    } catch (e) {
        let rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.SEARCH_COUNT.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * Update one setting by id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function updateOneById(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;

        if (req.params._id &&
            CommonValidator.isValidMongoObjectId(req.params._id) && 
            req.body &&
            CommonValidator.isVaildAndNonEmptyObject(req.body)) {
            // Update
            [error, result] = await To(SettingHelper.updateOneById(req.authUser, req.params._id, req.body));
            req.trace.response = error || result;
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.UPDATE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            var msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body or req.params._id');
            req.trace.response = rejectObject.jsonObject();
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.UPDATE_ONE_BY_ID.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * Delete one setting by id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function deleteOneById(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;
        if (req.params._id &&
            CommonValidator.isValidMongoObjectId(req.params._id)) {

            // Update
            [error, result] = await To(SettingHelper.deleteOneById(req.params._id));
            req.trace.response = error || result;
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.DELETE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            var msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.params._id');
            req.trace.response = rejectObject.jsonObject();
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.DELETE_ONE_BY_ID.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * Delete multiple settings by id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function deleteMultipleById(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;

        if (req.body._ids && CommonValidator.isVaildAndNonEmptyArray(req.body._ids)) {
            // Delete
            [error, result] = await To(SettingHelper.deleteMultipleById(req.body._ids));
            req.trace.response = error || result;
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.SETTINGS.DELETE_MULTIPLE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            var msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body_ids');
            req.trace.response = rejectObject.jsonObject();
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.DELETE_MULTIPLE_BY_ID.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}
