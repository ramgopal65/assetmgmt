module.exports = {
    getOneById: getOneById,
    getOneByCode: getOneByCode,
    getAll: getAll,
    applicationLogin: applicationLogin
};

// Imports
const To = require('../../../common/to/to');
//TODO: change to app-error. review error handling
const CommonValidator = require('../../../common/validate/validator');
const ApplicationHelper = require('../helpers/application');
const Constants = require('../../constant/constant');
const RejectData = require('../../../common/response/reject-data');
const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');
const CommonSettingsKeys = require('../../../common/setting/keys');
const CommonConstants = require('../../../common/constant/constant');

/**
 * Get one application by id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function getOneById(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;

        req.params;
        if (req.params._id && CommonValidator.isValidMongoObjectId(req.params._id)) {
            // Get
            [error, result] = await To(ApplicationHelper.getOneById(req.params._id));
            req.trace.response = error || result;
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.APPLICATIONS.GET_ONE_BY_ID.ERROR,
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
            Constants.BOOTSTRAP.APPLICATIONS.GET_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * Get one application by code
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function getOneByCode(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;

        // req.params = JSON.parse(req.params);
        req.params;
        if (req.params.code) {
            // Get
            [error, result] = await To(ApplicationHelper.getOneByCode(req.params.code));
            req.trace.response = error || result;
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.BOOTSTRAP.APPLICATIONS.GET_ONE_BY_CODE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            var msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.params.code');
            req.trace.response = rejectObject.jsonObject(); 
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.GET_ONE_BY_CODE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * Get the list of all applications
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function getAll(req, res, next) {
    try {
        //#region preparesortselectforget - from params for get methods, from body for post methods. body overrides
        //This is get
        //Do the necessary uri decoding for req.param and req.query. not needed for req.body
        if (CommonValidator.isVaildAndNonEmptyObject(req.param.sort)) {
            req.params.sort = JSON.parse(req.params.sort);
            //console.log('sort from param - ' + req.param.sort);
        } else {
            let defaultSort = {};
            if (CommonValidator.isVaildAndNonEmptyObject(SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.SORT_ORDER.DEFAULT))) {
                defaultSort = SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.SORT_ORDER.DEFAULT);
            } else {
                defaultSort = CommonConstants.COMMON.APP_DB.SORT_ORDER.DEFAULT;
            }
            req.params.sort = defaultSort;
            //console.log('sort from default - ' + req.params.sort);
        }

        if (CommonValidator.isVaildAndNonEmptyObject(req.param.select)) {
            req.params.select = JSON.parse(req.params.select);
            //console.log('select from param - ' + req.param.select);
        } else {
            let defaultSelect = {};
            if (CommonValidator.isVaildAndNonEmptyObject(SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.SORT_ORDER.DEFAULT))) {
                defaultSelect = SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.SORT_ORDER.DEFAULT);
            } else {
                defaultSelect = CommonConstants.COMMON.APP_DB.SORT_ORDER.DEFAULT;
            }
            req.params.select = defaultSelect;
            //console.log('select from default - ' + req.params.select);
        }
        //#endregion preparesortselect

        //#region skiplimitfromquery
        if (CommonValidator.isValidDBQueryObject(req.query)) {
            req.query.skip = parseInt(JSON.parse(req.query.skip));
            req.query.limit = parseInt(JSON.parse(req.query.limit));

        } else {
            if (CommonValidator.isIntegerAndPositive(SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.SKIP.DEFAULT))) {
                req.query.skip = SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.SKIP.DEFAULT);
            } else {
                req.query.skip = CommonConstants.COMMON.APP_DB.FETCH_ALL.SKIP.DEFAULT;
            }
            if (CommonValidator.isIntegerAndPositive(SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.LIMIT.DEFAULT))) {
                req.query.limit = SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.LIMIT.DEFAULT);
            } else {
                req.query.limit = CommonConstants.COMMON.APP_DB.FETCH_ALL.LIMIT.DEFAULT;
            }
        }
        //#endregion skiplimitfromquery
        //console.log('skip - ' + req.query.skip);
        //console.log('limit - ' + req.query.limit);

        // Initialize
        let error, result;

        // Get all
        [error, result] = await To(ApplicationHelper.getAll(req.params, req.query));
        req.trace.response = error || result;
        next();
    } catch (e) {
        var rejObj = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.GET_ALL.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        req.trace.response = rejObj.jsonObject();
        next();
    }
}

/**
* Server login
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
async function applicationLogin(req, res, next) {
    try {
        // Initialize
        let error, result;
        let msg = Constants.BOOTSTRAP.APPLICATIONS.GET_ONE_BY_CODE.ERROR;
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.UNKNOWN.CODE,
            msg,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            null);

        // Validate
        if (!CommonValidator.isVaildAndNonEmptyObject(req.body) || (!req.body.code)) {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.BAD_REQUEST.CODE);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING + 'req.body.code');
            req.trace.response = rejectObject.jsonObject();
            next();
        }

        [error, result] = await To(ApplicationHelper.applicationLogin(req.body));
        req.trace.response = error || result;

        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
            // TODO: for audit
            if (!req.audit) {
                req.audit = {};
            }
            if (!req.audit.request) {
                req.audit.request = {};
            }
            req.audit.request.actionPerformedByApplication = result.data._id;
            req.trace.response.login = true;
        }
        next();
    } catch (e) {
        var rejObj = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.APPLICATIONS.APPLICATION_LOGIN.ERROR + req.body.code,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        req.trace.response = rejObj.jsonObject();
        next();
    }
}