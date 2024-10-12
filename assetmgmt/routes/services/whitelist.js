module.exports = {
    createOne: createOne,
    getOneWhitelistedUser: getOneWhitelistedUser,
    createMultiple: createMultiple,
    updateCoach: updateCoach,
    deleteOneWhitelistedUser: deleteOneWhitelistedUser,
    deleteMultiple: deleteMultiple
}

//Imports
const WhitelistModel = require('../models/whitelist');
const To = require('../../../common/to/to');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const RejectData = require('../../../common/response/reject-data');
const ResolveData = require('../../../common/response/resolve-data');
const Mongoose = require('mongoose');

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
};

async function createOne(whitelistData) {
    //Initialize
    let error, result, rejectObject, resolveObject;
    try {
        [error, result] = await To(WhitelistModel(whitelistData).save());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.WHITELIST.CREATE_ONE.ERROR));
        } else {
            resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.WHITELIST.CREATE_ONE.SUCCESS,
                null
            );
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (error) {
        return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.WHITELIST.CREATE_ONE.ERROR));
    }
}

async function createMultiple(whitelistData) {
    //Initialize
    let error, result, rejectObject, resolveObject;
    try {
        if(whitelistData.length > 0){
            [error, result] = await To(WhitelistModel.insertMany(whitelistData));
            if (error) {
                return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.WHITELIST.CREATE_MULTIPLE.ERROR));
            } else {
                resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.ASSETMGMT.WHITELIST.CREATE_MULTIPLE.SUCCESS,
                    null
                );
                resolveObject.setData(result);
                return Promise.resolve(resolveObject.jsonObject());
            }
        }
    } catch (error) {
        return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.WHITELIST.CREATE_MULTIPLE.ERROR));
    }
}


async function getOneWhitelistedUser(player, coach) {
    let error, result, resolveObject, rejectObject;
    try {
        let query = {};
        if (Object.keys(player).length > 0) {
            query = {
                'playerIdentifier.type': player.type,
                'playerIdentifier.id': player.id
            };
        } else {
            query = {
                'coachIdentifier.type': coach.type,
                'coachIdentifier.id': coach.id
            };
        }
        [error, result] = await To(WhitelistModel.findOne(query).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.WHITELIST.GET_ONE.ERROR));
        }
        // Response
        if (result && ((player.id === result.playerIdentifier.id) || (coach.id === result.coachIdentifier.id))) {
            resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.WHITELIST.GET_ONE.SUCCESS,
                null
            );
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.WHITELIST.GET_ONE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (error) {
        return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.WHITELIST.GET_ONE.ERROR));
    }
};

async function deleteOneWhitelistedUser(identifier) {
    //Initialize
    let error, result, rejectObject, resolveObject;
    try {
        [error, result] = await To(WhitelistModel.findOneAndRemove({ 'playerIdentifier.id': identifier }).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.WHITELIST.DELETE_ONE.ERROR));
        }
        // Response
        if (result) {
            resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.WHITELIST.DELETE_ONE.SUCCESS,
                null
            );
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.WHITELIST.DELETE_ONE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (error) {
        return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.WHITELIST.DELETE_ONE.ERROR));
    }
};

async function deleteMultiple(identifiers) {
    //Initialize
    let error, result, rejectObject, resolveObject;
    try {
        [error, result] = await To(WhitelistModel.deleteMany({ 'playerIdentifier.id': { $in: identifiers } }).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.WHITELIST.DELETE_MULTIPLE.ERROR));
        }
        // Response
        if (result.deletedCount !== 0) {
            resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.WHITELIST.DELETE_MULTIPLE.SUCCESS,
                null
            );
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.WHITELIST.DELETE_MULTIPLE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (error) {
        return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.WHITELIST.DELETE_MULTIPLE.ERROR));
    }
};

async function updateCoach(identifier, newIdentifier) {
    //Initialize
    let error, result, rejectObject, resolveObject;
    try {
        [error, result] = await To(WhitelistModel.updateMany({ 'coachIdentifier.id': identifier }, { $set: { 'coachIdentifier.id': newIdentifier } }).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.WHITELIST.UPDATE_ONE.ERROR));
        }
        // Response
        if (result.modifiedCount !== 0) {
            resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.WHITELIST.UPDATE_ONE.SUCCESS,
                null
            );
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.WHITELIST.UPDATE_ONE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (error) {
        return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.WHITELIST.UPDATE_ONE.ERROR));
    }
}