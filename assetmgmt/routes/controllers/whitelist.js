module.exports = {
    createOne: createOne,
    getOneWhitelistedUser: getOneWhitelistedUser,
    createMultiple: createMultiple,
    updateCoach: updateCoach,
    deleteOneWhitelistedUser: deleteOneWhitelistedUser,
    deleteMultiple: deleteMultiple
}

//Imports
const To = require('../../../common/to/to');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const RejectData = require('../../../common/response/reject-data');
const WhitelistHelper = require('../helpers/whitelist');

async function createOne(req, res, next) {
    try {
        let error, result, rejectObject;

        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.ASSETMGMT.WHITELIST.CREATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null);

        let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
        if (!req.body) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body');
        } else {
            [error, result] = await To(WhitelistHelper.createOne(req.body));
            req.trace.response = error || result;
            next();
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.WHITELIST.CREATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
};

async function createMultiple(req, res, next) {
    let error, result, rejectObject;
    rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.WHITELIST.CREATE_MULTIPLE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
    try {
        if (!req.file || !req.file.buffer) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.file');
            req.trace.response = rejectObject.jsonObject();
            next();
        } else {
            [error, result] = await To(WhitelistHelper.createMultiple(req.trace.caller, req.file.buffer));
            req.trace.response = error || result;
            next();
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.WHITELIST.CREATE_MULTIPLE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
};

async function getOneWhitelistedUser(req, res, next) {
    let error, result, rejectObject;
    rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.WHITELIST.GET_ONE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
    try {
        if (!req.body) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body');
        }

        if (!req.body && !req.body.phone && !req.body.phone.cc && !req.body.phone.number) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.phone');
        }
        if (!req.body && !req.body.role) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.role');
        }
        if (!req.body && !req.body.hierarchyCode) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.hierarchyCode');
        }
        if (!req.body && !req.body.email) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.email');
        }

        [error, result] = await To(WhitelistHelper.getOneWhitelistedUser(req.body));
        req.trace.response = error || result;
        next();
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.WHITELIST.GET_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
};

async function deleteOneWhitelistedUser(req, res, next) {
    let error, result, rejectObject;
    rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.WHITELIST.DELETE_ONE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
    try {
        if (!req.body) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body');
        } else if (!req.body && !req.body.phone.cc && !req.body.phone.number) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.phone');
        } else if (!req.body && !req.body.email) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body.email');
        } else {
            let playerIdentifier = {};
            if (req.body.phone && (req.body.role === "player")) {
                playerIdentifier.id = req.body.phone.cc + req.body.phone.number;
            }
            if (req.body.email && (req.body.role === "player")) {
                playerIdentifier.id = req.body.email;
            }
            [error, result] = await To(WhitelistHelper.deleteOneWhitelistedUser(playerIdentifier));
            req.trace.response = error || result;
            next();
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.WHITELIST.DELETE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
};

async function deleteMultiple(req, res, next) {
    let error, result, rejectObject;
    rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.WHITELIST.DELETE_MULTIPLE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
    try {
        if (!req.body && (Array.isArray(req.body) !== true)) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body');
        } else {
            let identifiers = [];
            let inputArrayData = req.body;
            await inputArrayData.forEach((inputData) => {
                let playerIdentifier = {};
                if (inputData && inputData.phone) {
                    playerIdentifier.id = inputData.phone.cc + inputData.phone.number;
                    identifiers.push(playerIdentifier.id);
                } else {
                    playerIdentifier.id = inputData.email;
                    identifiers.push(playerIdentifier.id);
                }
            });
            [error, result] = await To(WhitelistHelper.deleteMultiple(identifiers));
            req.trace.response = error || result;
            next();
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.WHITELIST.DELETE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
};

async function updateCoach(req, res, next) {
    let error, result, rejectObject;
    rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.WHITELIST.UPDATE_ONE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
    try {
        if (!req.body) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.body');
        } else {
            let coachIdentifier = {};
            let newCoachIdentifier = {};
            if (req.body && req.body.coach.phone) {
                coachIdentifier.id = req.body.coach.phone.cc + req.body.coach.phone.number;
                newCoachIdentifier.id = req.body.newCoach.phone.cc + req.body.newCoach.phone.number;
            } else {
                coachIdentifier.id = req.body.coach.email;
                newCoachIdentifier.id = req.body.newCoach.email;
            }
            [error, result] = await To(WhitelistHelper.updateCoach(coachIdentifier, newCoachIdentifier));
            req.trace.response = error || result;
            next();
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.WHITELIST.UPDATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}