module.exports = {
    createOne: createOne,
    getOneTestimonialById: getOneTestimonialById,
    search: search
}

//Imports
const To = require('../../../common/to/to');
const TestimonialHelpers = require('../helpers/testimonial')
const RejectData = require('../../../common/response/reject-data');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const CommonValidator = require('../../../common/validate/validator');
const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');
const CommonSettingsKeys = require('../../../common/setting/keys');

async function createOne(req, res, next) {
    try {
        //Initiate
        let error, result, rejectObject;
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.ASSETMGMT.TESTIMONIAL.CREATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);

        let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;

        if (!req.body) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body');
            req.trace.response = rejectObject.jsonObject();
            next();
        } else if (!req.body.testimonialContent) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.testimonialContent');
            req.trace.response = rejectObject.jsonObject();
            next();
        } else {
            [error, result] = await To(TestimonialHelpers.createOne(req.body, req.trace.caller));
            req.trace.response = error || result;
            next();
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.TESTIMONIAL.CREATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}


async function getOneTestimonialById(req, res, next) {
    // Initialize
    let error, result;
    var rejectObject;
    try {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.ASSETMGMT.TESTIMONIAL.GET_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);

        if (!CommonValidator.isValidMongoObjectId(req.params.postId)) {
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.params.postId');
            req.trace.response = rejectObject.jsonObject();
            next();
        } else {
            [error, result] = await To(TestimonialHelpers.getOneTestimonialById(req.params.postId));
            req.trace.response = error || result;
            next();
        }
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.TESTIMONIAL.GET_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

async function search(req, res, next) {
    try {
        //condidion is mandatory(at least empty json must be supplied)
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
                if ((SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.SELECT.DEFAULT) === '') || (SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.SELECT.DEFAULT))) {
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
            [error, result] = await To(TestimonialHelpers.search(searchData));
            req.trace.response = error || result;
        } else {
            let rejObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.TESTIMONIAL.SEARCH.ERROR_INVALID_CONDITION,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejObject.jsonObject();
        }

        next();
    } catch (e) {
        let rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.TESTIMONIAL.SEARCH.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}