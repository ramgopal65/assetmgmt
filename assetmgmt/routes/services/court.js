module.exports = {
    createOne: createOne,
    getOne: getOne,
    createMultiple: createMultiple,
    updateOne: updateOne,
    deleteOneById: deleteOneById
};

//Imports
const CourtModel = require('../models/court');
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
}

async function createOne(court) {
    //Initialize
    let error, result, rejectObject, resolveObject;
    try {
        [error, result] = await To(CourtModel(court).save());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.CREATE_ONE.ERROR));
        } else {
            resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.COURT.CREATE_ONE.SUCCESS,
                null
            );
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (error) {
        return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.COURT.CREATE_ONE.ERROR));
    }
}

async function getOne(searchQuery) {
    let error, result, rejectObject, resolveObject;
    try {
        let { name, court } = searchQuery;
        [error, result] = await To(CourtModel.aggregate([
            { $match: { name } },
            { $unwind: '$courts' },
            { $match: { 'courts.name': court } },
            { $project: { 'courts.cameras.name': 1, 'courts.name': 1, _id: 0 } }
        ]));
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.GET_ONE.ERROR));
        } else {
            resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.COURT.GET_ONE.SUCCESS,
                null
            );
            if (result && result.length > 0) {
                const courtData = result[0].courts;
                const cameraNames = courtData.cameras.map(camera => `${name}.${court}.${camera.name}`);
                resolveObject.setData({ cameras: cameraNames });
                return Promise.resolve(resolveObject.jsonObject());
            } else {
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                    Constants.ASSETMGMT.COURT.GET_ONE.ERROR,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                return Promise.reject(rejectObject.jsonObject());
            }
        }
    } catch (error) {
        return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.COURT.GET_ONE.ERROR));
    }
}

async function createMultiple(courtDetails) {
    //Initialize
    let error, result, resolveObject;
    try {
        if (courtDetails.length > 0) {
            [error, result] = await To(CourtModel.insertMany(courtDetails));
            if (error) {
                return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.COURT.CREATE_MULTIPLE.ERROR));
            } else {
                resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.ASSETMGMT.COURT.CREATE_MULTIPLE.SUCCESS,
                    null
                );
                resolveObject.setData(result);
                return Promise.resolve(resolveObject.jsonObject());
            }
        }
    } catch (error) {
        return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.COURT.CREATE_MULTIPLE.ERROR));
    }
}

async function updateOne(userId, courtDetails) {
    //Initialize
    let error, result, rejectObject, resolveObject;
    try {
        [error, result] = await To(CourtModel.findByIdAndUpdate(userId, courtDetails).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.COURT.UPDATE_ONE.ERROR));
        }
        // Response
        if (result) {
            resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.COURT.UPDATE_ONE.SUCCESS,
                null
            );
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.COURT.UPDATE_ONE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (error) {
        return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.COURT.UPDATE_ONE.ERROR));
    }
}

async function deleteOneById(courtId) {
    //Initialize
    let error, result, rejectObject, resolveObject;
    try {
        [error, result] = await To(CourtModel.findByIdAndRemove(courtId).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.COURT.DELETE_ONE.ERROR));
        }

        if (result && (result._id.equals(courtId))) {
            resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.COURT.DELETE_ONE.SUCCESS,
                null
            );

            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.COURT.DELETE_ONE.ERROR_ID_NOT_FOUND,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (error) {
        return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.COURT.DELETE_ONE.ERROR));
    }
}