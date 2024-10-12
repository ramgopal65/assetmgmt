module.exports = {
    getProducer: getProducer,
    getPartitionerProducer: getPartitionerProducer
};

// Imports
const Kafka = require('kafka-node');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const ResolveData = require('../../response/resolve-data');
const RejectData = require('../../response/reject-data');

/**
 * Get kafka producer connection
 * @param {*} params
 */

const getProducer = async (params) => {
    try {
        const Producer = Kafka.Producer;
        const client = new Kafka.KafkaClient({ kafkaHost: params.host + ':' + params.port });
        console.log('Client in common/connector: ', { client });
        const options = {};

        if (params.producer && params.producer.requireAcks) {
            options.requireAcks = params.producer.requireAcks;
        }

        // Create and return a Promise that resolves when the producer is ready.
        return new Promise((resolve, reject) => {
            const producer = new Producer(client, options);

            // Producer on ready
            producer.on('ready', () => {
                console.log('Producer ready');
                var resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.COMMON.KAFKA_HTTP_MESSAGE.CREATE_PRODUCER.SUCCESS,
                    null
                );
                resolve({ ...resolveObject.jsonObject(), data: producer });
            });

            // Producer on error
            producer.on('error', (error) => {
                // Create a reject object and reject the Promise
                var rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                    Constants.COMMON.KAFKA_HTTP_MESSAGE.CREATE_PRODUCER.ERROR,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    error
                );
                reject(rejectObject.jsonObject());
            });
        });
    } catch (error) {
        if (error && error.code && error.message) {
            return Promise.reject(error);
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.COMMON.KAFKA_HTTP_MESSAGE.CREATE_PRODUCER.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null
            );
            return Promise.reject(rejectObject.jsonObject());
        }
    }
};



/**
 * Get kafka partitioner producer connection
 * @param {*} params 
 */

const getPartitionerProducer = async (params) => {
    try {
        const Producer = Kafka.Producer;
        const client = new Kafka.KafkaClient({ kafkaHost: params.host + ':' + params.port });
        console.log('Client in common/connector 2 ', { client });
        const partitionerOptions = {};
        
        if (params.producer && params.producer.requireAcks){
            partitionerOptions.requireAcks = params.producer.requireAcks;
        }
        if (params.partitionerType) {
            partitionerOptions.partitionerType = params.partitionerType;
        }

        // Create Partitioner Producer
        partitionerProducer = new Producer(client, partitionerOptions);

        // Create and return a Promise that resolves when the producer is ready.
        return new Promise((resolve, reject) => {
            const producer = new Producer(client, options);

            // Producer on ready
            producer.on('ready', () => {
                console.log('Producer ready');
                var resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.COMMON.KAFKA_HTTP_MESSAGE.CREATE_PARTITIONER.SUCCESS,
                    null
                );
                resolve({ ...resolveObject.jsonObject(), data: producer });
            });

            // Producer on error
            producer.on('error', (error) => {
                // Create a reject object and reject the Promise
                var rejectObject = new RejectData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                    Constants.COMMON.KAFKA_HTTP_MESSAGE.CREATE_PARTITIONER.ERROR,
                    CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                    null
                );
                reject(rejectObject.jsonObject());
            });
        });
    } catch (error) {
        if (error && error.code && error.message) {
            return Promise.reject(error);
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                Constants.COMMON.KAFKA_HTTP_MESSAGE.CREATE_PARTITIONER.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null
            );
            return Promise.reject(rejectObject.jsonObject());
        }
    }
};

