module.exports = {
    createOne: createOne,
    createMultiple: createMultiple,
    getOneById: getOneById,
    getOne: getOne,
    getAll: getAll,
    getAllCount: getAllCount,
    search: search,
    searchCount: searchCount,
    updateOneById: updateOneById,
    deleteOneById: deleteOneById,
    deleteMultipleById: deleteMultipleById
};

// Imports
const RejectData = require('../../../common/response/reject-data');
const CommonConstants = require('../../../common/constant/constant');
const To = require('../../../common/to/to');
const CommonValidator = require('../../../common/validate/validator');
const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');
const SettingService = require('../services/setting');
const Constants = require('../../constant/constant');


/**
 * Create one setting
 * @param {*} authUser 
 * @param {*} setting 
 */
async function createOne(authUser, setting) {
    try {
        // Initialize
        let error, result;//, kafkaResult;
        // Assign
        if (authUser && CommonValidator.isValidMongoObjectId(authUser._id)) {
            setting.createdBy = authUser.id;
            setting.updatedBy = authUser.id;
        }

        // Create
        [error, result] = await To(SettingService.createOne(setting));
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            // Update Cache
            SettingsMap.set(result.data.property, result.data.value);

            // Publish a message to Kafka
            /*if (Config.KAFKA.IS_CONNECT) {
                [error, kafkaResult] = await To(
                    KafkaProducer.publishOneMessageToOneTopic(
                        SettingsMap.get(SettingsKeys.BOOTSTRAP.KAFKA.TOPIC.APPLICATION_SETTING.NAME),
                        {
                            action: CommonConstants.COMMON.ACTION.CREATE,
                            data: result.data
                        }
                    )
                );
                if (kafkaResult) {
                    //Nothing when successful
                } else {
                    result.appendMessage(Constants.BOOTSTRAP.GERERIC.CHANGE_PUBLISH_ERROR);
                }
            } else {
                result.appendMessage(Constants.BOOTSTRAP.GERERIC.CHANGE_PUBLISH_KAFKA_ERROR);
            }*/
            return Promise.resolve(result);
        }

    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.CREATE_ONE.ERROR + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
    }
}


/**
 * Provision multiple settings
 * @param {*} authUser 
 * @param {*} settings 
 */
async function createMultiple(authUser, settings) {
    try {
        // Initialize
        let error, result;//, kafkaResult;

        // Assign
        if (authUser && CommonValidator.isValidMongoObjectId(authUser._id)) {

            settings.forEach(function (s) {
                s.createdBy = authUser._id;
                s.updatedBy = authUser._id;
            });
        }

        // Create
        [error, result] = await To(SettingService.createMultiple(settings));
        if (error) {
            return Promise.reject(error);
        }
         
        if (result) {
            // Update Cache
            //SettingsMap.set(result.data.property, result.data.value);
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.CREATE_MULTIPLE.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Get one setting by id
 * @param {*} settingId 
 */
async function getOneById(settingId) {
    try {
        // Initialize
        let error, result;

        // Create
        [error, result] = await To(SettingService.getOneById(settingId));
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            return Promise.resolve(result);
        } 
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.GET_ONE_BY_ID.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
    }
}
/**
 * Get one setting by id
 * @param {*} appid 
 * @param {*} catid 
 * @param {*} property 
 */
async function getOne(appid, catid, prop) {
    try {
        // Initialize
        let error, result;

        // Create
        [error, result] = await To(SettingService.getOne(appid, catid, prop));
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.GET_ONE.ERROR + + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Get all settings
 * @param {*} params 
 * @param {*} query 
 */
async function getAll(params, query) {
    try {
        // Initialize
        let error, result;

        //Get All        
        [error, result] = await To(SettingService.getAll(params, query));
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.GET_ALL.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
    }
}
/**
 * Get all settings count
 */
async function getAllCount() {
    try {
        // Initialize
        let error, result;

        //Get All        
        [error, result] = await To(SettingService.getAllCount());
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.GET_ALL_COUNT.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Search
 * @param {*} setting 
 * @param {*} params 
 * @param {*} query 
 */
async function search(searchData) {
    // Initialize
    let error, result;

    try {
        // Search
        [error, result] = await To(SettingService.search(searchData));
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.SEARCH.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
    }
}
/**
 * Search count
 * @param {*} setting 
 */
async function searchCount(searchData) {
    // Initialize
    let error, result;

    try {
        // Data manipulation
        // Search
        [error, result] = await To(SettingService.searchCount(searchData));
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.SEARCH_COUNT.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Update one setting by id
 * @param {*} settingId  
 */
async function updateOneById(authUser, settingId, setting) {
    try {
        // Initialize
        let error, result;//, kafkaProducerResult, kafkaResult;

        // Assign data
        if (authUser && CommonValidator.isValidMongoObjectId(authUser._id)) {
            setting.updatedBy = authUser.id;
        }

        // Update
        [error, result] = await To(SettingService.updateOneById(settingId, setting));
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            if (result.data) {
                // Update Cache
                SettingsMap.set(result.data.property, result.data.value);
                /*if (SettingsMapCache.get(SettingsKeysCommon.BOOTSTRAP.KAFKA.IS_CONNECT)) {
                    // Publish a message to Kafka
                    [error, kafkaResult] = await To(
                        KafkaProducer.publishOneMessageToOneTopic(
                            SettingsMap.get(SettingsKeysCommon.BOOTSTRAP.KAFKA.TOPIC.APPLICATION_SETTING.NAME),
                            JSON.stringify({
                                action: CommonConstants.COMMON.ACTION.UPDATE,
                                data: result.data
                            })
                        )
                    );
                    if (kafkaResult) {
                        //Nothing when successful
                    } else {
                        result.appendMessage(Constants.BOOTSTRAP.GERERIC.CHANGE_PUBLISH_ERROR);
                    }
                } else {
                    result.appendMessage(Constants.BOOTSTRAP.GERERIC.CHANGE_PUBLISH_kafka_ERROR);
                }*/

                return Promise.resolve(result);
            }
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.UPDATE_ONE_BY_ID.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Delete one setting by id
 * @param {*} settingId  
 */
async function deleteOneById(settingId) {
    try {
        // Initialize
        let error, result;//, kafkaResult;

        // Delete
        [error, result] = await To(SettingService.deleteOneById(settingId));
        if (error) {
            return Promise.reject(error);
        }

        if (result && result.data) {
            // Update Cache
            SettingsMap.delete(result.data.property);
            /*if (SettingsMap.get(SettingsKeys.BOOTSTRAP.KAFKA.IS_CONNECT)) {
                // Publish a message to Kafka
                [error, kafkaResult] = await To(
                    KafkaProducer.publishOneMessageToOneTopic(
                        SettingsMap.get(SettingsKeys.BOOTSTRAP.KAFKA.TOPIC.APPLICATION_SETTING),
                        JSON.stringify({
                            action: CommonConstants.COMMON.ACTION.UPDATE,
                            data: result.data
                        })
                    )
                );
                if (kafkaResult) {
                    //Nothing when successful
                } else {
                    result.appendMessage(Constants.BOOTSTRAP.GERERIC.CHANGE_PUBLISH_ERROR);
                }
            } else {
                result.appendMessage(Constants.BOOTSTRAP.GERERIC.CHANGE_PUBLISH_kafka_ERROR);
            }
            */
            // Response
            return Promise.resolve(result);
        } 
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.DELETE_ONE_BY_ID.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Delete multiple settings by id
 * @param {*} settingIds  
 */
async function deleteMultipleById(settingIds) {
    try {
        // Initialize
        let error, result;//, kafkaResult;

        // Delete
        [error, result] = await To(SettingService.deleteMultipleById(settingIds));
        if (error) {
            return Promise.reject(error);
        }

        if (result && result.data) {
            // Update Cache
            SettingsMap.delete(result.data.property);
            /*if (SettingsMap.get(SettingsKeys.BOOTSTRAP.KAFKA.IS_CONNECT)) {
                // Publish a message to Kafka
                [error, kafkaResult] = await To(
                    KafkaProducer.publishOneMessageToOneTopic(
                        SettingsMap.get(SettingsKeys.BOOTSTRAP.KAFKA.TOPIC.APPLICATION_SETTING.NAME),
                        JSON.stringify({
                            action: CommonConstants.COMMON.ACTION.UPDATE,
                            data: result.data
                        })
                    )
                );
                if (kafkaResult) {
                    //Nothing when successful
                } else {
                    result.appendMessage(Constants.BOOTSTRAP.GERERIC.CHANGE_PUBLISH_ERROR);
                }
            } else {
                result.appendMessage(Constants.BOOTSTRAP.GERERIC.CHANGE_PUBLISH_kafka_ERROR);
            }*/
            // Response
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.BOOTSTRAP.SETTINGS.DELETE_MULTIPLE_BY_ID.ERROR + ' - ' + e.message,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        return Promise.reject(rejObject.jsonObject());
    }
}