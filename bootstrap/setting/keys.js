module.exports = {
    BOOTSTRAP: {
        DEPLOYMENT: {
            ENVIRONMENT: 'bootstrap.deployment.environment'
        },
        KAFKA: {
            IS_CONNECT: 'bootstrap.kafka.is_connect',
            TOPIC: {
                GENERIC: {
                    OFFSET: 'bootstrap.kafka.topic.generic.offset'
                },
                APPLICATION_SETTING: {
                    NAME: 'bootstrap.kafka.topic.application_setting.name',
                    FROM_OFFSET: 'bootstrap.kafka.topic.application_setting.from_offset',
                    PARTITION: 'bootstrap.kafka.topic.application_setting.partition',
                    PRODUCER: {
                        REQUIRE_ACKS: 'bootstrap.kafka.topic.application_setting.producer.require_acks',
                        PARTITIONER_TYPE: 'bootstrap.kafka.topic.application_setting.producer.partitioner_type',
                        PARTITION_KEY: 'bootstrap.kafka.topic.application_setting.producer.partition_key'
                    },
                    CONSUMER_GROUP: {
                        GROUP_ID: 'bootstrap.kafka.topic.application_setting.consumer_group.group_id',
                        AUTO_COMMIT_INTERVAL: {
                            MILLISECONDS: 'bootstrap.kafka.topic.application_setting.consumer_group.auto_commit_interval.milliseconds'
                        },
                        SESSION_TIMEOUT: {
                            MILLISECONDS: 'bootstrap.kafka.topic.application_setting.consumer_group.session_timeout.milliseconds'
                        },
                        PROTOCOL: 'bootstrap.kafka.topic.application_setting.consumer_group.protocol',
                        FROM_OFFSET: 'bootstrap.kafka.topic.application_setting.consumer_group.from_offset',
                        COMMIT_OFFSETS_ON_FIRST_JOIN: 'bootstrap.kafka.topic.application_setting.consumer_group.commit_offsets_on_first_join'
                    },
                    CONSUMER: {
                        AUTO_COMMIT: 'bootstrap.kafka.topic.application_setting.consumer.auto_commit',
                        AUTO_COMMIT_INTERVAL: {
                            MILLISECONDS: 'bootstrap.kafka.topic.application_setting.consumer.auto_commit_interval.milliseconds'
                        },
                        FROM_OFFSET: 'bootstrap.kafka.topic.application_setting.consumer.from_offset'
                    }
                }
            }
        },
    }

};