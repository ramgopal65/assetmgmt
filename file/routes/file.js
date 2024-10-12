const express = require('express');
const router = express.Router();
const CommonConstants = require('../../common/constant/constant');
const Constants = require('../constant/constant');
const ResponseInterceptor = require('../../interceptors/res-send');
const FileController = require('./controllers/file');
const RejectData = require('../../common/response/reject-data');

// HEALTH
router.get('/health', (req, res) => {
    res.json({ code: 200, message: 'Healthy' });
});

router.get(
    '/all',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                resource: Constants.FILE.APP_ACTION.RESOURCE.FILE,
                action: Constants.FILE.APP_ACTION.ACTION.FILE.CHUNK_READ
            }
        };
        next();
    },
    FileController.getOneFolder,
    ResponseInterceptor.sendResponse
);

router.get(
    '/',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                resource: Constants.FILE.APP_ACTION.RESOURCE.FILE,
                action: Constants.FILE.APP_ACTION.ACTION.FILE.CHUNK_READ
            }
        };
        next();
    },
    FileController.getOneFileStream,
    ResponseInterceptor.sendResponse
);

router.put(
    '/',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                resource: Constants.FILE.APP_ACTION.RESOURCE.FILE,
                action: Constants.FILE.APP_ACTION.ACTION.FILE.CHUNK_UPLOAD
            }
        };
        next();
    },
    (req, res, next) => {
        if (req.header('streamsize')) {
            if ((req.header('streamsize') <= 300 * 1024 * 1024)) {
                next();
            } else {
                //TODO1000 get above limit from settings
                let rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                    Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.ERROR_CONTENT_TOO_LARGE,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                req.trace.response = rejectObject.jsonObject();
                ResponseInterceptor.sendResponse(req, res, next);
            }

        } else {
            let rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.ERROR_STREAM_SIZE_NOT_AVAILABLE,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            req.trace.response = rejectObject.jsonObject();
            ResponseInterceptor.sendResponse(req, res, next);

        }
    },
    FileController.createOneFileFromStream,
    ResponseInterceptor.sendResponse
);


router.delete(
    '/',
    (req, res, next) => {
        req.trace = {
            type: CommonConstants.COMMON.APP_ACTION.TYPE.REST_API,
            request: {
                resource: Constants.FILE.APP_ACTION.RESOURCE.FILE,
                action: Constants.FILE.APP_ACTION.ACTION.FILE.DELETE
            }
        };
        next();
    },
    FileController.deleteOneFile,
    ResponseInterceptor.sendResponse
);

module.exports = router;