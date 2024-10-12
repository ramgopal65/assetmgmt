/* eslint-disable no-inner-declarations */
module.exports = {
    createOne: createOne,
    getOne: getOne,
    createMultiple: createMultiple,
    updateOne: updateOne,
    deleteOneById: deleteOneById
};

//Imports
const CourtService = require('../services/court');
const To = require('../../../common/to/to');
const RejectData = require('../../../common/response/reject-data');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const stream = require('stream');
const { Writable } = require('stream');
const csvParser = require('csv-parser');

async function createOne(caller, court) {
    let error, result, rejectObject;
    try {
        court.createdBy = caller._id;
        court.updatedBy = caller._id;
        [error, result] = await To(CourtService.createOne(court));
        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(result);
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.COURT.CREATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        rejectObject.appendMessage(error.message);
        return Promise.reject(rejectObject.jsonObject());
    }
};


async function createMultiple(caller, courtDetails) {
    let error, result, rejectObject;
    try {
        function transformData(groupedData) {
            return Object.keys(groupedData).map(academyName => {
                const courts = groupedData[academyName].reduce((acc, row) => {
                    let court = acc.find(c => c.name === row.court_name);
                    if (!court) {
                        court = {
                            name: row.court_name,
                            cameras: []
                        };
                        acc.push(court);
                    }
                    court.cameras.push({
                        name: row.camera_name,
                        id: row.camera_id
                    });
                    return acc;
                }, []);

                return {
                    name: academyName,
                    courts: courts,
                    createdBy: caller._id,
                    updatedBy: caller._id
                };
            });
        }

        let batch = [];
        const batchSize = 10;
        let exceededBatchSize = false;
        const groupedData = {};

        const bufferStream = new stream.PassThrough();
        bufferStream.end(courtDetails);

        const writableStream = new Writable({
            objectMode: true,
            write: (row, encoding, callback) => {
                if (!groupedData[row.academy_name]) {
                    groupedData[row.academy_name] = [];
                }
                groupedData[row.academy_name].push(row);
                callback();
            }
        });
        error = result = null;
        [error, result] = await To(new Promise((resolve, reject) => {
            bufferStream
                .pipe(csvParser())
                .pipe(writableStream)
                .on('finish', async () => {
                    const transformedData = transformData(groupedData);
                    for (const data of transformedData) {
                        batch.push(data);
                        if (batch.length === batchSize + 1) {
                            exceededBatchSize = true;
                            break;
                        }
                    }

                    if (exceededBatchSize) {
                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                            Constants.ASSETMGMT.COURT.CREATE_MULTIPLE.ERROR_TOO_MANY,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null
                        );
                        reject(rejectObject.jsonObject());

                    } else {
                        if (batch.length > 0) {
                            let e, r;
                            [e, r] = await To(CourtService.createMultiple(batch));
                            if (e) {
                                reject(e);
                            }
                            resolve(r);
                        } else {
                            rejectObject = new RejectData(
                                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                                Constants.ASSETMGMT.COURT.CREATE_MULTIPLE.ERROR_NONE,
                                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                null
                            );
                            reject(rejectObject.jsonObject());
                        }
                    }
                })
                .on('error', (err) => {
                    reject(err);
                });
        }));

        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(result);
        }

    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.COURT.CREATE_MULTIPLE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error
        );
        rejectObject.appendMessage(error.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

async function getOne(cameras){
    let error, result, rejectObject;
    try {
        let searchQuery = cameras;
        [error, result] = await To(CourtService.getOne(searchQuery));
        if(error){
            return Promise.reject(error);
        } else{
            return Promise.resolve(result)
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.COURT.GET_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        rejectObject.appendMessage(error.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

async function updateOne(userId, courtDetails){
    let error, result, rejectObject;
    try {
        [error, result] = await To(CourtService.updateOne(userId, courtDetails));
        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(result);
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.COURT.UPDATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        rejectObject.appendMessage(error.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

async function deleteOneById(courtId) {
    let error, result, rejectObject;
    try {
        [error, result] = await To(CourtService.deleteOneById(courtId));
        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(result);
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.COURT.DELETE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        rejectObject.appendMessage(error.message);
        return Promise.reject(rejectObject.jsonObject());
    }
};