module.exports = {
    createOne: createOne,
    startPostSession: startPostSession,
    updateGameVideoById: updateGameVideoById,
    searchCount: searchCount,
    search: search,
    getPostContent: getPostContent,
    usageReport: usageReport,
    usageCount: usageCount,
    updateReviewSelectionById: updateReviewSelectionById,
    updateFavById: updateFavById,
    deleteOneById: deleteOneById,
    endPostSession: endPostSession
};

const RejectData = require('../../../common/response/reject-data');
const To = require('../../../common/to/to');
const CommonValidator = require('../../../common/validate/validator');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const PostHelper = require('../helpers/post');
const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');
const CommonSettingsKeys = require('../../../common/setting/keys');
const CustomConstants = require('../../custom/badminton/constant/custom-constant');

/**
* createOne
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
async function createOne(req, res, next) {
    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.POST.CREATE_ONE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);
    try {
        // Initialize

        let error, result;
        if (!req.query.type ||
            !Object.values(Constants.ASSETMGMT.POST.TYPES.find(obj => { return obj.CODE === 'game-review'; }).SUBTYPES.map(type => type.CODE).includes(req.query.type))
        ) {
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.query.type');
            req.trace.response = rejectObject.jsonObject();
        } else {
            if (req.query.type == 'game') {
                if (req.headers.streamsize && req.headers.filename) {
                    [error, result] = await To(PostHelper.createOneWithVideo(
                        req,
                        req.trace.caller,
                        req.headers.streamsize,
                        req.headers.filename,
                        req.flags,
                    ));
                } else {
                    [error, result] = await To(PostHelper.startPostSession(
                        req.trace.caller,
                        req.flags
                    ));

                }
                req.trace.response = error || result;
            } else if (req.query.type == 'review') {
                if (!req.query.gamePost || !CommonValidator.isValidMongoObjectId(req.query.gamePost)) {
                    rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
                    rejectObject.appendMessage('req.query.gamePost');
                    req.trace.response = rejectObject.jsonObject();
                } else {

                    if (req.headers.streamsize && req.headers.filename && req.headers.reviewindex) {
                        let reviewIndex;
                        if (req.headers.reviewindex) {
                            let b64EncodedIndex = req.headers.reviewindex;
                            let jsonStrIndex = Buffer.from(b64EncodedIndex, 'base64').toString('utf8');

                            while ('string' === typeof (jsonStrIndex)) {
                                jsonStrIndex = (JSON.parse(jsonStrIndex));
                            }
                            //TODO1000 store as json instead of string
                            reviewIndex = JSON.stringify(jsonStrIndex);
                        }

                        [error, result] = await To(PostHelper.updateReviewPostById(
                            req,
                            req.trace.caller,
                            req.file,
                            req.query.gamePost,
                            req.headers.streamsize,
                            req.headers.filename,
                            req.flags,
                            reviewIndex
                        ));
                        req.trace.response = error || result;
                    } else {
                        rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_HEADER_MISSING);
                        rejectObject.appendMessage('req.headers.streamsize or req.headers.filename or req.headers.reviewindex');
                        req.trace.response = rejectObject.jsonObject();
                    }
                }
            } else {
                rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
                rejectObject.appendMessage('req.query.type');
                req.trace.response = rejectObject.jsonObject();
            }
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.CREATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
* createOne
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
async function updateGameVideoById(req, res, next) {
    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.POST.ADD_GAME_VIDEO_TO_POST_SESSION.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);
    try {
        // Initialize

        let token;
        if (req.headers.authorization) {
            var bearerArr = req.headers.authorization.split(' ');
            if (bearerArr && Array.isArray(bearerArr) && bearerArr.length == 2
                && (bearerArr[0] == 'bearer' || bearerArr[0] == 'Bearer')) {
                token = bearerArr[1];
            }
        }


        let error, result;
        if (!req.params.postId) {
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.params.postId');
            req.trace.response = rejectObject.jsonObject();
        } else if (!req.headers.streamsize) {
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.headers.streamsize');
            req.trace.response = rejectObject.jsonObject();
        } else if (!req.headers.filename) {
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.headers.filename');
            req.trace.response = rejectObject.jsonObject();
        } else if (!req.headers.cameraname) {
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.headers.cameraname');
            req.trace.response = rejectObject.jsonObject();
        } else if (!req.trace.post.session.allowedCameras.includes(req.headers.cameraname)) {
            rejectObject.setMessage(Constants.ASSETMGMT.POST.ADD_GAME_VIDEO_TO_POST_SESSION.ERROR_NOT_AUTHORIZED);
            rejectObject.appendMessage(req.headers.cameraname);
            req.trace.response = rejectObject.jsonObject();
        } else if (!(token ===  req.trace.post.session.token.token)) {
            rejectObject.setMessage(Constants.ASSETMGMT.POST.ADD_GAME_VIDEO_TO_POST_SESSION.ERROR_NOT_AUTHORIZED);
            req.trace.response = rejectObject.jsonObject();
        } else {
            [error, result] = await To(PostHelper.updateGameVideoById(
                req,
                req.trace.caller,
                req.trace.post,
                req.headers.streamsize,
                req.headers.filename,
                req.headers.cameraname,
                req.flags,
            ));
            req.trace.response = error || result;

        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.ADD_GAME_VIDEO_TO_POST_SESSION.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}



/**
* startPostSession
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
async function startPostSession(req, res, next) {
    let rejectObject;
    try {
        // Initialize
        let error, result;

        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.ASSETMGMT.POST.START_ONE_POST_SESSION.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);

        let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
        if (!req.body) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body');
            req.trace.response = rejectObject.jsonObject();
        } else if (!req.body.academyName) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.academyName');
            req.trace.response = rejectObject.jsonObject();
        } else if (!req.body.courtName) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.courtName');
            req.trace.response = rejectObject.jsonObject();
        } else {
            let sessionName;
            if (req.body.sessionName) {
                sessionName = req.body.sessionName;
            } else {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Decem'
                ];
                const d = new Date();
                sessionName = 'game@' + d.getDate() + monthNames[d.getMonth()];
            }
            [error, result] = await To(PostHelper.startPostSession(req.trace.caller, 
                req.body.academyName,
                req.body.courtName,
                sessionName,
                req.flags));
            req.trace.response = error || result;
        }
        next();

    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.START_ONE_POST_SESSION.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

async function getPostContent(req, res, next) {
    var rejectObject;
    try {
        // Initialize
        let error, result;

        //Get the profile pic from file server
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);

        if (!CommonValidator.isValidMongoObjectId(req.params.postId)) {
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.params.postId');
            req.trace.response = rejectObject.jsonObject();
            next();
        } else if (!Object.values(Constants.ASSETMGMT.POST.TYPES.find(obj => { return obj.CODE === 'game-review'; }).SUBTYPES.map(type => type.CODE).includes(req.query.type))) {
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.query.type');
            req.trace.response = rejectObject.jsonObject();
            next();
        } else {
            [error, result] = await To(PostHelper.getPostContent(req.params.postId, req.query.type, req.query.file));
            req.trace.response = error || result;
            next();
        }
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
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
        let condition = {};
        if (req.trace.caller.role === CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.PLAYER) {
            if (req.body.condition && CommonValidator.isValidObject(req.body.condition)) {
                condition = req.body.condition;
                condition.posters = [req.trace.caller._id];
            } else {
                condition.posters = [req.trace.caller._id];
            }
        } else if (req.trace.caller.role === CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.COACH) {
            if (req.body.condition && CommonValidator.isValidObject(req.body.condition)) {
                condition = req.body.condition;
                req.body.condition.posters = req.trace.caller.roleAssociation.associates;
            } else {
                req.body.condition.posters = req.trace.caller.roleAssociation.associates;
            }
        } else if (req.trace.caller.role === CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.REVIEWER) {
            if (req.body.condition && CommonValidator.isValidObject(req.body.condition)) {
                condition = req.body.condition;
            }
        }
        else {
            //TODO - cleanup
            let rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.ASSETMGMT.POST.SEARCH.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
                null);
            req.trace.response = rejectObject.jsonObject();
            next();
            //TODO after this next() statements remain for execution - avoid this
        }
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
        [error, result] = await To(PostHelper.search(searchData));
        req.trace.response = error || result;
        next();
    } catch (e) {
        let rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.SEARCH.ERROR,
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
        let error, result, searchData;

        if (req.trace.caller.role === CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.PLAYER) {
            if (req.body.condition && CommonValidator.isValidObject(req.body.condition)) {
                req.body.condition.posters = [req.trace.caller._id];
                searchData = {
                    condition: req.body.condition
                };

            } else {
                searchData = {
                    condition: { posters: [req.trace.caller._id] }
                };
            }
            // Search
            [error, result] = await To(PostHelper.searchCount(searchData));
            req.trace.response = error || result;
            next();
        } else if (req.trace.caller.role === CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.COACH) {
            if (req.body.condition && CommonValidator.isValidObject(req.body.condition)) {
                req.body.condition.posters = req.trace.caller.roleAssociation.associates;
                searchData = {
                    condition: req.body.condition
                };
            } else {
                searchData = {
                    condition: { posters: req.trace.caller.roleAssociation.associates }
                };
            }
            // Search
            [error, result] = await To(PostHelper.searchCount(searchData));
            req.trace.response = error || result;
            next();
        } else if (req.trace.caller.role === CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.REVIEWER) {
            if (req.body.condition && CommonValidator.isValidObject(req.body.condition)) {
                searchData = {
                    condition: req.body.condition
                };
            } else {
                searchData = {
                    condition: {}
                };

            }
            // Search
            [error, result] = await To(PostHelper.searchCount(searchData));
            req.trace.response = error || result;
            next();
        }
        else {
            //TODO - cleanup
            let rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.ASSETMGMT.POST.SEARCH_COUNT.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
                null);
            req.trace.response = rejectObject.jsonObject();
            next();
        }
    } catch (e) {
        let rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.SEARCH_COUNT.ERROR + ' - ' + e.message,
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
async function usageReport(req, res, next) {
    try {
        //condidion is mandatory(at the least empty json must be supplied)
        //sort, select, skip and limit are not(they will use default values when not populated by caller)
        let condition = {};
        if (req.trace.caller.role === CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.PLAYER) {
            if (req.body.condition && CommonValidator.isValidObject(req.body.condition)) {
                condition = req.body.condition;
                condition.posters = [req.trace.caller._id];
            } else {
                condition.posters = [req.trace.caller._id];
            }
        } else {
            //TODO - cleanup
            let rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.ASSETMGMT.POST.USAGE_REPORT.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
                null);
            req.trace.response = rejectObject.jsonObject();
            next();
            //TODO after this next() statements remain for execution - avoid this
        }
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
        [error, result] = await To(PostHelper.usageReport(searchData));
        req.trace.response = error || result;
        next();
    } catch (e) {
        let rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.USAGE_REPORT.ERROR,
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
async function usageCount(req, res, next) {
    try {
        // Initialize
        let error, result, searchData;

        if (req.trace.caller.role === CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.PLAYER) {
            if (req.body.condition && CommonValidator.isValidObject(req.body.condition)) {
                req.body.condition.posters = [req.trace.caller._id];
                searchData = {
                    condition: req.body.condition
                };

            } else {
                searchData = {
                    condition: { posters: [req.trace.caller._id] }
                };
            }
            // Search
            [error, result] = await To(PostHelper.usageCount(searchData));
            req.trace.response = error || result;
            next();
        } else {
            //TODO - cleanup
            let rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.ASSETMGMT.POST.USAGE_COUNT.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
                null);
            req.trace.response = rejectObject.jsonObject();
            next();
        }
    } catch (e) {
        let rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.USAGE_COUNT.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}


/**
* updateOne
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
async function updateReviewSelectionById(req, res, next) {
    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);
    try {
        // Initialize

        let error, result;
        if (!req.params.postId || !CommonValidator.isValidMongoObjectId(req.params.postId)) {
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.params.postId');
            req.trace.response = rejectObject.jsonObject();
        } else if (!CommonValidator.isNonEmptyObject(req.body)) {
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.body');
            req.trace.response = rejectObject.jsonObject();
        } else {
            let jsonStrIndex, reviewIndex;
            if (req.body) {
                //TODO1000 store as json instead of string
                reviewIndex = JSON.stringify(req.body);
            }
            [error, result] = await To(PostHelper.updateReviewSelectionById(req.trace.caller, req.params.postId, reviewIndex, null));
            req.trace.response = error || result;
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
* updateFav
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
async function updateFavById(req, res, next) {
    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    try {
        // Initialize

        let error, result;
        if (!req.params.postId || !CommonValidator.isValidMongoObjectId(req.params.postId)) {
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.params.postId');
            req.trace.response = rejectObject.jsonObject();
        } else if (!req.params.favValue || !((req.params.favValue === 'true') || (req.params.favValue === 'false'))) {
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.params.favValue');
            req.trace.response = rejectObject.jsonObject();
        } else {
            let favValue;
            if (req.params.favValue === 'true') {
                favValue = true;
            } else if (req.params.favValue === 'false') {
                favValue = false;
            }
            [error, result] = await To(PostHelper.updateFavById(req.trace.caller, req.params.postId, favValue, null));
            req.trace.response = error || result;
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
* Delete one post by id
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
async function deleteOneById(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;


        if (req.params.postId && CommonValidator.isValidMongoObjectId(req.params.postId)) {
            // Update
            [error, result] = await To(PostHelper.deleteOneById(req.trace.caller, req.params.postId));
            req.trace.response = error || result;
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.POST.DELETE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.params.postId');
            req.trace.response = rejectObject.jsonObject();
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.DELETE_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
* Delete post session by id
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
async function endPostSession(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;


        if (req.params.postId && CommonValidator.isValidMongoObjectId(req.params.postId)) {
            // Update
            [error, result] = await To(PostHelper.endPostSession(req.trace.caller, req.params.postId, req.flags));
            req.trace.response = error || result;
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.POST.END_ONE_POST_SESSION.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.params.postId');
            req.trace.response = rejectObject.jsonObject();
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.END_ONE_POST_SESSION.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}