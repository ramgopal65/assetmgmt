module.exports = {
    createOneFileFromStream: createOneFileFromStream,
    getOneFileStream: getOneFileStream,
    getOneFolder: getOneFolder,
    deleteOneFile: deleteOneFile
};

const SettingsKey = require('../../setting/keys');
const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');
const RejectData = require('../../../common/response/reject-data');
const ResolveData = require('../../../common/response/resolve-data');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const To = require('../../../common/to/to');
const { PassThrough } = require('stream');
var Path = require('path');
const debugDumpUploadStreamToDisk = false;
const debugDumpDownloadStreamToDisk = false;
const fs = require('fs');


const Region = SettingsMap.get(SettingsKey.FILE.AWS.REGION_S3);
const AccessKeyId = SettingsMap.get(SettingsKey.FILE.AWS.KEY_ID_S3);
const SecretAccessKey = SettingsMap.get(SettingsKey.FILE.AWS.SECRET_KEY_S3);

////For delete
const { DeleteObjectCommand, S3Client } = require('@aws-sdk/client-s3');
// Configure AWS client
const s3Client = new S3Client({
    region: Region,
    credentials: {
        accessKeyId: AccessKeyId,
        secretAccessKey: SecretAccessKey
    }
});
////For delete

////For upload and download in streams
const AWS = require('aws-sdk');
AWS.config.update({
    region: Region,
    credentials: {
        accessKeyId: AccessKeyId,
        secretAccessKey: SecretAccessKey
    }
});
var s3ClientForStreaming = new AWS.S3({});
////For upload and download in streams

var BucketName = SettingsMap.get(SettingsKey.FILE.AWS.BUCKET_NAME);
function handleS3Error(s3Error, message) {
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.UNKNOWN.CODE,
        message,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null,
        null,
    );
    if (s3Error.statusCode) {
        rejectObject.setCode(s3Error.statusCode);
    } else {
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
    }
    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
    if (s3Error.code) {
        rejectObject.appendMessage(s3Error.code);
    }
    return rejectObject.jsonObject();
}

/**
 * @param {*} path 
 * @param {*} ipstream 
 */
async function createOneFileFromStream(inputStream, streamSize, destinationFilePath) {
    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.SUCCESS,
        null);
    try {
        let error, result;

        ///////////////////////
        const monitor = new PassThrough();
        var outputStream = new PassThrough();
        let consolidatedInputSizeMon = 0;
        let consolidatedOutputSizeMon = 0;
        let streamSizeMismatchError = false;
        var debugWriteStream = null;
        var fileName = Path.parse(destinationFilePath).base;
        if (debugDumpUploadStreamToDisk) {
            if (fs.existsSync('./debugUpload')) {
                debugWriteStream = fs.createWriteStream('./debugUpload/' + fileName);
            } else {
                console.log(Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.ERROR_DEBUG_PATH_NOT_AVAILABLE);
            }
        }

        //------------------------------------
        outputStream.on('error', function (err) {
            //console.log('fileserver -> outputStream stream progress in error = ' + consolidatedOutputSizeMon * 100 / streamSize, err);
        });
        outputStream.on('drain', function () {
            //console.log('fileserver -> outputStream stream progress in drain = ' + consolidatedOutputSizeMon * 100 / streamSize);
        });
        outputStream.on('unpipe', function () {
            //console.log('fileserver -> outputStream stream progress in unpipe = ' + consolidatedOutputSizeMon * 100 / streamSize);
        });
        outputStream.on('close', function () {
            //console.log('fileserver -> outputStream stream progress in close = ' + consolidatedOutputSizeMon * 100 / streamSize);
        });
        outputStream.on('data', (chunk) => {
            consolidatedOutputSizeMon += chunk.length;
            //console.log('heap mem usage - ' + process.memoryUsage().heapUsed);
            //console.log('fileserver -> outputStream stream progress in data = ' + consolidatedOutputSizeMon * 100 / streamSize);
        });
        outputStream.on('end', () => {
            //console.log('fileserver -> outputStream stream progress in end = ' + consolidatedOutputSizeMon * 100 / streamSize);
        });
        outputStream.on('finish', () => {
            //console.log('fileserver -> outputStream stream progress in finish = ' + consolidatedOutputSizeMon * 100 / streamSize);
        });

        //------------------------------------

        //debugWriteStream.on('error', function (err) {
        //    console.log('fileserver -> debugWriteStream stream progress in error = ' + consolidatedUploadSizeMon * 100 / streamSize, err);
        //});
        //debugWriteStream.on('drain', function () {
        //    console.log('fileserver -> debugWriteStream stream progress in drain = ' + consolidatedUploadSizeMon * 100 / streamSize);
        //});
        //debugWriteStream.on('unpipe', function () {
        //    console.log('fileserver -> debugWriteStream stream progress in unpipe = ' + consolidatedUploadSizeMon * 100 / streamSize);
        //});
        //debugWriteStream.on('close', function () {
        //    console.log('fileserver -> debugWriteStream stream progress in close = ' + consolidatedUploadSizeMon * 100 / streamSize);
        //});
        //debugWriteStream.on('data', (chunk) => {
        //    consolidatedUploadSizeMon += chunk.length;
        //    if (consolidatedUploadSizeMon > streamSize) {
        //        uploadStream.close();
        //        if (debugDumpUploadStreamToDisk) {
        //            debugWriteStream.end();
        //        }
        //        rejectObject.appendMessage(Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.ERROR_STREAM_SIZE_MATCHING_HEADER);
        //        return Promise.reject(rejectObject.jsonObject());
        //    }
        //    //console.log('heap mem usage - ' + process.memoryUsage().heapUsed);
        //    console.log('fileserver -> debugWriteStream stream progress in data = ' + consolidatedUploadSizeMon * 100 / streamSize);
        //});
        //debugWriteStream.on('end', () => {
        //    console.log('fileserver -> debugWriteStream stream progress in end = ' + consolidatedUploadSizeMon * 100 / streamSize);
        //});
        //debugWriteStream.on('finish', () => {
        //    console.log('fileserver -> debugWriteStream stream progress in finish = ' + consolidatedUploadSizeMon * 100 / streamSize);
        //});

        //------------------------------------

        inputStream.on('error', function (err) {
            //console.log('fileserver -> uploadStream stream progress in error = ' + consolidatedInputSizeMon * 100 / streamSize, err);
        });
        inputStream.on('drain', function () {
            //console.log('fileserver -> uploadStream stream progress in drain = ' + consolidatedInputSizeMon * 100 / streamSize);
        });
        inputStream.on('unpipe', function () {
            //console.log('fileserver -> uploadStream stream progress in unpipe = ' + consolidatedInputSizeMon * 100 / streamSize);
        });
        inputStream.on('close', function () {
            //console.log('fileserver -> uploadStream stream progress in close = ' + consolidatedInputSizeMon * 100 / streamSize);
        });
        inputStream.on('data', (chunk) => {
            consolidatedInputSizeMon += chunk.length;
            if (consolidatedInputSizeMon > streamSize) {
                streamSizeMismatchError = true;
                //console.log('fileserver -> uploadStream stream progress in data = ' + consolidatedInputSizeMon * 100 / streamSize);
                if (outputStream) {
                    outputStream.destroy(Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.ERROR_STREAM_SIZE_NOT_MATCHING_HEADER);
                    outputStream = null;
                }
            }
            //console.log('heap mem usage - ' + process.memoryUsage().heapUsed);
            //console.log('fileserver -> uploadStream stream progress in data = ' + consolidatedInputSizeMon * 100 / streamSize);
        });
        inputStream.on('end', () => {
            if (consolidatedInputSizeMon != streamSize) {
                streamSizeMismatchError = true;
                if (outputStream) {
                    outputStream.destroy(Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.ERROR_STREAM_SIZE_NOT_MATCHING_HEADER);
                    outputStream = null;
                }
            }
            //console.log('fileserver -> uploadStream stream progress in end = ' + consolidatedInputSizeMon * 100 / streamSize);
        });
        inputStream.on('finish', () => {
            //console.log('fileserver -> uploadStream stream progress in finish = ' + consolidatedInputSizeMon * 100 / streamSize);
        });
        ///////////////////////

        var uploadParams;
        outputStream = inputStream.pipe(monitor);
        if (debugDumpUploadStreamToDisk && debugWriteStream) {
            monitor.pipe(debugWriteStream);
        }
        uploadParams = {
            Bucket: BucketName,
            Key: destinationFilePath,
            Body: outputStream
        };
        error = result = null;
        [error, result] = await To(s3ClientForStreaming.upload(uploadParams).promise());

        if (debugDumpUploadStreamToDisk && debugWriteStream) {
            debugWriteStream.end();
        }
        if (result) {
            if (streamSizeMismatchError) {
                let rejObj = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                    Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.ERROR,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                rejObj.appendMessage(Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.ERROR_STREAM_SIZE_NOT_MATCHING_HEADER);
                return Promise.reject(rejObj.jsonObject());
            } else {
                resolveObject.setData({ path: result.Key });
                return Promise.resolve(resolveObject.jsonObject());
            }
        } else {
            if (streamSizeMismatchError) {
                let rejObj = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                    Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.ERROR,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                rejObj.appendMessage(Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.ERROR_STREAM_SIZE_NOT_MATCHING_HEADER);
                return Promise.reject(rejObj.jsonObject());
            } else {
                return Promise.reject(handleS3Error(error, Constants.FILE.CREATE_ONE_FILE_FROM_STREAM.ERROR));
            }
        }
    } catch (e) {
        if (debugDumpUploadStreamToDisk && debugWriteStream) {
            debugWriteStream.end();
        }
        rejectObject.appendMessage(e.message);
        rejectObject.setDetails(e);
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
        return Promise.reject(rejectObject.jsonObject());
    }
}

async function getOneFileStream(path) {
    let error, result;
    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.FILE.GET_ONE_FILE_STREAM.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.FILE.GET_ONE_FILE_STREAM.SUCCESS,
        null
    );
    try {
        var getObjectParams = {
            Bucket: BucketName,
            Key: path,
        };
        [error, result] = await To(s3ClientForStreaming.headObject(getObjectParams).promise());
        if (result) {
            if (result.ContentLength > 300 * 1024 * 1024) {
                //TODO1000 get above limit from settings
                rejectObject.appendMessage(Constants.FILE.GET_ONE_FILE_STREAM.ERROR_TOO_LARGE);
                return Promise.reject(rejectObject.jsonObject());
            } else {
                let streamSize = result.ContentLength;
                /////////////////////////
                const monitor = new PassThrough();
                let consolidatedInputSizeMon = 0;
                let consolidatedOutputSizeMon = 0;
                let streamSizeMismatchError = false;
                var debugWriteStream = null;
                var fileName = Path.parse(path).base;
                var outputStream = new PassThrough();
                if (debugDumpDownloadStreamToDisk) {
                    if (fs.existsSync('./debugDownload')) {
                        debugWriteStream = fs.createWriteStream('./debugDownload/' + fileName);
                    } else {
                        console.log(Constants.FILE.GET_ONE_FILE_STREAM.ERROR_DEBUG_PATH_NOT_AVAILABLE);
                    }
                }
                var inputStream = s3ClientForStreaming.getObject(getObjectParams).createReadStream();
                outputStream = inputStream.pipe(monitor);

                //------------------------------------
                outputStream.on('error', function (err) {
                    //console.log('fileserver -> outputStream stream progress in error = ' + consolidatedOutputSizeMon * 100 / streamSize, err);
                });
                outputStream.on('drain', function () {
                    //console.log('fileserver -> outputStream stream progress in drain = ' + consolidatedOutputSizeMon * 100 / streamSize);
                });
                outputStream.on('unpipe', function () {
                    //console.log('fileserver -> outputStream stream progress in unpipe = ' + consolidatedOutputSizeMon * 100 / streamSize);
                });
                outputStream.on('close', function () {
                    //console.log('fileserver -> outputStream stream progress in close = ' + consolidatedOutputSizeMon * 100 / streamSize);
                });
                outputStream.on('data', (chunk) => {
                    consolidatedOutputSizeMon += chunk.length;
                    //console.log('heap mem usage - ' + process.memoryUsage().heapUsed);
                    //console.log('fileserver -> outputStream stream progress in data = ' + consolidatedOutputSizeMon * 100 / streamSize);
                });
                outputStream.on('end', () => {
                    //console.log('fileserver -> outputStream stream progress in end = ' + consolidatedOutputSizeMon * 100 / streamSize);
                });
                outputStream.on('finish', () => {
                    //console.log('fileserver -> outputStream stream progress in finish = ' + consolidatedOutputSizeMon * 100 / streamSize);
                });

                //------------------------------------

                //debugWriteStream.on('error', function (err) {
                //    console.log('fileserver -> debugWriteStream stream progress in error = ' + consolidatedUploadSizeMon * 100 / streamSize, err);
                //});
                //debugWriteStream.on('drain', function () {
                //    console.log('fileserver -> debugWriteStream stream progress in drain = ' + consolidatedUploadSizeMon * 100 / streamSize);
                //});
                //debugWriteStream.on('unpipe', function () {
                //    console.log('fileserver -> debugWriteStream stream progress in unpipe = ' + consolidatedUploadSizeMon * 100 / streamSize);
                //});
                //debugWriteStream.on('close', function () {
                //    console.log('fileserver -> debugWriteStream stream progress in close = ' + consolidatedUploadSizeMon * 100 / streamSize);
                //});
                //debugWriteStream.on('data', (chunk) => {
                //    console.log('heap mem usage - ' + process.memoryUsage().heapUsed);
                //    console.log('fileserver -> debugWriteStream stream progress in data = ' + consolidatedUploadSizeMon * 100 / streamSize);
                //});
                //debugWriteStream.on('end', () => {
                //    console.log('fileserver -> debugWriteStream stream progress in end = ' + consolidatedUploadSizeMon * 100 / streamSize);
                //});
                //debugWriteStream.on('finish', () => {
                //    console.log('fileserver -> debugWriteStream stream progress in finish = ' + consolidatedUploadSizeMon * 100 / streamSize);
                //});

                //------------------------------------
                inputStream.on('error', function (err) {
                    //console.log('fileserver -> uploadStream stream progress in error = ' + consolidatedInputSizeMon * 100 / streamSize, err);
                });
                inputStream.on('drain', function () {
                    //console.log('fileserver -> uploadStream stream progress in drain = ' + consolidatedInputSizeMon * 100 / streamSize);
                });
                inputStream.on('unpipe', function () {
                    //console.log('fileserver -> uploadStream stream progress in unpipe = ' + consolidatedInputSizeMon * 100 / streamSize);
                });
                inputStream.on('close', function () {
                    //console.log('fileserver -> uploadStream stream progress in close = ' + consolidatedInputSizeMon * 100 / streamSize);
                });
                inputStream.on('data', (chunk) => {
                    consolidatedInputSizeMon += chunk.length;
                    if (consolidatedInputSizeMon > streamSize) {
                        streamSizeMismatchError = true;
                        inputStream.destroy(Constants.FILE.GET_ONE_FILE_STREAM.ERROR_STREAM_SIZE_NOT_MATCHING_HEADER);
                    }
                    //console.log('heap mem usage - ' + process.memoryUsage().heapUsed);
                    //console.log('fileserver -> uploadStream stream progress in data = ' + consolidatedInputSizeMon * 100 / streamSize);
                });
                inputStream.on('end', () => {
                    if (consolidatedInputSizeMon != streamSize) {
                        streamSizeMismatchError = true;
                        inputStream.destroy(Constants.FILE.GET_ONE_FILE_STREAM.ERROR_STREAM_SIZE_NOT_MATCHING_HEADER);
                    }
                    //console.log('fileserver -> uploadStream stream progress in end = ' + consolidatedInputSizeMon * 100 / streamSize);
                });
                inputStream.on('finish', () => {
                    //console.log('fileserver -> uploadStream stream progress in finish = ' + consolidatedInputSizeMon * 100 / streamSize);
                });
                /////////////////////////

                resolveObject.setData(
                    {
                        isStream: true,
                        streamSize: result.ContentLength,
                        stream: outputStream,
                        fileName: fileName,
                        contentType: result.ContentType
                    }
                );

                if (debugDumpDownloadStreamToDisk && debugWriteStream) {
                    monitor.pipe(debugWriteStream);
                }
              
                if (streamSizeMismatchError) {
                    let rejObj = new RejectData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                        Constants.FILE.GET_ONE_FILE_STREAM.ERROR,
                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                        null);
                    rejObj.appendMessage(Constants.FILE.GET_ONE_FILE_STREAM.ERROR_STREAM_SIZE_NOT_MATCHING_HEADER);
                    return Promise.reject(rejObj.jsonObject());

                } else {
                    return Promise.resolve(resolveObject.jsonObject());
                }
            }
        } else {
            return Promise.reject(handleS3Error(error, Constants.FILE.GET_ONE_FILE_STREAM.ERROR));
        }
    } catch (e) {
        if (debugDumpDownloadStreamToDisk && debugWriteStream) {
            debugWriteStream.end();
        }
        rejectObject.setDetails(e);
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

async function deleteOneFile(path) {
    let error, result;
    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.FILE.DELETE_ONE_FILE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM,
        null);

    let resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.FILE.DELETE_ONE_FILE.SUCCESS,
        null
    );

    //Creating params
    const params = { Bucket: BucketName, Key: path };
    try {
        //Getting response from the AWS S3 bucket
        [error, result] = await To(s3Client.send(new DeleteObjectCommand(params)));
        if (result) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            return Promise.reject(handleS3Error(error, Constants.FILE.DELETE_ONE_FILE.ERROR));
        }
    } catch (e) {
        rejectObject.appendMessage(e.message);
        rejectObject.setData(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}

async function getOneFolder(path) {
    let error, result;
    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.FILE.GET_ONE_FILE_STREAM.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.FILE.GET_ONE_FILE_STREAM.SUCCESS,
        null
    );
    try {
        var getObjectParams = {
            Bucket: BucketName,
            Prefix: path,
        };
        [error, result] = await To(s3ClientForStreaming.listObjectsV2(getObjectParams).promise());
        if (result) {
            let contentsArray = result.Contents;
            let resultObject = contentsArray.map((element)=>{
                return element.Key;
            })
            resolveObject.setData(resultObject);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            return Promise.reject(handleS3Error(error, Constants.FILE.GET_ONE_FILE_STREAM.ERROR));
        }
    } catch (e) {
        if (debugDumpDownloadStreamToDisk && debugWriteStream) {
            debugWriteStream.end();
        }
        rejectObject.setDetails(e);
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}