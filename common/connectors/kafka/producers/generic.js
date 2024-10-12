// Import
const Kafka = require('kafka-node');
const To = require('../../../../common/to/to');
const SettingsKeysCommon = require('../../../setting/keys');
const SettingsMap = require('../../../wrappers/bootstrap/settings-map');
const ResolveData = require('../../../response/resolve-data');
const RejectData = require('../../../response/reject-data');
const CommonConstants = require('../../../../common/constant/constant');
const Constants = require('../../../constant/constant');
// Initialize
let producer = null;
let partitionerProducer = null;
let isConnected = false;
const Producer = Kafka.Producer;
let KeyedMessage = Kafka.KeyedMessage;

/**
 * Create kafka connection 
 */
async function createConnection() {
    try {
        console.log('create connection triggered');
        let connectionPromise = new Promise(async (resolve, reject) => {
            const Client = new Kafka.KafkaClient({kafkaHost: SettingsMap.get(SettingsKeysCommon.COMMON.KAFKA.CONNECTION.CLUSTER.URL)});
            console.log('Client in common/connector generic ', { Client });
            const partitionerOptions = {
                requireAcks: SettingsMap.get(SettingsKeysCommon.COMMON.KAFKA.TOPIC.PRODUCER.REQUIRE_ACKS),
                partitionerType: SettingsMap.get(SettingsKeysCommon.COMMON.KAFKA.TOPIC.PRODUCER.PARTITIONER_TYPE)
            };
            // Initialize all topics to handle "LeaderNotAvailable" error when published for first time
            const allTopicsList = [];
            Client.refreshMetadata(allTopicsList, (error) => {
                if (error) {
                    var rejectObject = new RejectData(
                        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                        Constants.COMMON.KAFKA_HTTP_MESSAGE.CREATE_CONNECTION.REFRESH_ERROR,
                        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                        error
                    );
                    reject(rejectObject.jsonObject());
                }
            });

            // Create Producer
            producer = new Producer(Client, { requireAcks: SettingsMap.get(SettingsKeysCommon.COMMON.KAFKA.TOPIC.PRODUCER.REQUIRE_ACKS) });

            // Create Partitioner Producer
            partitionerProducer = new Producer(Client, partitionerOptions);

            // Producer on ready
            producer.on('ready', () => {
                isConnected = true;
                console.log('Producer is ready');
                var resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.COMMON.KAFKA_HTTP_MESSAGE.CREATE_CONNECTION.SUCCESS,
                    null
                );
                resolve(resolveObject.jsonObject());
            });

            // Producer on error
            producer.on('error', (error) => {
                console.error('Error in kafka producer:');
                console.error(error);
                var rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                    Constants.COMMON.KAFKA_HTTP_MESSAGE.CREATE_CONNECTION.ERROR,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    error
                );
                reject(rejectObject.jsonObject());
            });

            // Producer on ready
            partitionerProducer.on('ready', () => {
                isConnected = true;
                var resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.COMMON.KAFKA_HTTP_MESSAGE.CREATE_CONNECTION.PARTITIONER_SUCCESS,
                    null
                );
                resolve(resolveObject.jsonObject());
            });

            // Producer on error
            partitionerProducer.on('error', (error) => {
                var rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                    Constants.COMMON.KAFKA_HTTP_MESSAGE.CREATE_CONNECTION.PARTITIONER_ERROR,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    error
                );
                reject(rejectObject.jsonObject());
            });
        });

        // Wait till connection is established
        await Promise.all([connectionPromise])
            .then(() => {
                var resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.COMMON.KAFKA_HTTP_MESSAGE.CREATE_CONNECTION.CONNECTION_SUCCESS,
                    null
                );
                return Promise.resolve(resolveObject.jsonObject());
            })
            .catch((error) => {
                var rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.INTERNAL_SERVER_ERROR.CODE,
                    Constants.COMMON.KAFKA_HTTP_MESSAGE.CREATE_CONNECTION.CONNECTION_ERROR,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    error
                );
                return Promise.reject(rejectObject.jsonObject());
            });
    } catch (error) {
        if (error && error.code && error.message) {
            if (error.data && error.data.errorCode == 'ECONNREFUSED') {
                var resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.COMMON.KAFKA_HTTP_MESSAGE.CREATE_CONNECTION.CONNECTION_LOST,
                    error
                );
                return Promise.resolve(resolveObject.jsonObject());
            } else {
                return Promise.reject({ code: error.code, message: error.message, data: error.data });
            }
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.INTERNAL_SERVER_ERROR.CODE,
                Constants.COMMON.KAFKA_HTTP_MESSAGE.CREATE_CONNECTION.CONNECTION_ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                error
            );
            return Promise.reject(rejectObject.jsonObject());
        }
    }
}

/**
 * Publish one message to one topic to a given partition number
 * @param {*} topic 
 * @param {*} message 
 */
async function publishOneMessageToOneTopic(topic, message) {
    return new Promise(async (resolve, reject) => {
        // Initialize
        let error, connectionResult;
        if (!isConnected) {
            console.log('Producer kafka - trying for new connection.');
            // Create connection
            [error, connectionResult] = await To(createConnection());
            if (error) {
                reject(error);
            } else {
                isConnected = true;
            }
        }

        if (isConnected && producer) {
            // Construct Payload
            let payload = [];
            payload.push({
                topic: topic,
                messages: message
            });
            // Publish
            producer
                .send(payload, (error, data) => {
                    if (error) {
                        var rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                            Constants.COMMON.KAFKA_HTTP_MESSAGE.PUBLISH_MESSAGE_TO_TOPIC.ERROR,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            error
                        );
                        reject(rejectObject.jsonObject());
                    } else {
                        var resolveObject = new ResolveData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                            Constants.COMMON.KAFKA_HTTP_MESSAGE.PUBLISH_MESSAGE_TO_TOPIC.SUCCESS,
                            null
                        );
                        resolve(resolveObject.jsonObject());
                    }
                });
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.NOT_FOUND.CODE,
                Constants.COMMON.KAFKA_HTTP_MESSAGE.PUBLISH_MESSAGE_TO_TOPIC.NOT_FOUND,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null
            );
            reject(rejectObject.jsonObject());
        }
    });
}

/**
 * Publish one message to one topic using partition key
 * @param {*} topic 
 * @param {*} partitionKey 
 * @param {*} message 
 */
async function publishOneMessageToOneTopicByPartitionKey(topic, partitionKey, message) {
    return new Promise(async (resolve, reject) => {

        // Initialize
        let error;
        let connectionResult;
        if (!isConnected) {
            // Create connection
            [error, connectionResult] = await To(createConnection());
            if (error) {
                reject(error);
            } else {
                isConnected = true;
            }
        }

        // console.log('job_log : isConnected && partitionerProducer', isConnected, partitionerProducer);

        if (isConnected && partitionerProducer) {
            // Construct Payload
            let payload = [];
            payload.push({
                topic: topic,
                partition: partitionKey,
                messages: new KeyedMessage(partitionKey, message)
            });
            console.log('Payload: ', payload);

            // Publish
            partitionerProducer
                .send(payload, (error, data) => {
                    if (error) {
                        var rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                            Constants.COMMON.KAFKA_HTTP_MESSAGE.PUBLISH_MESSAGE_BY_PARTITION_KEY.ERROR,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null
                        );
                        reject(rejectObject.jsonObject());
                    } else {
                        var resolveObject = new ResolveData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.ACCEPTED_PROCESSING.CODE,
                            Constants.COMMON.KAFKA_HTTP_MESSAGE.PUBLISH_MESSAGE_BY_PARTITION_KEY.ACCEPTED_PROCESSING,
                            null
                        );
                        resolve(resolveObject.jsonObject());
                    }
                });
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.NOT_FOUND.CODE,
                Constants.COMMON.KAFKA_HTTP_MESSAGE.PUBLISH_MESSAGE_TO_TOPIC.NOT_FOUND,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null
            );
            reject(rejectObject.jsonObject());
        }
    }); 
}

module.exports = {
    createConnection: createConnection,
    publishOneMessageToOneTopic: publishOneMessageToOneTopic,
    publishOneMessageToOneTopicByPartitionKey: publishOneMessageToOneTopicByPartitionKey,
};