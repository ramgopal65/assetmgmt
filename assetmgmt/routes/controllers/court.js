module.exports = {
    createOne: createOne,
    getOne: getOne,
    createMultiple: createMultiple,
    updateOne: updateOne,
    deleteOneById: deleteOneById
};

//Imports
const To = require('../../../common/to/to');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const RejectData = require('../../../common/response/reject-data');
const CourtHelper = require('../helpers/court');
const CommonValidator = require('../../../common/validate/validator');

async function createOne(req, res, next) {
    let rejectObject;
    try {
        let error, result;

        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.ASSETMGMT.COURT.CREATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);

        let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;

        if (!req.body) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body');
            req.trace.response = rejectObject.jsonObject();
        } else if (!req.body.name) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.name');
            req.trace.response = rejectObject.jsonObject();
        } else if (!(req.body.courts && CommonValidator.isNonEmptyArray(req.body.courts))) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.courts');
            req.trace.response = rejectObject.jsonObject();
        } else {
            let courtLen = req.body.courts.length;
            let success = true;
            for (let i = 0; i < courtLen; i++) {
                if (!req.body.courts[i].name) {
                    success = false;
                    rejectObject.appendMessage(msg);
                    rejectObject.appendMessage('req.body.courts[' + i + '].name');
                    req.trace.response = rejectObject.jsonObject();
                    break;
                } else if (!(req.body.courts[i].cameras && CommonValidator.isNonEmptyArray(req.body.courts[i].cameras))) {
                    success = false;
                    rejectObject.appendMessage(msg);
                    rejectObject.appendMessage('req.body.courts[' + i + '].cameras');
                    req.trace.response = rejectObject.jsonObject();
                    break;
                } else {
                    let camLen = req.body.courts[i].cameras.length;
                    for (let j = 0; j < camLen; j++) {
                        if (!req.body.courts[i].cameras[j].name) {
                            success = false;
                            rejectObject.appendMessage(msg);
                            rejectObject.appendMessage('req.body.courts[' + i + '].cameras[' + j + '].name');
                            req.trace.response = rejectObject.jsonObject();
                            break;
                        }
                    }
                    if (!success) {
                        break;
                    }
                }
            }

            if (success) {
                [error, result] = await To(CourtHelper.createOne(req.trace.caller, req.body));
                req.trace.response = error || result;
            }
        }
        next();
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.COURT.CREATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

async function getOne(req, res, next) {
    let error, result, rejectObject;
    rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.COURT.GET_ONE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    try {
        let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
        if (!req.body) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body');
            req.trace.response = rejectObject.jsonObject();
        } else if (!req.body.name) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.name');
            req.trace.response = rejectObject.jsonObject();
        } else if (!req.body.court) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.court');
            req.trace.response = rejectObject.jsonObject();
        } else {
            [error, result] = await To(CourtHelper.getOne(req.body));
            req.trace.response = error || result;
        }
        next();
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.COURT.GET_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

async function createMultiple(req, res, next) {
    let error, result, rejectObject;
    rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.COURT.CREATE_MULTIPLE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
    try {
        if (!req.file && req.file.buffer === 0) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.file');
            req.trace.response = rejectObject.jsonObject();
        } else {
            [error, result] = await To(CourtHelper.createMultiple(req.trace.caller, req.file.buffer));
            req.trace.response = error || result;

        }
        next();
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.COURT.CREATE_MULTIPLE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

async function updateOne(req, res, next){
    let error, result, rejectObject;
    rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.COURT.UPDATE_ONE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
    try {
        if (!req.body) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body');
        } else if(!req.params._id){
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.params._id');
        }else {
            [error, result] = await To(CourtHelper.updateOne(req.params._id, req.body));
            req.trace.response = error || result;
            next();    
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.COURT.UPDATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}


async function deleteOneById(req, res, next) {
    let error, result, rejectObject;
    rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.COURT.DELETE_ONE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
    try {
        if (!req.params._id) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.params._id');
        }
        [error, result] = await To(CourtHelper.deleteOneById(req.params._id));
        req.trace.response = error || result;
        next();
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.COURT.DELETE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}
