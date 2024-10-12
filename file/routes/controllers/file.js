module.exports = {
    createOneFileFromStream: createOneFileFromStream,
    getOneFileStream: getOneFileStream,
    getOneFolder: getOneFolder,
    deleteOneFile: deleteOneFile
};

// Imports
const FilesHelper = require('../helpers/file');
const SettingsKey = require('../../setting/keys');
const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');
const Constants = require('../../constant/constant');
const RejectData = require('../../../common/response/reject-data');
const CommonConstants = require('../../../common/constant/constant');
const To = require('../../../common/to/to');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function createOneFileFromStream(req, res, next) {
    //Initiliaze
    let error, result;

    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;

    try {
        //Validating the incoming requests
        if (!req.headers.destinationfilepath) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.headers.destinationfilepath');
            req.trace.response = rejectObject.jsonObject();
            next();
        } else if (!req.headers.streamsize) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.headers.streamsize');
            req.trace.response = rejectObject.jsonObject();
            next();
        } else if (!(req.headers.streamsize <= 300 * 1024 * 1024)) {
            //TODO1000 get this limit from settings
            rejectObject.appendMessage(Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.ERROR_CONTENT_TOO_LARGE);
            rejectObject.appendMessage('req.headers.streamsize');
            req.trace.response = rejectObject.jsonObject();
            next();
        } else {
            [error, result] = await To(FilesHelper.createOneFileFromStream(req,
                req.headers.streamsize,
                req.headers.destinationfilepath)
            );
            req.trace.response = error || result;
            next();
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function getOneFileStream(req, res, next) {
    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.FILE.GET_ONE_FILE_STREAM.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    try {
        //Initiliaze
        let error, result;

        let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
        const path = req.url.split('?')[1];

        //Validating the incoming requests
        if (!path) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.url');
            req.trace.response = rejectObject.jsonObject();
            next();
        } else {
            //Receive the file using file helper function
            error = result = null;
            [error, result] = await To(FilesHelper.getOneFileStream(decodeURI(path)));
            req.trace.response = error || result;
            next();
        }
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.FILE.GET_ONE_FILE_STREAM.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function deleteOneFile(req, res, next) {
    //Initiliaze
    let error, result;

    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.FILE.DELETE_ONE_FILE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
    const path = req.url.split('?')[1];

    try {
        if (!path) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.url');
            req.trace.response = rejectObject.jsonObject();
            next();
        } else {
            //Deleting the object from the bucket
            [error, result] = await To(FilesHelper.deleteOneFile(path));

            req.trace.response = error || result;
            next();
        }

    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.FILE.DELETE_ONE_FILE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function getOneFolder(req, res, next) {
    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.FILE.GET_ONE_FILE_STREAM.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    try {
        //Initiliaze
        let error, result;

        let msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
        const path = req.url.split('?')[1];

        //Validating the incoming requests
        if (!path) {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage('req.url');
            req.trace.response = rejectObject.jsonObject();
            next();
        } else {
            //Receive the file using file helper function
            error = result = null;
            [error, result] = await To(FilesHelper.getOneFolder(decodeURI(path)));
            req.trace.response = error || result;
            next();
        }
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.FILE.GET_ONE_FILE_STREAM.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        req.trace.response = rejectObject.jsonObject();
        next();
    }
}