module.exports = {
    generateOtpAndCreateOne: generateOtpAndCreateOne,
    generateOtpAndUpdateOne: generateOtpAndUpdateOne,
    checkOtpAndUpdateOne: checkOtpAndUpdateOne,
    checkOtpAndUpdateOneToLogin: checkOtpAndUpdateOneToLogin,
    checkCredentialsGenerateTokenAndUpdateOne: checkCredentialsGenerateTokenAndUpdateOne,
    checkUserBlacklistTokenAndUpdate: checkUserBlacklistTokenAndUpdate,
    generateNewTokenAndBlacklistOldToken: generateNewTokenAndBlacklistOldToken,
    createOne: createOne,
    createSuperadmin: createSuperadmin,
    createSingleton: createSingleton,
    search: search,
    searchCount: searchCount,
    getOneById: getOneById,
    getOneByIdInternal: getOneByIdInternal,
    getOneByIdentifier: getOneByIdentifier,
    getOneByIdentifierInternal: getOneByIdentifierInternal,
    updateOneById: updateOneById,
    deleteOneById: deleteOneById,
    deleteMultipleById: deleteMultipleById,
    getProfilePic: getProfilePic,
    updateProfilePic: updateProfilePic,
    buyCredit: buyCredit,
};

const CommonValidator = require('../../../common/validate/validator');
const CommonConstants = require('../../../common/constant/constant');
const CommonJWTHelper = require('../../../common/jwt/helpers/jwt');
const To = require('../../../common/to/to');
const RandomUtil = require('../../../common/random/random');
const RejectData = require('../../../common/response/reject-data');
const Constants = require('../../constant/constant');
const UserService = require('../services/user');
const ResolveData = require('../../../common/response/resolve-data');
const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');
const SettingsKeysCommon = require('../../../common/setting/keys');
const SettingsKeysAssetMgmt = require('../../setting/keys');
const CommonUtil = require('../../../common/util/util');
const UserTokenBlacklistHelper = require('../helpers/usertokenblacklist');
require('dotenv').config();
const Config = require('../../config/config');

const { PassThrough } = require('stream');
const Util = require('util');
const Stream = require('stream');
const axios = require('axios');
const Finished = Util.promisify(Stream.finished);

const WhitelistHelper = require('./whitelist');

axios.interceptors.response.use(
    async (response) => {
        return response;
    },
    async (err) => {
        if (err.response) {
            if (err.response.headers.hasContentType('application/json') &&
                err.response.data instanceof Stream.Readable) {
                let data = '';

                await Finished(
                    err.response.data.on('data', (chunk) => {
                        data += chunk.toString();
                    })
                );
                err.response.data = JSON.parse(data);
                err.response.config.responseType = 'json';
            }
        }
        throw err;
    });
/**
* strip off irrelevant fields
* @param {*} user json
*/
async function stripOffFields(user, stripOffToken) {
    let includeAllFieldsInRestResponse = SettingsMap.get(SettingsKeysCommon.COMMON.TEST.INCLUDE_ALL_FIELDS_IN_REST_RESPONSE);

    let userClone = JSON.parse(JSON.stringify(user));

    if (!includeAllFieldsInRestResponse) {
        if (userClone.identifier) {
            delete userClone['identifier'];
        }
        if (userClone.phone) {
            delete userClone['phone'];
        }
        if (userClone.email) {
            delete userClone['email'];
        }
        if (userClone.role) {
            delete userClone['role'];
        }
        if (userClone.state) {
            delete userClone['state'];
        }
        if (userClone.activityDetails) {
            delete userClone['activityDetails'];
        }
        if (userClone.profileData) {
            delete userClone['profileData'];
        }
        if (stripOffToken) {
            if (userClone.token) {
                delete userClone['token'];
            }
        }
    }
    return stripOffUnnecessaryFields(userClone);
}

/**
* strip off unnecessary fields
* @param {*} user json
*/
async function stripOffUnnecessaryFields(user) {
    let userClone = JSON.parse(JSON.stringify(user));
    if (userClone.identifier && userClone.identifier._id) {
        delete userClone['identifier']['_id'];
    }
    let includeOtpInRestResponse = SettingsMap.get(SettingsKeysCommon.COMMON.TEST.INCLUDE_OTP_IN_REST_RESPONSE);
    if (CommonValidator.isValidOTPTokenObject(user.otpToken)) {
        if (user.otpToken.otp) {
            if (!includeOtpInRestResponse) {
                delete userClone.otpToken['otp'];
            }
        }
        if (user.otpToken._id) {
            delete userClone.otpToken['_id'];
        }
    } else {
        if (user.otpToken) {
            delete userClone.otpToken;
        }
    }
    if (userClone.phone && userClone.phone._id) {
        delete userClone['phone']['_id'];
    }
    if (userClone.email && userClone.email._id) {
        delete userClone['email']['_id'];
    }
    if (userClone.state && userClone.state._id) {
        delete userClone['state']['_id'];
    }
    if (userClone.token && userClone.token._id) {
        delete userClone['token']['_id'];
    }
    if (userClone.activityDetails && userClone.activityDetails._id) {
        delete userClone['activityDetails']['_id'];
    }
    if (userClone.profileData && userClone.profileData._id) {
        delete userClone['profileData']['_id'];
    }
    if (userClone.profileData && userClone.profileData.name && userClone.profileData.name._id) {
        delete userClone['profileData']['name']['_id'];
    }
    if (userClone.password) {
        delete userClone['password'];
    }
    if ((null == userClone.createdBy) || userClone.createdBy) {
        delete userClone['createdBy'];
    }
    if ((null == userClone.updatedBy) || userClone.updatedBy) {
        delete userClone['updatedBy'];
    }
    if (userClone.createdAt) {
        delete userClone['createdAt'];
    }
    if (userClone.updatedAt) {
        delete userClone['updatedAt'];
    }
    if ((userClone.__v == 0) || userClone.__v) {
        delete userClone['__v'];
    }
    return Promise.resolve(userClone);
}


function handleAxiosError(axiosError, message) {
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.UNKNOWN.CODE,
        message,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null);

    if (axiosError.response) {
        if (axiosError.response.data) {
            rejectObject.setCode(axiosError.response.data.code);
            rejectObject.appendMessage(axiosError.response.data.message);
            rejectObject.setType(axiosError.response.data.type);
        }
    } else if (axiosError.request) {
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
        rejectObject.appendMessage(axiosError.code);
        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
        rejectObject.setData(axiosError.request.cause);
    } else if (axiosError.message) {
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
        rejectObject.appendMessage(axiosError.message);
        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
    } else {
        //Nothing to do 
    }
    return rejectObject.jsonObject();
}


//SMS notification
async function sendSms(phone, tokenType, otp) {
    let error, result;
    let resolveObject;
    try {
        const notificationServerUrl = Config.NOTIFICATION.URL + Config.NOTIFICATION.SEND_SMS_LOCAL;
        [error, result] = await To(axios.post(
            notificationServerUrl, {
                phone: phone,
                type: tokenType,
                otp: otp
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        ));
        if (error) {
            throw new Error(error);
        }
        else {
            resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.USER.OTP.SUCCESS_SMS.MESSAGE,
                result
            );
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (error) {
        if (error.response) {
            console.log(error);
        } else if (error.request) {
            console.log(error);
        } else {
            console.log((error.message).toLowerCase());
        }
    }
}

//Email notification
async function sendEmail(email, tokenType, otp) {
    let error, result;
    let resolveObject;
    try {
        const notificationServerUrl = Config.NOTIFICATION.URL + Config.NOTIFICATION.SEND_EMAIL;
        [error, result] = await To(axios.post(
            notificationServerUrl, {
                email: email,
                type: tokenType,
                otp: otp
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        ));
        if (error) {
            throw new Error(error);
        } else {
            resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.USER.OTP.SUCCESS_EMAIL.MESSAGE,
                result
            );
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (error) {
        if (error.response) {
            console.log(error);
        } else if (error.request) {
            console.log(error);
        } else {
            console.log((error.message).toLowerCase());
        }
    }
}

/**
* generate otp and create one user
* @param {*} user json
*/
async function generateOtpAndCreateOne(user) {
    let error, result;
    //no flags for this
    let flags = {};
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.USER.OTP.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    var resolveObject;
    try {
        let existing = false;
        let existingUser;
        let otp;

        if (user.phone) {
            user.identifier = {};
            user.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER;
            user.identifier.id = user.phone.cc + user.phone.number;
        } else if (user.email) {
            user.identifier = {};
            user.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
            user.identifier.id = user.email;
        }

        //Check if  the user is already existing
        [error, result] = await To(UserService.getOneByIdentifier(user, flags));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
            existing = true;
            existingUser = result.data;
        } else {
            existing = false;
        }

        //Generate the otp
        try {
            if (CommonConstants.COMMON.APP_OTP.TYPE.NUMERIC.VALUE == SettingsMap.get(SettingsKeysCommon.COMMON.OTP.TYPE)) {
                otp = RandomUtil.numeric();
            } else if (CommonConstants.COMMON.APP_OTP.TYPE.ALPHA_NUMERIC.VALUE == SettingsMap.get(SettingsKeysCommon.COMMON.OTP.TYPE)) {
                otp = RandomUtil.string().toUpperCase();
            } else if (CommonConstants.COMMON.APP_OTP.TYPE.ALPHABETIC.VALUE == SettingsMap.get(SettingsKeysCommon.COMMON.OTP.TYPE)) {
                otp = RandomUtil.alphabet().toUpperCase();
            } else {
                otp = RandomUtil.string().toUpperCase();
            }
        } catch (err) {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.ASSETMGMT.USER.OTP.ERROR_GEN,
                CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
                err);
            rejectObject.appendMessage(err.message);
            return Promise.reject(rejectObject.jsonObject());
        }

        if (existing) {
            //update the otpToken of the existing user and save it
            if (Constants.ASSETMGMT.APP_PLAYER.USER.STATE.REGISTERING.CODE == existingUser.state.state) {
                let updateUser = {};
                updateUser.otpToken = {};
                updateUser.otpToken.otp = otp;
                updateUser.otpToken.expiry = Date.now() + SettingsMap.get(SettingsKeysCommon.COMMON.OTP.EXPIRY_DURATION_SECONDS) * 1000;
                updateUser.otpToken.remainingAttempts = existingUser.otpToken.remainingAttempts - 1;
                //convert updateUser.otpToken to dot notation

                if (0 == updateUser.otpToken.remainingAttempts) {
                    //attempts exhausted; lock user and return user locked error
                    updateUser.state = {};
                    updateUser.state.state = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.CODE;
                    updateUser.state.stateReason = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.REASON.EXCEEDED_REGISTRATION_OTP_GENERATION_COUNT;

                    //updateUser.otpToken = null;
                    delete updateUser.otpToken.type;
                    delete updateUser.otpToken.otp;
                    delete updateUser.otpToken.remainingAttempts;
                    delete updateUser.otpToken.expiry;
                    updateUser.otpToken = {}; //QMRK


                    rejectObject = new RejectData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                        Constants.ASSETMGMT.USER.OTP.ERROR_GEN,
                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                        null);
                    rejectObject.appendMessage(Constants.ASSETMGMT.USER.OTP.ERROR_TOO_MANY_ATTEMPTS_LOCKED);

                    error = result = null;
                    [error, result] = await To(updateOneByIdInternal(existingUser._id, existingUser._id, updateUser, flags));
                    if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                        let strippedUser = null;
                        error = null;
                        [error, strippedUser] = await To(stripOffFields(result.data, true));
                        return Promise.reject(rejectObject.jsonObject());
                    } else {
                        rejectObject.appendMessage(error.message);
                        rejectObject.setSubCode(error.subCode);
                        rejectObject.setDetails(error);
                        return Promise.reject(rejectObject.jsonObject());
                    }
                } else {
                    //Notification server is getting invoked
                    if (existingUser.identifier.type === CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER) {
                        sendSms(existingUser.phone, existingUser.otpToken.type, otp);
                    } else if (existingUser.identifier.type === CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL) {
                        sendEmail(existingUser.email.email, existingUser.otpToken.type, otp);
                    }
                    //update to existing user and save
                    if (null == existingUser.createdBy) {
                        updateUser.createdBy = existingUser._id;
                    }

                    rejectObject = new RejectData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                        Constants.ASSETMGMT.USER.OTP.ERROR_GEN,
                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                        null);

                    error = result = null;
                    [error, result] = await To(updateOneByIdInternal(existingUser._id, existingUser._id, updateUser, flags));
                    if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                        let strippedUser = null;
                        error = null;
                        [error, strippedUser] = await To(stripOffFields(result.data, true));
                        resolveObject = new ResolveData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                            Constants.ASSETMGMT.USER.OTP.SUCCESS,
                            strippedUser
                        );
                        return Promise.resolve(resolveObject.jsonObject());
                    } else {
                        rejectObject.appendMessage(error.message);
                        rejectObject.setSubCode(error.subCode);
                        rejectObject.setDetails(error);
                        return Promise.reject(rejectObject.jsonObject());

                    }
                }
            } else {
                //user is not in registering state
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                    Constants.ASSETMGMT.USER.OTP.ERROR_GEN,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                rejectObject.appendMessage(Constants.ASSETMGMT.USER.OTP.ERROR_USER_NOT_REGISTERING_STATE);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {

            //create the user
            let otpToken = {};
            otpToken.type = CommonConstants.COMMON.APP_OTP.REGISTRATION.CODE;
            user.otpToken = otpToken;
            if (user.phone) {
                //Nothing
            } else if (user.email) {
                let email = {};
                email.email = user.email;
                user.email = email;
            }

            let selfRegisteringRoles = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE.filter(
                function (item) {
                    return item.SYSTEM_ROLE == false;
                }
            );
            if (!user.role) {
                //The lowest level self registering role shall be created if not provided
                user.role = selfRegisteringRoles[selfRegisteringRoles.length - 1].CODE;
            } else {
                //Check if provided role can self register
                var role = selfRegisteringRoles.filter(function (el) {
                    return el.CODE === user.role;
                });

                if (role.length === 0) {
                    //user is not in registering role
                    rejectObject = new RejectData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                        Constants.ASSETMGMT.USER.OTP.ERROR_GEN,
                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                        null);
                    rejectObject.appendMessage(Constants.ASSETMGMT.USER.OTP.ERROR_CANNOT_SELF_REGISTER);
                    return Promise.reject(rejectObject.jsonObject());
                }
            }

            user.state = {};
            if (user.otpToken) {
                user.otpToken.otp = otp;
                if (user.otpToken.type == CommonConstants.COMMON.APP_OTP.REGISTRATION.CODE) {
                    user.otpToken.remainingAttempts = SettingsMap.get(SettingsKeysCommon.COMMON.OTP.RETRY_COUNT);
                    user.otpToken.expiry = Date.now() + SettingsMap.get(SettingsKeysCommon.COMMON.OTP.EXPIRY_DURATION_SECONDS) * 1000;

                    user.state.state = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.REGISTERING.CODE;
                }
                if (user.otpToken.type == CommonConstants.COMMON.APP_OTP.RESET_PASSWORD.CODE) {
                    user.otpToken.remainingAttempts = SettingsMap.get(SettingsKeysCommon.COMMON.OTP.RETRY_COUNT);
                    user.otpToken.expiry = Date.now() + SettingsMap.get(SettingsKeysCommon.COMMON.OTP.EXPIRY_DURATION_SECONDS) * 1000;
                }
            }

            //as this is self-registration. _id will be updated after creation
            let caller = null;

            //check the phone number is listed in the whitelist
            [error, result] = await To(WhitelistHelper.getOneWhitelistedUser(user));
            if (error) {
                rejectObject.setMessage(Constants.ASSETMGMT.USER.OTP.ERROR_NOT_IN_WHITELIST);
                rejectObject.appendMessage(error.message);
                rejectObject.setDetails(error);
                return Promise.reject(rejectObject.jsonObject());
            }
            if (user.role === 'coach') {
                //TODO - to add a check if the hierarchy owner is available
                user.hierarchyCode = result.data.hierarchyCode + '-' + Constants.ASSETMGMT.APP_USER_HIERARCHICAL_ROLE_TYPE.NODE;
            } else if (user.role === 'player'){
                user.hierarchyCode = result.data.hierarchyCode + '-' + Constants.ASSETMGMT.APP_USER_HIERARCHICAL_ROLE_TYPE.NODE;
                let user1 = {};
                user1.identifier = result.data.coachIdentifier;
                [error, result] = await To(getOneByIdentifier(user1));
                if (error) {
                    rejectObject.setMessage(Constants.ASSETMGMT.USER.OTP.ERROR_ASSOCIATED_COACH_NOT_FOUND);
                    rejectObject.appendMessage(error.message);
                    rejectObject.setDetails(error);
                    return Promise.reject(rejectObject.jsonObject());
                }
                user.coach = result.data._id;
            }
            // Create
            let createdUser = null;
            [error, result] = await To(createOne(caller, user, flags));
            if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                createdUser = result.data;
                if (createdUser.otpToken && CommonValidator.isNonEmptyObject(createdUser.otpToken)) {
                    //Notification server is getting invoked
                    if (createdUser.identifier.type === CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER) {
                        sendSms(createdUser.phone, createdUser.otpToken.type, otp);
                    } else if (createdUser.identifier.type === CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL) {
                        sendEmail(createdUser.email.email, createdUser.otpToken.type, otp);
                    }
                }

                error = null;
                let strippedUser = null;
                [error, strippedUser] = await To(stripOffFields(createdUser, true));
                resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.ASSETMGMT.USER.OTP.SUCCESS,
                    strippedUser
                );
                return Promise.resolve(resolveObject.jsonObject());
            } else {
                rejectObject.appendMessage(error.message);
                rejectObject.setSubCode(error.subCode);
                rejectObject.setDetails(error.details);
                return Promise.reject(rejectObject.jsonObject());
            }
        }
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.OTP.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* generate otp and update one user
* @param {*} user json
*/
async function generateOtpAndUpdateOne(existingUser) {
    let error, result;
    //no flags for this
    let flags = {};
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.USER.OTP.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    var resolveObject;
    try {
        let otp;

        //if (user.phone) {
        //    user.identifier = {};
        //    user.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER;
        //    user.identifier.id = user.phone.cc + user.phone.number;
        //} else if (user.email) {
        //    user.identifier = {};
        //    user.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
        //    user.identifier.id = user.email;
        //}

        ////Check if  the user is already existing
        //[error, result] = await To(UserService.getOneByIdentifier(user, flags));
        //if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
        //    existingUser = result.data;
        //} else {
        //    rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
        //    rejectObject.appendMessage(Constants.ASSETMGMT.USER.LOGIN.ERROR_USER_ID_NOT_FOUND);
        //    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
        //    return Promise.reject(rejectObject.jsonObject());
        //}

        //Generate the otp
        try {
            if (CommonConstants.COMMON.APP_OTP.TYPE.NUMERIC.VALUE == SettingsMap.get(SettingsKeysCommon.COMMON.OTP.TYPE)) {
                otp = RandomUtil.numeric();
            } else if (CommonConstants.COMMON.APP_OTP.TYPE.ALPHA_NUMERIC.VALUE == SettingsMap.get(SettingsKeysCommon.COMMON.OTP.TYPE)) {
                otp = RandomUtil.string().toUpperCase();
            } else if (CommonConstants.COMMON.APP_OTP.TYPE.ALPHABETIC.VALUE == SettingsMap.get(SettingsKeysCommon.COMMON.OTP.TYPE)) {
                otp = RandomUtil.alphabet().toUpperCase();
            } else {
                otp = RandomUtil.string().toUpperCase();
            }
        } catch (err) {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.ASSETMGMT.USER.OTP.ERROR_GEN,
                CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
                err);
            rejectObject.appendMessage(err.message);
            return Promise.reject(rejectObject.jsonObject());
        }

        //update the otpToken of the existing user and save it
        if ((Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_IN.CODE == existingUser.state.state) ||
            (Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_OUT.CODE == existingUser.state.state) ||
            (Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.NEVER_LOGGED_IN.CODE == existingUser.state.state)) {

            let updateUser = {};
            if (CommonValidator.isValidOTPTokenObject(existingUser.otpToken)) {
                if (existingUser.otpToken.type != CommonConstants.COMMON.APP_OTP.OTP_LOGIN.CODE) {
                    rejectObject = new RejectData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                        Constants.ASSETMGMT.USER.OTP.ERROR_GEN,
                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                        null);
                    rejectObject.appendMessage(Constants.ASSETMGMT.USER.OTP.ERROR_USER_NOT_ACTIVE_STATE);
                    return Promise.reject(rejectObject.jsonObject());
                } else {
                    updateUser.otpToken = {};
                    updateUser.otpToken.otp = otp;
                    updateUser.otpToken.type = CommonConstants.COMMON.APP_OTP.OTP_LOGIN.CODE;
                    updateUser.otpToken.expiry = Date.now() + SettingsMap.get(SettingsKeysCommon.COMMON.OTP.EXPIRY_DURATION_SECONDS) * 1000;

                    updateUser.activityDetails = {};
                    updateUser.activityDetails.remainingAttempts = existingUser.activityDetails.remainingAttempts - 1;
                }
            } else {
                //update to existing user and save
                if (null == existingUser.createdBy) {
                    updateUser.createdBy = existingUser._id;
                }
                updateUser.otpToken = {};
                updateUser.otpToken.type = CommonConstants.COMMON.APP_OTP.OTP_LOGIN.CODE;
                updateUser.otpToken.otp = otp;
                updateUser.otpToken.expiry = Date.now() + SettingsMap.get(SettingsKeysCommon.COMMON.OTP.EXPIRY_DURATION_SECONDS) * 1000;
                updateUser.activityDetails = {};
                updateUser.activityDetails.remainingAttempts = SettingsMap.get(SettingsKeysCommon.COMMON.LOGIN.RETRY_COUNT);
            }

            if (0 == updateUser.activityDetails.remainingAttempts) {
                //attempts exhausted; lock user and return user locked error
                updateUser.state = {};
                updateUser.state.state = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.CODE;
                updateUser.state.stateReason = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.REASON.EXCEEDED_LOGIN_OTP_GENERATION_COUNT;

                //updateUser.otpToken = null;
                delete updateUser.otpToken.type;
                delete updateUser.otpToken.otp;
                delete updateUser.otpToken.remainingAttempts;
                delete updateUser.otpToken.expiry;
                updateUser.otpToken = {};

                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                    Constants.ASSETMGMT.USER.OTP.ERROR_GEN,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                rejectObject.appendMessage(Constants.ASSETMGMT.USER.OTP.ERROR_TOO_MANY_ATTEMPTS_LOCKED);

                error = result = null;
                [error, result] = await To(updateOneByIdInternal(existingUser._id, existingUser._id, updateUser, flags));
                if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                    let strippedUser = null;
                    error = null;
                    [error, strippedUser] = await To(stripOffFields(result.data, true));
                    return Promise.reject(rejectObject.jsonObject());
                } else {
                    rejectObject.appendMessage(error.message);
                    rejectObject.setSubCode(error.subCode);
                    rejectObject.setDetails(error);
                    return Promise.reject(rejectObject.jsonObject());
                }
            } else {
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                    Constants.ASSETMGMT.USER.OTP.ERROR_GEN,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);

                //Notification server is getting invoked
                if (existingUser.identifier.type === CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER) {
                    sendSms(existingUser.phone, updateUser.otpToken.type, otp);
                } else if (existingUser.identifier.type === CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL) {
                    sendEmail(existingUser.email.email, updateUser.otpToken.type, otp);
                }

                error = result = null;
                [error, result] = await To(updateOneByIdInternal(existingUser._id, existingUser._id, updateUser, flags));
                if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                    let strippedUser = null;
                    error = null;
                    [error, strippedUser] = await To(stripOffFields(result.data, true));
                    resolveObject = new ResolveData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                        Constants.ASSETMGMT.USER.OTP.SUCCESS,
                        strippedUser
                    );
                    return Promise.resolve(resolveObject.jsonObject());
                } else {
                    rejectObject.appendMessage(error.message);
                    rejectObject.setSubCode(error.subCode);
                    rejectObject.setDetails(error);
                    return Promise.reject(rejectObject.jsonObject());
                }
            }
        } else {
            //user is not in active state
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.OTP.ERROR_GEN,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            rejectObject.appendMessage(Constants.ASSETMGMT.USER.OTP.ERROR_USER_NOT_ACTIVE_STATE);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.OTP.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* check otp and update one user
* @param {*} authUser json
* @param {*} userId string 
* @param {*} user json
* @param {*} flags json
*/
async function checkOtpAndUpdateOne(existingUser, incomingUser, flags) {
    let error, result;
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.USER.REGISTER.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null);
    let updateUser = {};

    try {
        //Get one user
        //[error, result] = await To(UserService.getOneById(userId, flags));
        let success = false;
        //if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
        if (existingUser.state.state == Constants.ASSETMGMT.APP_PLAYER.USER.STATE.REGISTERING.CODE) {
            if ((existingUser.otpToken.expiry >= Date.now()) && (existingUser.otpToken.otp == incomingUser.otpToken.otp)) {
                //Update
                if (existingUser.createdBy == null) {
                    updateUser.createdBy = existingUser._id;
                }
                updateUser.updatedBy = existingUser._id;
                if (incomingUser.profileData) {
                    if (incomingUser.profileData.membershipProfile) {
                        delete incomingUser.profileData.membershipProfile;
                    }
                    updateUser.profileData = incomingUser.profileData;
                    if (!incomingUser.profileData.pic) {
                        updateUser.profileData.pic = '/user/common/images/profile_pic.png'; //TODO100 get this from setting
                    }
                }
                let existingUserRole = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE.filter(function (el) {
                    return (el.CODE === existingUser.role);
                })[0];
                if (existingUserRole.MEMBERSHIP) {
                    if (!updateUser.profileData) {
                        updateUser.profileData = {};
                    }
                    updateUser.profileData.membershipProfile = {};
                    let creditsToAdd = SettingsMap.get(SettingsKeysAssetMgmt.ASSETMGMT.POST.REVIEW_CREDIT_COUNT);
                    updateUser.profileData.membershipProfile.remainingReviews = creditsToAdd;
                    updateUser.profileData.membershipProfile.reviewRequestedAt = [];

                }
                updateUser.otpToken = {};  //QMARK
                if (incomingUser.phone) {
                    if (existingUser.identifier.type == CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER) {
                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                            Constants.ASSETMGMT.USER.REGISTER.ERROR,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null);
                        rejectObject.appendMessage(Constants.ASSETMGMT.USER.REGISTER.ERROR_PHONE_USED_AS_ID);
                        return Promise.reject(rejectObject.jsonObject());
                    } else {
                        updateUser.phone = incomingUser.phone;
                        updateUser.phone.verified = 'false';
                    }
                }

                if (incomingUser.email) {
                    if (existingUser.identifier.type == CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL) {
                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                            Constants.ASSETMGMT.USER.REGISTER.ERROR,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null);
                        rejectObject.appendMessage(Constants.ASSETMGMT.USER.REGISTER.ERROR_EMAIL_USED_AS_ID);
                        return Promise.reject(rejectObject.jsonObject());
                    } else {
                        updateUser.email = {};
                        updateUser.email = incomingUser.email;
                        updateUser.email.verified = 'false';
                    }
                }
                if (existingUser.phone &&/*existingUser.phone.otpToken &&*/
                        (existingUser.identifier.type == CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER)) {
                    updateUser.phone = {};
                    updateUser.phone.verified = true;
                }
                if (existingUser.email && /*existingUser.email.otpToken &&*/
                        (existingUser.identifier.type == CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL)) {
                    updateUser.email = {};
                    updateUser.email.verified = true;
                }

                updateUser.state = {};
                updateUser.state.state = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.NEVER_LOGGED_IN.CODE;
                if (incomingUser.password) {
                    updateUser.password = CommonUtil.generateHash(incomingUser.password);
                }
                updateUser.activityDetails = {};
                updateUser.activityDetails.remainingAttempts = SettingsMap.get(SettingsKeysCommon.COMMON.LOGIN.RETRY_COUNT);
                updateUser.activityDetails.lastFailedLoginTs = 0;
                updateUser.activityDetails.lastSuccessfulLoginTs = 0;
                success = true;
            } else {
                //decrement the remainingAttempts
                let remainingAttempts = existingUser.otpToken.remainingAttempts - 1;
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                rejectObject.appendMessage(Constants.ASSETMGMT.USER.REGISTER.ERROR_INCORRECT_OTP);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                if (existingUser.createdBy == null) {
                    updateUser.createdBy = existingUser._id;
                }
                updateUser.updatedBy = existingUser._id;
                updateUser.otpToken = {};
                updateUser.otpToken.remainingAttempts = remainingAttempts;

                if (remainingAttempts == 0) {
                    updateUser.state = {};
                    updateUser.state.state = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.CODE;
                    updateUser.state.stateReason = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.REASON.EXCEEDED_REGISTRATION_OTP_GENERATION_COUNT;
                    //updateUser.otpToken = null;
                    delete updateUser.otpToken.type;
                    delete updateUser.otpToken.otp;
                    delete updateUser.otpToken.remainingAttempts;
                    delete updateUser.otpToken.expiry;
                    updateUser.otpToken = {}; //QMARK
                    rejectObject.appendMessage(Constants.ASSETMGMT.USER.REGISTER.ERROR_INCORRECT_OTP_LOCKED);

                }
                rejectObject.setData({ remainingAttempts: remainingAttempts });
            }

            let flags = {};

            // Update
            error = result = null;
            [error, result] = await To(updateOneByIdInternal(existingUser._id, existingUser._id, updateUser, flags));
            if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                if (success) {
                    error = null;
                    let strippedUser = null;
                    [error, strippedUser] = await To(stripOffFields(result.data, true));
                    var resolveObject = new ResolveData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                        Constants.ASSETMGMT.USER.REGISTER.SUCCESS,
                        strippedUser
                    );
                    return Promise.resolve(resolveObject.jsonObject());
                } else {
                    return Promise.reject(rejectObject.jsonObject());
                }
            } else {
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                    Constants.ASSETMGMT.USER.REGISTER.ERROR,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    error);
                rejectObject.appendMessage(error.message);
                rejectObject.setSubCode(error.subCode);
                rejectObject.setDetails(error);

                return Promise.reject(rejectObject.jsonObject());
            }
        } else {

            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(Constants.ASSETMGMT.USER.REGISTER.ERROR_USER_NOT_REGISTERING_STATE);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            rejectObject.setDetails(null);
            return Promise.reject(rejectObject.jsonObject());
        }

        //} else {
        //    rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
        //    rejectObject.appendMessage(Constants.ASSETMGMT.USER.REGISTER.ERROR_USER_ID_NOT_FOUND);
        //    rejectObject.appendMessage(error.message);
        //    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
        //    return Promise.reject(rejectObject.jsonObject());
        //}

    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.REGISTER.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* check credentials, generate token and update one user
* @param {*} user json
* @param {*} flags json
*/
async function checkCredentialsGenerateTokenAndUpdateOne(existingUser, user, flags) {

    let error, result;
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.USER.LOGIN.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null);

    try {
        let userToUpdate = {};
        //let existingUser;
        let userId;
        let success = false;
        userId = existingUser._id;

        if (existingUser.state.state == Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.NEVER_LOGGED_IN.CODE ||
            existingUser.state.state == Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_IN.CODE ||
            existingUser.state.state == Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_OUT.CODE) {
            let isAuthorized = false;

            if (user.password) {
                if (existingUser.password) {
                    // Compare password hash
                    isAuthorized = CommonUtil.comparePasswords(user.password, existingUser.password);
                }
            } else if (user.otp) {
                if (CommonValidator.isValidOTPTokenObject(existingUser.otpToken) && (existingUser.otpToken.type == CommonConstants.COMMON.APP_OTP.OTP_LOGIN.CODE)) {
                    isAuthorized = (user.otp == existingUser.otpToken.otp);
                }
            } else {
                //nothing
            }
            userToUpdate.activityDetails = {};
            if (isAuthorized) {
                //Generate the JWT token
                let jwtError, jwtResult;
                let expiryDuration = SettingsMap.get(SettingsKeysCommon.COMMON.JWT.EXPIRY_DURATION_SECONDS) * 1000;
                var roles = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE;
                var role = roles.filter(function (el) {
                    return el.CODE === existingUser.role;
                });
                [jwtError, jwtResult] = await To(CommonJWTHelper.generateJWT(userId,
                    role[0].CODE,
                    role[0].SSO_SUBJECT,
                    expiryDuration
                ));
                if (CommonValidator.isSuccessResponseAndNonEmptyData(jwtResult)) {
                    if (existingUser.state.state == Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.NEVER_LOGGED_IN.CODE ||
                        existingUser.state.state == Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_OUT.CODE) {
                        //Update the token
                        userToUpdate.token = {};
                        userToUpdate.token.token = jwtResult.data.token;
                        userToUpdate.token.expiry = jwtResult.data.expiry;
                        success = true;
                    } else if (existingUser.state.state == Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_IN.CODE) {
                        error = result = null;
                        //Blacklist the existing token
                        [error, result] = await To(UserTokenBlacklistHelper.addToBlacklist(existingUser._id, existingUser.token.token, null));
                        if (CommonValidator.isSuccessResponse(result)) {
                            //Update to newly generated token
                            userToUpdate.token = {};
                            userToUpdate.token.token = jwtResult.data.token;
                            userToUpdate.token.expiry = jwtResult.data.expiry;
                            success = true;
                        } else {
                            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
                            rejectObject.appendMessage(error.message);
                            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                        }
                    }
                } else {
                    rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
                    rejectObject.appendMessage(jwtError.message);
                    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
                }
            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                if (user.password) {
                    if (!existingUser.password) {
                        rejectObject.appendMessage(Constants.ASSETMGMT.USER.LOGIN.ERROR_NO_PASSWORD);
                    } else {
                        rejectObject.appendMessage(Constants.ASSETMGMT.USER.LOGIN.ERROR_INCORRECT_PASSWORD);
                    }
                } else if (user.otp) {
                    rejectObject.appendMessage(Constants.ASSETMGMT.USER.LOGIN.ERROR_INCORRECT_OTP);
                }
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            }

        } else {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(Constants.ASSETMGMT.USER.LOGIN.ERROR_USER_NOT_ACTIVE);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            return Promise.reject(rejectObject.jsonObject());
        }

        if (success) {
            userToUpdate.state = {};
            userToUpdate.state.state = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_IN.CODE;
            userToUpdate.activityDetails.remainingAttempts = SettingsMap.get(SettingsKeysCommon.COMMON.LOGIN.RETRY_COUNT);
            userToUpdate.activityDetails.lastSuccessfulLoginTs = Date.now();
            if (CommonValidator.isValidOTPTokenObject(existingUser.otpToken)) {
                userToUpdate.otpToken = {};
            }
        } else {
            userToUpdate.activityDetails.remainingAttempts = existingUser.activityDetails.remainingAttempts - 1;
            userToUpdate.activityDetails.lastFailedLoginTs = Date.now();
            rejectObject.setData({
                remainingAttempts: userToUpdate.activityDetails.remainingAttempts
            });
            if (0 == userToUpdate.activityDetails.remainingAttempts) {
                //Update to locked status
                userToUpdate.state = {};
                userToUpdate.state.state = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.CODE;
                if (user.password) {
                    userToUpdate.state.stateReason = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.REASON.EXCEEDED_LOGIN_WRONG_PASSWORD_COUNT;
                    rejectObject.appendMessage(Constants.ASSETMGMT.USER.LOGIN.ERROR_INCORRECT_PASSWORD_LOCKED);
                } else if (user.otp) {
                    userToUpdate.state.stateReason = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.REASON.EXCEEDED_LOGIN_OTP_VALIDATION_COUNT;
                    rejectObject.appendMessage(Constants.ASSETMGMT.USER.LOGIN.ERROR_INCORRECT_OTP_LOCKED);
                }
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                rejectObject.setData({
                    remainingAttempts: userToUpdate.activityDetails.remainingAttempts,
                    state: userToUpdate.state
                });
            }
        }
        // Update
        [error, result] = await To(updateOneByIdInternal(userId, userId, userToUpdate, flags));
        if (error) {
            rejectObject.appendMessage(error.message);
            rejectObject.setDetails(error);
            return Promise.reject(rejectObject.jsonObject());
        }
        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
            if (success) {
                let strippedUser = null;
                error = null;
                [error, strippedUser] = await To(stripOffUnnecessaryFields(result.data));
                var resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.ASSETMGMT.USER.LOGIN.SUCCESS,
                    strippedUser
                );
                return Promise.resolve(resolveObject.jsonObject());
            } else {
                return Promise.reject(rejectObject.jsonObject());
            }
        }
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.LOGIN.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);

        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* logout- check, blacklist token and update user
* @param {*} authUser json
* @param {*} token string
* @param {*} flags json
*/
async function checkUserBlacklistTokenAndUpdate(caller, flags) {
    let error, result;
    try {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.LOGOUT.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            null);

        //[error, result] = await To(UserService.getOneById(authUser._id, flags));
        //if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
        error = result = null;

        [error, result] = await To(UserTokenBlacklistHelper.addToBlacklist(caller._id, caller.token.token));
        if (CommonValidator.isSuccessResponse(result)) {
            let flags = null;
            let userToUpdate = {};
            userToUpdate.state = {};
            userToUpdate.state.state = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_OUT.CODE;
            userToUpdate.token = {};

            // Update
            error = result = null;
            [error, result] = await To(updateOneByIdInternal(caller._id, caller._id, userToUpdate, flags));
            if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                let strippedUser = null;
                error = null;
                [error, strippedUser] = await To(stripOffFields(result.data, true));
                var resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.ASSETMGMT.USER.LOGOUT.SUCCESS,
                    strippedUser
                );
                return Promise.resolve(resolveObject.jsonObject());
            } else {
                rejectObject.appendMessage(error.message);
                rejectObject.setDetails(error);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            rejectObject.appendMessage(error.message);
            rejectObject.setDetails(error);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            return Promise.reject(rejectObject.jsonObject());
        }
        //} else {
        //    rejectObject.appendMessage(error.message);
        //    rejectObject.setDetails(error);
        //    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
        //    return Promise.reject(rejectObject.jsonObject());
        //}
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.LOGOUT.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);

        return Promise.reject(rejectObject.jsonObject());
    }
}


/**
* generate new token and blacklist the old token
* @param {*} authUser json
* @param {*} token string
* @param {*} flags json
*/
async function generateNewTokenAndBlacklistOldToken(caller, flags) {
    let error, result;
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.USER.TOKEN_REFRESH.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        error);
    try {


        //[error, result] = await To(UserService.getOneById(caller._id, flags));

        //if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
        //Generate the JWT token
        let userId = caller._id;
        let existingUser = caller;

        let jwtError, jwtResult;
        let expiryDuration = SettingsMap.get(SettingsKeysCommon.COMMON.JWT.EXPIRY_DURATION_SECONDS) * 1000;
        var roles = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE;
        var role = roles.filter(function (el) {
            return el.CODE === existingUser.role;
        });
        [jwtError, jwtResult] = await To(CommonJWTHelper.generateJWT(caller._id,
            //TODOEX
            role[0].CODE,
            role[0].SUBJECT,
            expiryDuration
        ));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(jwtResult)) {
            if (existingUser.state.state == Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_IN.CODE) {
                error = result = null;
                //Blacklist the existing token
                [error, result] = await To(UserTokenBlacklistHelper.addToBlacklist(caller._id, caller.token.token, null));
                if (CommonValidator.isSuccessResponse(result)) {
                    //Update to newly generated token
                    let userToUpdate = {};
                    userToUpdate.token = {};
                    userToUpdate.token.token = jwtResult.data.token;
                    userToUpdate.token.expiry = jwtResult.data.expiry;

                    // Update
                    [error, result] = await To(updateOneByIdInternal(userId, userId, userToUpdate, null));
                    if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                        let strippedUser = null;
                        error = null;
                        [error, strippedUser] = await To(stripOffFields(result.data, false));
                        if (strippedUser) {
                            var resolveObject = new ResolveData(
                                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                                Constants.ASSETMGMT.USER.TOKEN_REFRESH.SUCCESS,
                                strippedUser
                            );
                            return Promise.resolve(resolveObject.jsonObject());

                        } else {
                            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
                            rejectObject.appendMessage(Constants.ASSETMGMT.USER.GENERIC.PREPARE_RESPONSE_DATA.ERROR);
                            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN);
                            return Promise.reject(rejectObject.jsonObject());
                        }
                    } else {
                        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                        rejectObject.appendMessage(Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR);
                        rejectObject.appendMessage(error.message);
                        rejectObject.setDetails(error);
                        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                        return Promise.reject(rejectObject.jsonObject());
                    }
                } else {
                    rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                    rejectObject.appendMessage(error.message);
                    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                    return Promise.reject(rejectObject.jsonObject());
                }
            } else {
                //user is not in logged in state, token cannot be refreshed
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                rejectObject.appendMessage(Constants.ASSETMGMT.USER.TOKEN_REFRESH.ERROR_NOT_LOGGED_IN);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            rejectObject.appendMessage(jwtError.message);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
            return Promise.reject(rejectObject.jsonObject());
        }
    //    } else {
    //        rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION);
    //        return Promise.reject(rejectObject.jsonObject());
    //    }
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.TOKEN_REFRESH.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);

        return Promise.reject(rejectObject.jsonObject());
    }
}
/**
* Create one user
* @param {*} authUser 
* @param {*} user 
* @param {*} flags 
*/
async function createOne(caller, user, flags) {
    let error, result;
    try {
        if (!flags) {
            flags = {};
        }

        if (user.phone && (!user.email)) {
            user.identifier = {};
            user.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER;
            user.identifier.id = user.phone.cc + user.phone.number;
        }
        if (user.email && (!user.phone)) {
            user.identifier = {};
            user.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
            user.identifier.id = user.email.email;
        }
        if (user.phone && user.email) {
            let identifier = {};
            identifier.type = user.identifier;
            if (identifier.type == CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER) {
                identifier.id = user.phone.cc + user.phone.number;
            } else if (identifier.type == CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL) {
                identifier.id = user.email;
            }
            user.identifier = identifier;
        }
        if (user.password) {
            user.password = CommonUtil.generateHash(user.password);
        }

        if (!user.state) {
            user.state = {};
            user.state.state = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.NEVER_LOGGED_IN.CODE;
            user.state.stateReason = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.NEVER_LOGGED_IN.REASON;
        }
        user.activityDetails = {};
        user.activityDetails.remainingAttempts = SettingsMap.get(SettingsKeysCommon.COMMON.LOGIN.RETRY_COUNT);

        if (caller && CommonValidator.isValidMongoObjectId(caller._id)) {
            user.updatedBy = caller._id;
            user.createdBy = caller._id;

        } else {
            user.updatedBy = null;
            user.createdBy = null;
        }

        let userRole = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE.filter(function (el) {
            return el.CODE === user.role;
        })[0];

        //Do not allow creation of singletons here; they should be provisioned
        if (userRole.SINGLETON) {
            let rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
                Constants.ASSETMGMT.USER.CREATE_ONE.ERROR_CANNOT_CREATE_ROLE,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }

        if (!user.hierarchyCode || (user.hierarchyCode.length < 8)) {
            //generate the hierarchy code
            if (userRole.HIERARCHICAL_ROLE === Constants.ASSETMGMT.APP_USER_HIERARCHICAL_ROLE_TYPE.NONE) {
                user.hierarchyCode = Constants.ASSETMGMT.APP_USER_HIERARCHICAL_ROLE_TYPE.NONE;
            } else if (userRole.HIERARCHICAL_ROLE === Constants.ASSETMGMT.APP_USER_HIERARCHICAL_ROLE_TYPE.ROOT) {
                user.hierarchyCode = RandomUtil.getRandomHexString(8);
            } else if (userRole.HIERARCHICAL_ROLE === Constants.ASSETMGMT.APP_USER_HIERARCHICAL_ROLE_TYPE.SUB) {
                user.hierarchyCode = caller.hierarchyCode + '-' + RandomUtil.getRandomHexString(8);
            } else if (userRole.HIERARCHICAL_ROLE === Constants.ASSETMGMT.APP_USER_HIERARCHICAL_ROLE_TYPE.NODE) {
                user.hierarchyCode = caller.hierarchyCode + '-' + Constants.ASSETMGMT.APP_USER_HIERARCHICAL_ROLE_TYPE.NODE;
            } else {
                let rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                    Constants.ASSETMGMT.USER.CREATE_ONE.ERROR_CANNOT_CREATE_ROLE,
                    CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM,
                    null);
                return Promise.reject(rejectObject.jsonObject());
            }
        }

        //Check for associations, if needed, update association and it should be atomic operation
        let updateAssociation = false;
        let associateId;
        user.roleAssociation = {};
        user.roleAssociation.type = userRole.ROLE_ASSOCIATION_TYPE;
        if (user.roleAssociation.type === Constants.ASSETMGMT.APP_USER_ROLE_ASSOCIATION.NONE) {
            //nothing
        } else if (user.roleAssociation.type === Constants.ASSETMGMT.APP_USER_ROLE_ASSOCIATION.ONE) {
            user.roleAssociation.associateRole = userRole.ASSOCIATE_ROLE_NAME;
            updateAssociation = true;

            if (user.role === Constants.ASSETMGMT.APP_USER_ROLE_NAMES.ENTERPRISE_OWNER) {
                associateId = caller._id;
            } else {
                if (user[userRole.ASSOCIATE_ROLE_NAME] && CommonValidator.isValidMongoObjectId(user[userRole.ASSOCIATE_ROLE_NAME])) {
                    associateId = user[userRole.ASSOCIATE_ROLE_NAME];
                } else {
                    let rejectObject = new RejectData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                        Constants.ASSETMGMT.USER.CREATE_ONE.ERROR_ASSOCIATE_NOT_PROVIDED,
                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                        null);
                    rejectObject.appendMessage(userRole.ASSOCIATE_ROLE_NAME);
                    return Promise.reject(rejectObject.jsonObject());
                }
            }

        } else if (user.roleAssociation.type === Constants.ASSETMGMT.APP_USER_ROLE_ASSOCIATION.MANY) {
            user.roleAssociation.associateRole = userRole.ASSOCIATE_ROLE_NAME;
            user.roleAssociation.associates = [];
        } else {
            let rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.CREATE_ONE.ERROR_ASSOCIATE_NOT_PROVIDED,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            rejectObject.appendMessage(userRole.ASSOCIATE_ROLE_NAME);
            return Promise.reject(rejectObject.jsonObject());
        }

        if (updateAssociation) {
            //transaction op
            const transactionSession = await UserService.startTransactionSession();

            user.roleAssociation.associates = [associateId];
            // Create
            [error, result] = await To(UserService.createOne(user, transactionSession));
            if (!CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                await UserService.abortTransaction(transactionSession);
                return Promise.reject(error);
            } else {
                //Update association
                let createResult = result;
                error = result = null;
                //Fill the user to be updated
                [error, result] = await To(UserService.addOneAssociateOfOneUserById(associateId, createResult.data._id, null, transactionSession));
                if (!CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                    await UserService.abortTransaction(transactionSession);
                    return Promise.reject(error);
                } else {
                    await UserService.commitTransaction(transactionSession);
                    return Promise.resolve(createResult);
                }
            }
        } else {
            // Create
            [error, result] = await To(UserService.createOne(user));
            if (error) {
                return Promise.reject(error);
            }
            if (result) {
                if (result.data) {
                    return Promise.resolve(result);
                }
            }
        }
    } catch (e) {

        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.CREATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* Create superadmin
* @param {*} caller 
* @param {*} user 
* @param {*} flags 
*/
async function createSuperadmin(user, flags) {
    let error, result;

    try {
        if (!flags) {
            flags = {};
        }

        if (user.email) {
            user.identifier = {};
            user.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
            user.identifier.id = user.email.email;
            user.password = CommonUtil.generateHash(user.password);

            user.activityDetails = {};
            user.activityDetails.remainingAttempts = SettingsMap.get(SettingsKeysCommon.COMMON.LOGIN.RETRY_COUNT);

            user.hierarchyCode = Constants.ASSETMGMT.APP_USER_HIERARCHICAL_ROLE_TYPE.NONE;

            [error, result] = await To(UserService.createSuperadmin(user, null));
            if (error) {
                return Promise.reject(error);
            }
            if (result) {
                if (result.data) {
                    return Promise.resolve(result);
                }
            }

        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.ASSETMGMT.USER.ERROR_MISSING_EMAIL.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }

    } catch (e) {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.CREATE_SUPER_ADMIN.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* Create Singleton
* @param {*} caller 
* @param {*} user 
* @param {*} flags 
*/
async function createSingleton(callerId, user, flags) {
    let error, result;

    try {
        if (!flags) {
            flags = {};
        }

        if (user.email) {
            user.identifier = {};
            user.identifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
            user.identifier.id = user.email.email;
            user.password = CommonUtil.generateHash(user.password);

            user.activityDetails = {};
            user.activityDetails.remainingAttempts = SettingsMap.get(SettingsKeysCommon.COMMON.LOGIN.RETRY_COUNT);

            user.hierarchyCode = Constants.ASSETMGMT.APP_USER_HIERARCHICAL_ROLE_TYPE.NONE;

            user.createdBy = callerId;
            user.updatedBy = callerId;

            [error, result] = await To(UserService.createSingleton(user, null));
            if (error) {
                return Promise.reject(error);
            }
            if (result) {
                if (result.data) {
                    return Promise.resolve(result);
                }
            }
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.ASSETMGMT.USER.CREATE_SINGLETON_ROLE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }

    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.CREATE_SINGLETON_ROLE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejObject.appendMessage(e.message);
        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Get one user by id
 * @param {*} userId string
 * @param {*} flags json
 */
async function getOneById(userId, flags) {
    try {
        // Initialize
        let error, result;

        // Create
        [error, result] = await To(UserService.getOneById(userId));
        if (error) {
            return Promise.reject(error);
        }
        if (result) {
            let strippedUser = null;
            error = null;
            [error, strippedUser] = await To(stripOffUnnecessaryFields(result.data));
            if (strippedUser) {
                var resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.ASSETMGMT.USER.GET_ONE_BY_ID.SUCCESS,
                    strippedUser
                );
                return Promise.resolve(resolveObject.jsonObject());

            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
                rejectObject.appendMessage(Constants.ASSETMGMT.USER.GENERIC.PREPARE_RESPONSE_DATA.ERROR);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN);
                return Promise.reject(rejectObject.jsonObject());
            }
        }
    } catch (e) {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.GET_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);

        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
 * Get one user by id
 * @param {*} userId string
 * @param {*} flags json
 */
async function getOneByIdInternal(userId, flags) {
    try {
        // Initialize
        let error, result;

        // Create
        [error, result] = await To(UserService.getOneById(userId));
        if (error) {
            return Promise.reject(error);
        }
        if (result) {
            var resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.USER.GET_ONE_BY_ID.SUCCESS,
                result.data
            );
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.GET_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);

        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
 * Get one user by identifier
 * @param {*} userIdentifier string
 * @param {*} flags json
 */
async function getOneByIdentifierInternal(userIdentifier, flags) {
    try {
        // Initialize
        let error, result;

        // Create
        [error, result] = await To(UserService.getOneByIdentifier(userIdentifier));
        if (error) {
            return Promise.reject(error);
        }
        if (result) {
            var resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.USER.GET_ONE_BY_IDENTIFIER.SUCCESS,
                result.data
            );
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.GET_ONE_BY_IDENTIFIER.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);

        return Promise.reject(rejectObject.jsonObject());
    }
}


/**
 * Get one user by identifier
 * @param {*} userIdentifier string
 * @param {*} flags json
 */
async function getOneByIdentifier(userIdentifier, flags, includeOtp) {
    try {
        // Initialize
        let error, result;

        // Create
        [error, result] = await To(UserService.getOneByIdentifier(userIdentifier));
        if (error) {
            return Promise.reject(error);
        }
        if (result) {
            let strippedUser = null;
            error = null;
            [error, strippedUser] = await To(stripOffUnnecessaryFields(result.data, includeOtp));
            if (strippedUser) {
                var resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.ASSETMGMT.USER.GET_ONE_BY_IDENTIFIER.SUCCESS,
                    strippedUser
                );
                return Promise.resolve(resolveObject.jsonObject());

            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
                rejectObject.appendMessage(Constants.ASSETMGMT.USER.GENERIC.PREPARE_RESPONSE_DATA.ERROR);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN);
                return Promise.reject(rejectObject.jsonObject());
            }
        }
    } catch (e) {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.GET_ONE_BY_IDENTIFIER.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);

        return Promise.reject(rejectObject.jsonObject());
    }
}
/**
 * Search
 * @param {*} setting 
 * @param {*} params 
 * @param {*} query 
 */
async function search(searchData) {
    // Initialize
    let error, result;

    try {
        // Search
        [error, result] = await To(UserService.search(searchData));
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.SEARCH.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejObject.appendMessage(e.message);
        return Promise.reject(rejObject.jsonObject());
    }
}
/**
 * Search count
 * @param {*} setting 
 */
async function searchCount(searchData) {
    // Initialize
    let error, result;

    try {
        // Data manipulation
        // Search
        [error, result] = await To(UserService.searchCount(searchData));
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.SEARCH_COUNT.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejObject.appendMessage(e.message);

        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * check for specific role
 * @param {*} role string
 * @param {*} flags json
 */
async function checkForDefaultSuperUser(role, flags) {
    try {
        // Initialize
        let error, result;

        // Create
        [error, result] = await To(UserService.getByRole(role));
        if (error) {
            return Promise.reject(error);
        }
        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.GET_ONE_BY_ROLE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);

        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
 * Update one user by id
* @param {*} caller json
* @param {*} userId string 
* @param {*} user json
* @param {*} flags json
 */
async function updateOneById(callerId, userId, user, flags) {
    try {
        // Initialize
        let error, result;
        // Update
        [error, result] = await To(updateOneByIdInternal(callerId, userId, user, flags));
        if (error) {
            return Promise.reject(error);
        }
        if (result) {
            if (result.data) {

                let strippedUser = null;
                error = null;
                [error, strippedUser] = await To(stripOffUnnecessaryFields(result.data));
                var resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.SUCCESS,
                    strippedUser
                );
                return Promise.resolve(resolveObject.jsonObject());
            }
        }
    } catch (e) {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}


/**
 * Update one user by id
* @param {*} caller json
* @param {*} userId string 
* @param {*} user json
* @param {*} flags json
 */
async function updateOneByIdInternal(callerId, userId, user, flags) {
    try {

        // Initialize
        let error, result;

        // Assign data
        if (callerId && CommonValidator.isValidMongoObjectId(callerId)) {
            user.updatedBy = callerId;
        }

        // Update
        [error, result] = await To(UserService.updateOneById(userId, user, flags));
        if (error) {
            return Promise.reject(error);
        }
        if (result) {
            if (result.data) {
                return Promise.resolve(result);
            }
        }
    } catch (e) {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* Delete one user by id
* @param {*} userId  
*/
async function deleteOneById(user) {
    try {
        // Initialize
        let error, result;

        //Do not allow the deletion of superuser
        if (user.role == Constants.ASSETMGMT.APP_USER_ROLE_NAMES.SUPERADMIN) {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.ASSETMGMT.USER.DELETE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());

        } else {

            let userRole = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE.filter(function (el) {
                return el.CODE === user.role;
            })[0];
            //Check for associations, if needed, update association and it should be atomic operation
            let deleteAssociation = false;
            let associateId;
            if (user.roleAssociation.type === Constants.ASSETMGMT.APP_USER_ROLE_ASSOCIATION.NONE) {
                //nothing
            } else if (user.roleAssociation.type === Constants.ASSETMGMT.APP_USER_ROLE_ASSOCIATION.ONE) {
                //Also need to delete association
                deleteAssociation = true;
                associateId = user.roleAssociation.associates[0];
            } else if (user.roleAssociation.type === Constants.ASSETMGMT.APP_USER_ROLE_ASSOCIATION.MANY) {
                //if there are associations do not allow the delete
                if (user.roleAssociation.associates.length > 0) {
                    let rejectObject = new RejectData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                        Constants.ASSETMGMT.USER.DELETE_ONE_BY_ID.ERROR_ASSOCIATE_LIST_NOT_EMPTY,
                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                        null);
                    rejectObject.appendMessage(userRole.ASSOCIATE_ROLE_NAME);
                    return Promise.reject(rejectObject.jsonObject());
                }
            } else {
                let rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                    Constants.ASSETMGMT.USER.DELETE_ONE_BY_ID.ERROR_ASSOCIATE_NOT_PROVIDED,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                rejectObject.appendMessage(userRole.ASSOCIATE_ROLE_NAME);
                return Promise.reject(rejectObject.jsonObject());
            }

            if (deleteAssociation) {
                //transaction op
                const transactionSession = await UserService.startTransactionSession();
                // Create
                [error, result] = await To(UserService.deleteOneById(user._id, transactionSession));
                if (!CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                    await UserService.abortTransaction(transactionSession);
                    return Promise.reject(error);
                } else {
                    let deleteResult = result;
                    //Update association
                    error = result = null;
                    //Fill the user to be updated
                    [error, result] = await To(UserService.deleteOneAssociateOfOneUserById(associateId, user._id, null, transactionSession));
                    if (!CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                        await UserService.abortTransaction(transactionSession);
                        return Promise.reject(error);
                    } else {
                        await UserService.commitTransaction(transactionSession);
                        return Promise.resolve(deleteResult);
                    }
                }
            } else {
                // Delete
                [error, result] = await To(UserService.deleteOneById(user._id));
                if (!CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                    return Promise.reject(error);
                } else {
                    // Response
                    return Promise.resolve(result);
                }
            }

        }

    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.DELETE_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejObject.appendMessage(e.message);
        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Delete multiple users by id
 * @param {*} userIds  
 */
async function deleteMultipleById(userIds) {
    try {
        // Initialize
        let error, result;

        // Delete
        [error, result] = await To(UserService.deleteMultipleById(userIds));
        if (error) {
            return Promise.reject(error);
        }

        if (result && result.data) {
            // Response
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.DELETE_MULTIPLE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

async function getProfilePic(user) {
    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.USER.GET_PROFILE_PIC.SUCCESS,
        null
    );
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.USER.GET_PROFILE_PIC.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null);

    try {
        let path = user.profileData.pic;
        const fileServerUrl = Config.FILE.URL + Config.FILE.STREAM;

        let response = null;
        try {
            response = await axios.get(fileServerUrl + '?' + path, { responseType: 'stream' });
            if (response.headers.get('content-type') === 'application/octet-stream') {
                resolveObject.setData(
                    {
                        isStream: true,
                        stream: response.data,
                        streamSize: response.headers.streamsize,
                        fileName: response.headers.filename/*,
                        contentType: response.headers.get('content-type')*/
                    }
                );
                return Promise.resolve(resolveObject.jsonObject());
            } else {
                rejectObject.appendMessage(Constants.ASSETMGMT.USER.GET_PROFILE_PIC.ERROR_NO_STREAM);
                return Promise.reject(rejectObject.jsonObject());
            }
        } catch (err) {
            return Promise.reject(handleAxiosError(err, Constants.ASSETMGMT.USER.GET_PROFILE_PIC.ERROR));
        }
    } catch (e) {
        rejectObject.appendMessage(e.message);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
 * 
 * @param {*} req 
 */
async function updateProfilePic(inputStream, user, fileName, streamSize, flags) {
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.USER.UPDATE_PROFILE_PIC.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null);

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.USER.UPDATE_PROFILE_PIC.SUCCESS,
        null
    );

    try {
        // Initialize
        let error, result;
        let userToUpdate = {};
        // Assign data
        if (user._id && CommonValidator.isValidMongoObjectId(user._id)) {
            userToUpdate.updatedBy = user._id;
        }

        //TODO1000 get profile pic max size from settings
        let allowedMaxSizeForProfilePic = 5 * 1024 * 1024;
        if (streamSize <= allowedMaxSizeForProfilePic) {
            //TODO1000 get profile pic allowed mime types from settings
            let allowedMimeTypesForProfilePic = 'image/*,';

            let fileExtn = fileName.substring(fileName.lastIndexOf('.') + 1);
            let fileMimeType = CommonValidator.getMimeTypeFromExtension(fileExtn);

            if (CommonValidator.isAllowedMimeType(fileMimeType, allowedMimeTypesForProfilePic)) {
                //Get the existing profile pic path
                //TODO100 use folder name for profile_pic from CommonConstants
                var path = Config.DEPLOYMENT.ENVIRONMENT + '/' +
                    user._id + '/' +
                    'profile_pic' + '/' +
                    fileName;
                const FileServerUrl = Config.FILE.URL + Config.FILE.STREAM;

                //TODO100 clean-up in below condition + provision default profile pic
                //if (result.data.profileData.pic != '/user/common/images/profile_pic.png') {
                //    body.oldFilePath = result.data.profileData.pic;
                //}

                const config = {
                    headers: {
                        destinationfilepath: path,
                        streamsize: streamSize
                    }
                };

                ///////////////////////
                let consolidatedUploadSizeMon = 0;
                const monitor = new PassThrough();
                monitor.on('error', function (err) {
                    //console.log('monitor stream error', err);
                });
                monitor.on('drain', function () {
                    //console.log('monitor stream drain');
                });
                monitor.on('unpipe', function () {
                    //console.log('monitor stream unpipe');
                });
                monitor.on('close', function () {
                    //console.log('monitor stream close');
                });
                monitor.on('data', (chunk) => {
                    consolidatedUploadSizeMon += chunk.length;
                    //console.log('heap mem usage - ' + process.memoryUsage().heapUsed);
                    //console.log('fileserver; monitor stream progress = ' + consolidatedUploadSizeMon * 100 / req.headers.streamsize);
                });
                monitor.on('end', () => {
                    //console.log('monitor stream end');
                });
                monitor.on('finish', () => {
                    //console.log('monitor stream finish');
                });
                ///////////////////////

                error = result = null;
                [error, result] = await To(axios.put(FileServerUrl, inputStream.pipe(monitor), config));
                if (result && result.data) {
                    userToUpdate.profileData = {};
                    userToUpdate.profileData.pic = result.data.data.path; //the returned key after upload of the file
                    // Update
                    error = result = null;
                    [error, result] = await To(UserService.updateOneById(user._id, userToUpdate, flags));
                    if (CommonValidator.isSuccessResponse(result)) {
                        resolveObject.setData(result);

                        return Promise.resolve(resolveObject.jsonObject());
                    } else {
                        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                        rejectObject.appendMessage(error.message);
                        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                        rejectObject.setDetails(error);
                        return Promise.reject(rejectObject.jsonObject());
                    }
                } else {
                    return Promise.reject(handleAxiosError(error, Constants.ASSETMGMT.USER.UPDATE_PROFILE_PIC.ERROR));
                }
            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                rejectObject.appendMessage(Constants.ASSETMGMT.USER.UPDATE_PROFILE_PIC.ERROR_MIME_TYPE_NOT_ALLOWED);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                rejectObject.setDetails(error);
                return Promise.reject(rejectObject.jsonObject());
            }

        } else {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(Constants.ASSETMGMT.USER.UPDATE_PROFILE_PIC.ERROR_TOO_LARGE);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            rejectObject.setDetails(error);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        rejectObject.appendMessage(e.message);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* check otp and update one user
* @param {*} caller json
* @param {*} userId string 
* @param {*} user json
* @param {*} flags json
*/
async function checkOtpAndUpdateOneToLogin(existingUser, userId, incomingUser, flags) {
    let error, result;
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.USER.REGISTER.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null);
    let updateUser = {};
    try {
        //Get one user
        let success = false;
        if (existingUser.state.state == Constants.ASSETMGMT.APP_PLAYER.USER.STATE.REGISTERING.CODE) {

            if ((existingUser.otpToken.expiry >= Date.now()) && (existingUser.otpToken.otp == incomingUser.otpToken.otp)) {
                //Update
                if (existingUser.createdBy == null) {
                    updateUser.createdBy = existingUser._id;
                }
                updateUser.updatedBy = existingUser._id;
                if (incomingUser.profileData) {
                    if (incomingUser.profileData.membershipProfile) {
                        delete incomingUser.profileData.membershipProfile;
                    }
                    updateUser.profileData = incomingUser.profileData;
                    if (!incomingUser.profileData.pic) {
                        updateUser.profileData.pic = '/user/common/images/profile_pic.png'; //TODO100 get this from setting
                    }
                }
                let existingUserRole = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE.filter(function (el) {
                    return (el.CODE === existingUser.role);
                })[0];
                if (existingUserRole.MEMBERSHIP) {
                    if (!updateUser.profileData) {
                        updateUser.profileData = {};
                    }
                    updateUser.profileData.membershipProfile = {};
                    let creditsToAdd = SettingsMap.get(SettingsKeysAssetMgmt.ASSETMGMT.POST.REVIEW_CREDIT_COUNT);
                    updateUser.profileData.membershipProfile.remainingReviews = creditsToAdd;
                    updateUser.profileData.membershipProfile.reviewRequestedAt = [];
                }
                updateUser.otpToken = {};  //QMARK
                if (incomingUser.phone) {
                    if (existingUser.identifier.type == CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER) {
                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                            Constants.ASSETMGMT.USER.REGISTER.ERROR,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null);
                        rejectObject.appendMessage(Constants.ASSETMGMT.USER.REGISTER.ERROR_PHONE_USED_AS_ID);
                        return Promise.reject(rejectObject.jsonObject());
                    } else {
                        updateUser.phone = incomingUser.phone;
                        updateUser.phone.verified = 'false';
                    }
                }

                if (incomingUser.email) {
                    if (existingUser.identifier.type == CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL) {
                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                            Constants.ASSETMGMT.USER.REGISTER.ERROR,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null);
                        rejectObject.appendMessage(Constants.ASSETMGMT.USER.REGISTER.ERROR_EMAIL_USED_AS_ID);
                        return Promise.reject(rejectObject.jsonObject());
                    } else {
                        updateUser.email = {};
                        updateUser.email = incomingUser.email;
                        updateUser.email.verified = 'false';
                    }
                }
                if (existingUser.phone &&/*existingUser.phone.otpToken &&*/
                        (existingUser.identifier.type == CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER)) {
                    updateUser.phone = {};
                    updateUser.phone.verified = true;
                }
                if (existingUser.email && /*existingUser.email.otpToken &&*/
                        (existingUser.identifier.type == CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL)) {
                    updateUser.email = {};
                    updateUser.email.verified = true;
                }

                updateUser.state = {};
                updateUser.state.state = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.NEVER_LOGGED_IN.CODE;
                updateUser.activityDetails = {};
                updateUser.activityDetails.remainingAttempts = SettingsMap.get(SettingsKeysCommon.COMMON.LOGIN.RETRY_COUNT);
                updateUser.activityDetails.lastFailedLoginTs = 0;
                updateUser.activityDetails.lastSuccessfulLoginTs = 0;
                success = true;

                //Generate the JWT token
                let jwtError, jwtResult;
                let expiryDuration = SettingsMap.get(SettingsKeysCommon.COMMON.JWT.EXPIRY_DURATION_SECONDS) * 1000;
                var roles = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE;
                var role = roles.filter(function (el) {
                    return el.CODE === existingUser.role;
                });
                [jwtError, jwtResult] = await To(CommonJWTHelper.generateJWT(userId,
                    role[0].CODE,
                    role[0].SSO_SUBJECT,
                    expiryDuration
                ));
                if (CommonValidator.isSuccessResponseAndNonEmptyData(jwtResult)) {
                    if (existingUser.state.state == Constants.ASSETMGMT.APP_PLAYER.USER.STATE.REGISTERING.CODE) {
                        updateUser.token = {};
                        updateUser.token.token = jwtResult.data.token;
                        updateUser.token.expiry = jwtResult.data.expiry;

                        updateUser.state = {};
                        updateUser.state.state = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_IN.CODE;
                        updateUser.activityDetails.remainingAttempts = SettingsMap.get(SettingsKeysCommon.COMMON.LOGIN.RETRY_COUNT);
                        updateUser.activityDetails.lastSuccessfulLoginTs = Date.now();
                        if (CommonValidator.isValidOTPTokenObject(existingUser.otpToken)) {
                            updateUser.otpToken = {};
                        }
                        success = true;
                    }
                } else {
                    rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
                    rejectObject.appendMessage(jwtError.message);
                    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
                }
            } else {
                //decrement the remainingAttempts
                let remainingAttempts = existingUser.otpToken.remainingAttempts - 1;
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                rejectObject.appendMessage(Constants.ASSETMGMT.USER.REGISTER.ERROR_INCORRECT_OTP);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                if (existingUser.createdBy == null) {
                    updateUser.createdBy = existingUser._id;
                }
                updateUser.updatedBy = existingUser._id;
                updateUser.otpToken = {};
                updateUser.otpToken.remainingAttempts = remainingAttempts;

                if (remainingAttempts == 0) {
                    updateUser.state = {};
                    updateUser.state.state = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.CODE;
                    updateUser.state.stateReason = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.REASON.EXCEEDED_REGISTRATION_OTP_GENERATION_COUNT;
                    //updateUser.otpToken = null;
                    delete updateUser.otpToken.type;
                    delete updateUser.otpToken.otp;
                    delete updateUser.otpToken.remainingAttempts;
                    delete updateUser.otpToken.expiry;
                    updateUser.otpToken = {}; //QMARK
                    rejectObject.appendMessage(Constants.ASSETMGMT.USER.REGISTER.ERROR_INCORRECT_OTP_LOCKED);

                }
                rejectObject.setData({ remainingAttempts: remainingAttempts });
            }

            let flags = {};

            // Update
            error = result = null;
            [error, result] = await To(updateOneByIdInternal(existingUser._id, userId, updateUser, flags));
            if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                if (success) {
                    error = null;
                    let strippedUser = null;
                    [error, strippedUser] = await To(stripOffUnnecessaryFields(result.data));
                    var resolveObject = new ResolveData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                        Constants.ASSETMGMT.USER.LOGIN.SUCCESS,
                        strippedUser
                    );
                    return Promise.resolve(resolveObject.jsonObject());
                } else {
                    return Promise.reject(rejectObject.jsonObject());
                }
            } else {
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                    Constants.ASSETMGMT.USER.LOGIN.ERROR,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    error);
                rejectObject.appendMessage(error.message);
                rejectObject.setSubCode(error.subCode);
                rejectObject.setDetails(error);

                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(Constants.ASSETMGMT.USER.REGISTER.ERROR_USER_NOT_REGISTERING_STATE);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            rejectObject.setDetails(null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.REGISTER.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* buy credit
* @param {*} userId string
* @param {*} flags json
*/
async function buyCredit(user, flags) {

    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.USER.BUY_CREDIT.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    try {
        // Initialize
        let update = false;
        let error, result;
        let updateUser = {};
        updateUser.profileData = {};
        let creditsToAdd = SettingsMap.get(SettingsKeysAssetMgmt.ASSETMGMT.POST.REVIEW_CREDIT_COUNT);
        if (!user.profileData.membershipProfile) {
            update = true;
            updateUser.profileData.membershipProfile = {};
            updateUser.profileData.membershipProfile.remainingReviews = creditsToAdd;
            updateUser.profileData.membershipProfile.reviewRequestedAt = [];
        } else {
            updateUser.profileData.membershipProfile = user.profileData.membershipProfile;
            if (!user.profileData.membershipProfile.remainingReviews) {
                update = true;
                updateUser.profileData.membershipProfile.remainingReviews = creditsToAdd;
            }
        }

        if (update) {
            error = result = null;
            [error, result] = await To(updateOneByIdInternal(user._id, user._id, updateUser, flags));
            if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                let resultToReturn = {};
                resultToReturn._id = result.data._id;
                resultToReturn.identifier = result.data.identifier;
                resultToReturn.profileData = {};
                resultToReturn.profileData.membershipProfile = result.data.profileData.membershipProfile;
                var resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.ASSETMGMT.USER.BUY_CREDIT.SUCCESS,
                    resultToReturn
                );
                return Promise.resolve(resolveObject);
            } else {
                return Promise.reject(error);
            }
        } else {
            rejectObject.setMessage(Constants.ASSETMGMT.USER.BUY_CREDIT.ERROR_HAS_CREDITS);
            return Promise.reject(rejectObject.jsonObject());
        }

    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.BUY_CREDIT.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);

        return Promise.reject(rejectObject.jsonObject());
    }
}