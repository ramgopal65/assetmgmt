/* eslint-disable no-inner-declarations */
module.exports = {
    createOne: createOne,
    getOneWhitelistedUser: getOneWhitelistedUser,
    createMultiple: createMultiple,
    updateCoach: updateCoach,
    deleteOneWhitelistedUser: deleteOneWhitelistedUser,
    deleteMultiple: deleteMultiple
};

//Imports
const WhitelistService = require('../services/whitelist');
const To = require('../../../common/to/to');
const RejectData = require('../../../common/response/reject-data');
const ResolveData = require('../../../common/response/resolve-data');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const {Writable} = require('stream');
const stream = require('stream');
const csvParser = require('csv-parser');
const mongodb = require('mongodb');

async function createOne(whitelistData) {
    let error, result, rejectObject;
    try {
        if (whitelistData.player.phone && whitelistData.coach.phone) {
            whitelistData.playerIdentifier = {};
            whitelistData.playerIdentifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER;
            whitelistData.playerIdentifier.id = whitelistData.player.phone.cc + whitelistData.player.phone.number;

            whitelistData.coachIdentifier = {};
            whitelistData.coachIdentifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER;
            whitelistData.coachIdentifier.id = whitelistData.coach.phone.cc + whitelistData.coach.phone.number;
        }
        if (whitelistData.player.email && whitelistData.coach.email) {
            whitelistData.playerIdentifier = {};
            whitelistData.playerIdentifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
            whitelistData.playerIdentifier.id = whitelistData.player.email;

            whitelistData.coachIdentifier = {};
            whitelistData.coachIdentifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
            whitelistData.coachIdentifier.id = whitelistData.coach.email;
        }
        if (whitelistData.player.phone && whitelistData.coach.email) {
            whitelistData.playerIdentifier = {};
            whitelistData.playerIdentifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER;
            whitelistData.playerIdentifier.id = whitelistData.player.phone.cc + whitelistData.player.phone.number;

            whitelistData.coachIdentifier = {};
            whitelistData.coachIdentifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
            whitelistData.coachIdentifier.id = whitelistData.coach.email;
        }
        if (whitelistData.player.email && whitelistData.coach.phone) {
            whitelistData.playerIdentifier = {};
            whitelistData.playerIdentifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
            whitelistData.playerIdentifier.id = whitelistData.player.email;

            whitelistData.coachIdentifier = {};
            whitelistData.coachIdentifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER;
            whitelistData.coachIdentifier.id = whitelistData.coach.phone.cc + whitelistData.coach.phone.number;
        }
        [error, result] = await To(WhitelistService.createOne(whitelistData));
        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(result);
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.WHITELIST.CREATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        rejectObject.appendMessage(error.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

async function createMultiple(caller, whitelistedData) {
    let error, result, rejectObject;
    try {
        let playerType, coachType;
        function transformData(row) {
            if (row.player_phone_number) {
                playerType = 'phone';
            } else {
                playerType = 'email';
            }

            if (row.coach_phone_number) {
                coachType = 'phone';
            } else {
                coachType = 'email';
            }
            if ((row.player_phone_cc && row.player_phone_number) && (row.coach_phone_cc && row.coach_phone_number)) {
                return {
                    playerIdentifier: {
                        id: row.player_phone_cc + row.player_phone_number,
                        type: playerType,
                    },
                    coachIdentifier: {
                        id: row.coach_phone_cc + row.coach_phone_number,
                        type: coachType,
                    },
                    hierarchyCode: caller.hierarchyCode
                };
            }else if ((row.player_phone_cc && row.player_phone_number) && (row.coach_email)) {
                return {
                    playerIdentifier: {
                        id: row.player_phone_cc + row.player_phone_number,
                        type: playerType,
                    },
                    coachIdentifier: {
                        id: row.coach_email,
                        type: coachType,
                    },
                    hierarchyCode: caller.hierarchyCode
                };
            } else if ((row.player_email) && (row.coach_phone_cc && row.coach_phone_number)) {
                return {
                    playerIdentifier: {
                        id: row.player_email,
                        type: playerType,
                    },
                    coachIdentifier: {
                        id: row.coach_phone_cc + row.coach_phone_number,
                        type: coachType,
                    },
                    hierarchyCode: caller.hierarchyCode
                };
            } else if (row.player_email && row.coach_email) {
                return {
                    playerIdentifier: {
                        id: row.player_email,
                        type: playerType,
                    },
                    coachIdentifier: {
                        id: row.coach_email,
                        type: coachType,
                    },
                    hierarchyCode: caller.hierarchyCode
                };
            } else {
                return null;
            }
        }

        let batch = [];
        const batchSize = 10;

        const bufferStream = new stream.PassThrough();
        let tooManyRows = false;
        let wrongCsvFormat = false;
        bufferStream.end(whitelistedData);

        const writableStream = new Writable({
            objectMode: true,
            write: async (row, encoding, callback) => {
                const transformedRow = transformData(row);
                if (transformedRow) {
                    batch.push(transformedRow);
                    if (batch.length === batchSize + 1) {
                        tooManyRows = true;
                    }
                } else {
                    wrongCsvFormat = true;
                }
                callback();
            }
        });

        error = result = null;
        [error, result] = await To(new Promise((resolve, reject) => {
            bufferStream
                .pipe(csvParser())
                .pipe(writableStream)
                .on('finish', () => {
                    resolve();
                })
                .on('error', (err) => {
                    reject(err);
                });
        }));
        if (error) {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.ASSETMGMT.WHITELIST.CREATE_MULTIPLE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
                error);
            rejectObject.appendMessage(error.message);
            return Promise.reject(rejectObject.jsonObject());
        } else if (tooManyRows) {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.ASSETMGMT.WHITELIST.CREATE_MULTIPLE.ERROR_TOO_MANY,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        } else if (wrongCsvFormat) {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.ASSETMGMT.WHITELIST.CREATE_MULTIPLE.ERROR_WRONG_CSV_FORMAT,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        } else {
            if (batch.length > 0) {
                error = result = null;
                [error, result] = await To(WhitelistService.createMultiple(batch));
                if (error) {
                    return Promise.reject(error);
                } else {
                    return Promise.resolve(result);
                }
            } else {
                rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                    Constants.ASSETMGMT.WHITELIST.CREATE_MULTIPLE.ERROR_NONE,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null);
                return Promise.reject(rejectObject.jsonObject());
            }
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.WHITELIST.CREATE_MULTIPLE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        rejectObject.appendMessage(error.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}



async function getOneWhitelistedUser(whitelistUser) {
    let error, result, rejectObject;
    try {
        let playerIdentifier = {};
        let coachIdentifier = {};
        if (whitelistUser.role === 'coach') {
            if (whitelistUser.phone) {
                coachIdentifier.id = whitelistUser.phone.cc + whitelistUser.phone.number;
                coachIdentifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER;
            }
            if (whitelistUser.email) {
                coachIdentifier.id = whitelistUser.email.email;
                coachIdentifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
            }
        } else {
            if (whitelistUser.phone) {
                playerIdentifier.id = whitelistUser.phone.cc + whitelistUser.phone.number;
                playerIdentifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER;
            }
            if (whitelistUser.email) {
                playerIdentifier.id = whitelistUser.email.email;
                playerIdentifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
            }
        }
        error = result = null;
        [error, result] = await To(WhitelistService.getOneWhitelistedUser(playerIdentifier, coachIdentifier));
        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(result);
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.WHITELIST.GET_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        rejectObject.appendMessage(error.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

async function deleteOneWhitelistedUser(player) {
    let error, result, rejectObject;
    try {
        [error, result] = await To(WhitelistService.deleteOneWhitelistedUser(player.id));
        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(result);
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.WHITELIST.DELETE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        rejectObject.appendMessage(error.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

async function deleteMultiple(identifiers) {
    let error, result, rejectObject;
    try {
        [error, result] = await To(WhitelistService.deleteMultiple(identifiers));
        if (error) {
            return Promise.resolve(error);
        } else {
            return Promise.resolve(result);
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.WHITELIST.DELETE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        rejectObject.appendMessage(error.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

async function updateCoach(coach, newCoach) {
    let error, result, rejectObject;
    try {
        [error, result] = await To(WhitelistService.updateCoach(coach.id, newCoach.id));
        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve(result);
        }
    } catch (error) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.WHITELIST.UPDATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error);
        rejectObject.appendMessage(error.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}