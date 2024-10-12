module.exports = {
    sendResponse: sendResponse
};

// Imports
const CommonConstants = require('../common/constant/constant');
const RejectData = require('../common/response/reject-data');
const Stream = require('stream');

async function sendResponse(req, res, next) {
    try {
        // Response
        if (req.trace.response.code === CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE) {
            if (req.trace.response.data &&
                req.trace.response.data.stream &&
                (req.trace.response.data.stream instanceof Stream.Readable)) {
                //TODO - when piping a stream, exit after drain is completed
                console.log(`${req.trace.request.resource}, ${req.trace.request.action}, ${req.trace.response.code}, ${req.trace.response.message}, ${CommonConstants.COMMON.APP_HTTP.SEND.SUCCESS_PIPE}`);
            } else {
                console.log(`${req.trace.request.resource}, ${req.trace.request.action}, ${req.trace.response.code}, ${req.trace.response.message}, ${CommonConstants.COMMON.APP_HTTP.SEND.SUCCESS}`);
            }
        } else {
            console.error(`${req.trace.request.resource}, ${req.trace.request.action}, ${req.trace.response.code}, ${req.trace.response.message}, ${req.trace.response.type}`);
        }

        //TODO - delete trace before sending out
        if (req.trace.response.data &&
            req.trace.response.data.stream &&
            (req.trace.response.data.stream instanceof Stream.Readable)) {
            if (req.trace.response.data.streamSize) {
                res.setHeader('streamSize', req.trace.response.data.streamSize);
            }
            if (req.trace.response.data.fileName) {
                res.setHeader('fileName', req.trace.response.data.fileName);
            }
            if (req.trace.response.data.contentType) {
                res.setHeader('Content-Type', req.trace.response.data.contentType);
            }
            req.trace.response.data.stream.pipe(res);
        } else {
            res.status(req.trace.response.code).send(req.trace.response);
        }
    } catch (e) {
        console.log(e);
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            CommonConstants.COMMON.APP_HTTP.SEND.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        if (e.message) {
            rejectObject.appendMessage(e.message);
        }
        res.status(rejectObject.code).send(rejectObject.jsonObject());
    }
}
