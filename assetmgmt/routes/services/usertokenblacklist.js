module.exports = {
    createOne: createOne,
    getOneByToken: getOneByToken,
};
const Mongoose = require('mongoose');

const UserTokenBlacklistModel = require('../models/usertokenblacklist');
const ResolveData = require('../../../common/response/resolve-data');
const RejectData = require('../../../common/response/reject-data');
const To = require('../../../common/to/to');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const CommonValidator = require('../../../common/validate/validator');


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
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN);
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
 * Create one
 * @param {*} oTBl 
 * @param {*} params 
 * @param {*} flags 
 */
async function createOne( oTBl) {
    try {
        // Initialize
        let error, result;
        // Create
        [error, result] = await To(UserTokenBlacklistModel(oTBl).save());
        if (CommonValidator.isNonEmptyObject(result) && CommonValidator.isValidMongoObjectId(result._id)) {
            var resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.USER_TOKEN_BLACKLIST.ADD.SUCCESS,
                null
            );
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER_TOKEN_BLACKLIST.ADD.ERROR));
        }
    } catch (e) {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER.ADD.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            null);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
 * 
 * @param {*} token
 * @param {*} flags 
 */
async function getOneByToken(token, flags) {
    try {
        // Initialize
        let error, result;
        let query = {};

        if (!flags) {
            flags = {};
        }

        if (token) {
            query.token = token;
        }

        // Get
        [error, result] = await To(UserTokenBlacklistModel.findOne(query).exec());
        if (CommonValidator.isNonEmptyObject(result)) {
            var resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.USER_TOKEN_BLACKLIST.CHECK.BLACKLISTED,
                null
            );
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER_TOKEN_BLACKLIST.CHECK.NOT_BLACKLISTED));
        }

    } catch (e) {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.USER_TOKEN_BLACKLIST.CHECK.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            null);
        return Promise.reject(rejectObject.jsonObject());
    }
}
