module.exports = {
    generateOtpForRegistration: generateOtpForRegistration,
    generateOtpForLogin: generateOtpForLogin,
    register: register,
    registerAndLogin: registerAndLogin,
    login: login,
    logout: logout,
    refreshToken: refreshToken,
    createOne: createOne,
    getOneById: getOneById,
    searchCount: searchCount,
    search: search,
    updateOneById: updateOneById,
    updateProfilePic: updateProfilePic,
    deleteOneById: deleteOneById,
    deleteMultipleById: deleteMultipleById,
    getProfilePic: getProfilePic,
    buyCredit: buyCredit
};

const RejectData = require('../../../common/response/reject-data');
const To = require('../../../common/to/to');
const CommonValidator = require('../../../common/validate/validator');
const Validator = require('../../validate/validator');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const UserHelper = require('../helpers/user');
const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');
const CommonSettingsKeys = require('../../../common/setting/keys');

/**
 * generate Otp for registration
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function generateOtpForRegistration(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;
        var msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.ASSETMGMT.USER.OTP.ERROR_GEN,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);

        if (!((req.body.phone && CommonValidator.isValidPhone(req.body.phone)) ||
            (req.body.email && CommonValidator.isValidEmail(req.body.email)))) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.phone or req.body.email');
            req.trace.response = rejectObject.jsonObject();
        } else {
            [error, result] = await To(UserHelper.generateOtpAndCreateOne(req.body));
            req.trace.response = error || result;
        }
        next();

    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.OTP.ERROR_GEN,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * generate Otp for login
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function generateOtpForLogin(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;
        var msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.ASSETMGMT.USER.OTP.ERROR_GEN,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);

        if (!((req.body.phone && CommonValidator.isValidPhone(req.body.phone)) ||
            (req.body.email && CommonValidator.isValidEmail(req.body.email)))) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.phone or req.body.email');
            req.trace.response = rejectObject.jsonObject();
        } else {
            [error, result] = await To(UserHelper.generateOtpAndUpdateOne(req.trace.subject));
            req.trace.response = error || result;
        }
        next();

    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.OTP.ERROR_GEN,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * buy credit
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function buyCredit(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.ASSETMGMT.USER.BUY_CREDIT.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);

        [error, result] = await To(UserHelper.buyCredit(req.trace.subject));
        req.trace.response = error || result;
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.BUY_CREDIT.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * register
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function register(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;
        var msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.ASSETMGMT.USER.REGISTER.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);

        if (!req.params._id || !CommonValidator.isValidMongoObjectId(req.params._id)) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.params._id');
            req.trace.response = rejectObject.jsonObject();
        } else if (!(req.body.otpToken.type && CommonValidator.isValidOTPType(req.body.otpToken.type))) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.otpToken.type');
            req.trace.response = rejectObject.jsonObject();
        } else if (!(req.body.otpToken.otp)) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.otpToken.otp');
            req.trace.response = rejectObject.jsonObject();
        } else if (req.body.phone && !CommonValidator.isValidPhone(req.body.phone)){
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.phone');
            req.trace.response = rejectObject.jsonObject();
        } else if (req.body.email && !CommonValidator.isValidEmail(req.body.email)) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.email');
            req.trace.response = rejectObject.jsonObject();
        } else {
            let user = {};
            if (req.body.phone) {
                user.phone = req.body.phone;
            }
            if (req.body.email) {
                user.email = {};
                user.email.email = req.body.email;
            }
            if (req.body.otpToken) {
                user.otpToken = req.body.otpToken;
            }
            if (req.body.password) {
                user.password = req.body.password;
            }
            if (req.body.profileData) {
                user.profileData = req.body.profileData;
            }
            if (req.body.coach) {
                user.coach = req.body.coach;
            }

            [error, result] = await To(UserHelper.checkOtpAndUpdateOne(req.trace.subject, user, req.body.flags));
            req.trace.response = error || result;
        }
        next();
    } catch (e) {

        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.REGISTER.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * login
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function login(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.ASSETMGMT.USER.LOGIN.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);
        var msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;

        if (!(req.body.password || req.body.otp)) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.password or req.body.otp');
            req.trace.response = rejectObject.jsonObject();
        } else {
            let user = {};
            if (req.body.phone) {
                user.identifier = {};
                user.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER;
                user.identifier.id = req.body.phone.cc + req.body.phone.number;
            } else if (req.body.email) {
                user.identifier = {};
                user.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
                user.identifier.id = req.body.email;
            }

            if (req.body.password) {
                user.password = req.body.password;
            } else if (req.body.otp) {
                user.otp = req.body.otp;
            }
            error = result = null;
            [error, result] = await To(UserHelper.checkCredentialsGenerateTokenAndUpdateOne(req.trace.caller, user, req.body.flags));
            req.trace.response = error || result;
        }

        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.LOGIN.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}


/**
 * register
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function logout(req, res, next) {
    try {
        // Initialize
        let error, result;
        [error, result] = await To(UserHelper.checkUserBlacklistTokenAndUpdate(req.trace.caller, req.body.flags));
        req.trace.response = error || result;
        next();
    } catch (e) {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.LOGOUT.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * register
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function refreshToken(req, res, next) {
    try {
        // Initialize
        let error, result;
        [error, result] = await To(UserHelper.generateNewTokenAndBlacklistOldToken(req.trace.caller, req.body.flags));
        req.trace.response = error || result;
        next();
    } catch (e) {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.TOKEN_REFRESH.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
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
async function createOne(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;
        var msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;

        if (!req.body.phone && !req.body.email) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.phone and req.body.email');
            req.trace.response = rejectObject.jsonObject();
        } else if (req.body.phone && !CommonValidator.isValidPhone(req.body.phone)) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.phone');
            req.trace.response = rejectObject.jsonObject();
        } else if (req.body.email && !CommonValidator.isValidEmail(req.body.email)) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.email');
            req.trace.response = rejectObject.jsonObject();
        } else if (!req.body.profileData.name) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.profileData.name');
            req.trace.response = rejectObject.jsonObject();
        } else {
            let user = {};
            if (req.body.phone) {
                user.phone = req.body.phone;
            }
            if (req.body.email) {
                user.email = {};
                user.email.email = req.body.email;
            }
            if (req.body.role) {
                user.role = req.body.role;
            }
            if (req.body.password) {
                user.password = req.body.password;
            }
            if (req.body.profileData) {
                user.profileData = req.body.profileData;
            }

            //TODO - cleanup and make below generic
            if (req.body.coach) {
                user.coach = req.body.coach;
            }
            [error, result] = await To(UserHelper.createOne(req.trace.caller, user, req.body));
            req.trace.response = error || result;
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.CREATE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
* get one user by id
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
async function getOneById(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;

        if (req.trace.subject._id &&
            CommonValidator.isValidMongoObjectId(req.trace.subject._id)) {
            [error, result] = await To(UserHelper.getOneById(req.trace.subject._id, req.body.flags));
            req.trace.response = error || result;
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.GET_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.params._id');
            req.trace.response = rejectObject.jsonObject();
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.GET_ONE_BY_ID.ERROR,
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
            [error, result] = await To(UserHelper.search(searchData));
            req.trace.response = error || result;
        } else {
            let rejObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.SEARCH.ERROR_INVALID_CONDITION,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejObject.jsonObject();
        }

        next();
    } catch (e) {
        let rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.SEARCH.ERROR,
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
            [error, result] = await To(UserHelper.searchCount(searchData));
            req.trace.response = error || result;
        } else {
            let rejObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.SEARCH_COUNT.ERROR_INVALID_CONDITION,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejObject.jsonObject();
        }

        next();
    } catch (e) {
        let rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.SEARCH_COUNT.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
* get one user by id
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
async function updateOneById(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);
        if (!(req.trace.subject._id &&
            CommonValidator.isValidMongoObjectId(req.trace.subject._id))) {
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.params._id');
            req.trace.response = rejectObject.jsonObject();
        } else if (req.body._id || 
            req.body.identifier ||
            req.body.status ||
            req.body.role ||
            req.body.token ||
            req.body.password ||
            req.body.otpToken ||
            req.body.activityDetails ||
            req.body.createdBy ||
            req.body.updatedBy || 
            (req.body.profileData && req.body.profileData.membershipProfile)
        ) {
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_NOT_ALLOWED);
            req.trace.response = rejectObject.jsonObject();
        } else if (req.body.phone &&
            (req.trace.subject.identifier.type == CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER)) {
            rejectObject.appendMessage(Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR_PHONE_USED_AS_ID);
            req.trace.response = rejectObject.jsonObject();
        } else if (req.body.email &&
            (req.trace.subject.identifier.type == CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL)) {
            rejectObject.appendMessage(Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR_EMAIL_USED_AS_ID);
            req.trace.response = rejectObject.jsonObject();
        } else {
            [error, result] = await To(UserHelper.updateOneById(req.trace.caller._id, req.trace.subject._id, req.body, req.body.flags));
            req.trace.response = error || result;
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.GET_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}


/**
* Delete one user by id
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
async function deleteOneById(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;


        if (req.trace.subject._id &&
            CommonValidator.isValidMongoObjectId(req.trace.subject._id)) {

            // Update
            [error, result] = await To(UserHelper.deleteOneById(req.trace.subject));
            req.trace.response = error || result;
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.DELETE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.params._id');
            req.trace.response = rejectObject.jsonObject();
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.DELETE_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
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
            [error, result] = await To(UserHelper.deleteMultipleById(req.body._ids));
            req.trace.response = error || result;
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.DELETE_MULTIPLE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.body._ids');
            req.trace.response = rejectObject.jsonObject();
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.DELETE_MULTIPLE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}


async function getProfilePic(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;

        //Get the profile pic from file server
        [error, result] = await To(UserHelper.getProfilePic(req.trace.caller));
        req.trace.response = error || result;
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.GET_PROFILE_PIC.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function updateProfilePic(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;

        // Check if file exists in request
        if (!req.headers.streamsize) {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.UPDATE_PROFILE_PIC.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.headers.streamsize');
            req.trace.response = rejectObject.jsonObject();
        } else if (!req.headers.filename) {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.UPDATE_PROFILE_PIC.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID);
            rejectObject.appendMessage('req.headers.filename');
            req.trace.response = rejectObject.jsonObject();
        } else {
            [error, result] = await To(
                UserHelper.updateProfilePic(
                    req,
                    req.trace.caller,
                    req.headers.filename,
                    req.headers.streamsize,
                    req.body.flags
                ));
            req.trace.response = error || result;
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.UPDATE_PROFILE_PIC.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        req.trace.response = rejectObject.jsonObject();
        next();
    }

}

/**
 * register
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function registerAndLogin(req, res, next) {
    try {
        // Initialize
        let error, result;
        var rejectObject;
        var msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.ASSETMGMT.USER.REGISTER.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);

        if (!req.params._id || !CommonValidator.isValidMongoObjectId(req.params._id)) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.params._id');
            req.trace.response = rejectObject.jsonObject();
        } else if (!(req.body.otpToken.type && CommonValidator.isValidOTPType(req.body.otpToken.type))) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.otpToken.type');
            req.trace.response = rejectObject.jsonObject();
        } else if (!(req.body.otpToken.otp)) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.otpToken.otp');
            req.trace.response = rejectObject.jsonObject();
        } else if (req.body.phone && !CommonValidator.isValidPhone(req.body.phone)) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.phone');
            req.trace.response = rejectObject.jsonObject();
        } else if (req.body.email && !CommonValidator.isValidEmail(req.body.email)) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.email');
            req.trace.response = rejectObject.jsonObject();
        } else {
            let user = {};
            if (req.body.phone) {
                user.phone = req.body.phone;
            }
            if (req.body.email) {
                user.email = {};
                user.email.email = req.body.email;
            }
            if (req.body.otpToken) {
                user.otpToken = req.body.otpToken;
            }
            if (req.body.profileData) {
                user.profileData = req.body.profileData;
            }

            [error, result] = await To(UserHelper.checkOtpAndUpdateOneToLogin(req.trace.subject, req.trace.subject._id, user, req.body.flags));
            req.trace.response = error || result;
        }
        next();
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.REGISTER.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}