module.exports = {
    COMMON: {
        DATABASE: {
            CONNECT_PARAM: {
                USE_NEW_URL_PARSER: 'common.database.connect_param.use_new_url_parser'
            },
            FETCH_ALL: {
                SKIP: {
                    DEFAULT: 'common.database.fetch_all.skip.default',
                },
                LIMIT: {
                    MIN: 'common.database.fetch_all.limit.min',
                    MAX: 'common.database.fetch_all.limit.max',
                    DEFAULT: 'common.database.fetch_all.limit.default'
                }
            },
            SORT_ORDER: {
                ID_ASCENDING: 'common.database.sort_order.id_ascending',
                ID_DESCENDING: 'common.database.sort_order.id_descending',
                DEFAULT: 'common.database.sort_order.default'
            },
            SELECT: {
                DEFAULT: 'common.database.select.default'
            },
            MAXIMUM: {
                RESULTS: {
                    GET_ALL: 'common.database.maximum.results.get_all',
                    SEARCH: 'common.database.maximum.results.search'
                },
                QUERY: {
                    EXECUTION_TIME: {
                        MILLISECONDS: 'common.database.maximum.query.execution_time.milliseconds'
                    }
                },
                STORAGE: {
                    DEVICE_STATUS: {
                        LOCATIONS: 'common.database.maximum.storage.device_status.locations'
                    }
                }
            },
            SKIP: {
                RESULTS: {
                    GET_ALL: 'common.database.skip.results.get_all',
                    SEARCH: 'common.database.skip.results.search'
                }
            },
            SORT: {
                RESULTS: {
                    GET_ALL: 'common.database.sort.results.get_all',
                    SEARCH: 'common.database.sort.results.search'
                }
            },
            URL: 'common.database.url',
            USE_NEW_URL_PARSER: 'common.database.use_new_url_parser',
        },
        JWT: {
            ISSUER: 'common.jwt.issuer',
            SECRET: 'common.jwt.secret',
            EXPIRY_DURATION_SECONDS: 'common.jwt.expiry_duration_sec'
        },
        HTTP: {
            CORS: {
                ACCESS_CONTROL_ALLOW: {
                    HEADERS: 'common.http.CORS.Access-Control-Allow-Headers',
                    METHODS: 'common.http.CORS.Access-Control-Allow-Methods',
                    ORIGIN: 'common.http.CORS.Access-Control-Allow-Origin',
                    ORIGIN_ALLOWED: 'common.http.CORS.Access-Control-Allow-Origin.origin_allowed',
                    ENABLED: 'common.http.CORS.Access-Control-Allow-Origin.enabled',
                },
                CACHE: {
                    CACHE_CONTROL: 'generic.default.headers.cache.cache_control',
                },
                X_CONTENT_TYPE_OPTIONS: 'generic.default.headers.x_content_type_options',
                X_FRAME_OPTIONS: 'generic.default.headers.x_frame_options',
                X_XSS_PROTECTION: 'generic.default.headers.x_xss_protection'
            }
        },
        RESPONSE: {
            SKIP: {
                USERS: 'common.response.skip.users',
            },
        },
        AUDIT: {
            PREFERENCE: {
                SKIP: {
                    API: 'common.audit.preference.skip.api'
                },
                IS_ENABLE: {
                    REQUEST: {
                        BODY: 'common.audit.preference.is_enable.request.body',
                    },
                    RESPONSE: {
                        BODY: 'common.audit.preference.is_enable.response.body'
                    }
                }
            }
        },
        OTP: {
            LENGTH: 'common.otp.length',
            TYPE: 'common.otp.type',
            RETRY_COUNT: 'common.otp.retry_count',
            EXPIRY_DURATION_SECONDS: 'common.otp.expiry_duration_sec',
            REGISTRATION: {
                LENGTH: 'common.otp.registration.length',
                TYPE: 'common.otp.registration.type',
                RETRY_COUNT: 'common.otp.registration.retry_count',
                EXPIRY_DURATION_SECONDS: 'common.otp.registration.expiry_duration_sec'
            },
            VERIFY_PHONE: {
                LENGTH: 'common.otp.verify_phone.length',
                TYPE: 'common.otp.verify_phone.type',
                RETRY_COUNT: 'common.otp.verify_phone.retry_count',
                EXPIRY_DURATION_SECONDS: 'common.otp.verify_phone.expiry_duration_sec'
            },
            VERIFY_EMAIL: {
                LENGTH: 'common.otp.verify_email.length',
                TYPE: 'common.otp.verify_email.type',
                RETRY_COUNT: 'common.otp.verify_email.retry_count',
                EXPIRY_DURATION_SECONDS: 'common.otp.verify_email.expiry_duration_sec'
            },
            RESET_PASSWORD: {
                LENGTH: 'common.otp.reset_password.length',
                TYPE: 'common.otp.reset_password.type',
                RETRY_COUNT: 'common.otp.reset_password.retry_count',
                EXPIRY_DURATION_SECONDS: 'common.otp.reset_password.expiry_duration_sec'
            }
        },
        LOGIN:{
            RETRY_COUNT: 'common.login.retry.count'
        },
        AUTHENTICATION: {
            MFA: 'common.authentication.mfa'
        },
        LIMITS: {
            REST_API: {
                NO_OF_ENTITIES: 'common.limits.rest_api.no_of_entities'
            },
            EXPIRY: {
                TOKEN: {
                    MILLISECONDS: {
                        UPDATE_EMAIL: 'common.limits.expiry.token.milliseconds.update_email',
                        UPDATE_PHONE: 'common.limits.expiry.token.milliseconds.update_phone',
                        LOGIN: 'common.limits.expiry.token.milliseconds.login',
                        MFA_LOGIN: 'common.limits.expiry.token.milliseconds.mfa_login',
                        REGISTRATION: 'common.limits.expiry.token.milliseconds.registration',
                        RESET_PASSWORD: 'common.limits.expiry.token.milliseconds.reset_password',
                        SESSION_GROUP_CONSENT: 'common.limits.expiry.token.milliseconds.session_group_consent'
                    },
                    DAYS: {
                        UPDATE_EMAIL: 'common.limits.expiry.token.days.update_email',
                        UPDATE_PHONE: 'common.limits.expiry.token.days.update_phone',
                        LOGIN: 'common.limits.expiry.token.days.login',
                        MFA_LOGIN: 'common.limits.expiry.token.days.mfa_login',
                        REGISTRATION: 'common.limits.expiry.token.days.registration',
                        RESET_PASSWORD: 'common.limits.expiry.token.days.reset_password',
                        SESSION_GROUP_CONSENT: 'common.limits.expiry.token.days.session_group_consent'
                    }
                }
            },
            RETRIES: {
                TOKEN: {
                    UPDATE_EMAIL: 'common.limits.retries.token.update_email',
                    UPDATE_PHONE: 'common.limits.retries.token.update_phone',
                    LOGIN: 'common.limits.retries.token.login',
                    MFA_LOGIN: 'common.limits.retries.token.mfa_login',
                    REGISTRATION: 'common.limits.retries.token.registration',
                    RESET_PASSWORD: 'common.limits.retries.token.reset_password',
                    SESSION_GROUP_CONSENT: 'common.limits.retries.token.session_group_consent'
                },
                PASSWORD: 'common.limits.retries.password'
            },
            LOCK: {
                WRONG_PASSWORD: {
                    MILLISECONDS: 'common.limits.lock.wrong_password.milliseconds'
                }
            },
        },
        BOOTSTRAP: {
            DEPLOYMENT: {
                ENVIRONMENT: 'bootstrap.deployment.environment'
            },
            NODE_CLUSTER: {
                IS_ENABLE: 'bootstrap.node_cluster.is_enable'
            }
        },
        KAFKA: {
            CONNECTION: {
                CLUSTER: {
                    URL: 'common.kafka.connection.cluster.url'
                }
            },
            TOPIC: {
                AUDIT_LOG: {
                    NAME: 'common.kafka.topic.audit_log.name'
                },
                COMMON: {
                    OFFSET: 'common.kafka.topic.common.offset'
                },
                PRODUCER: {
                    REQUIRE_ACKS: 'common.kafka.topic.producer.require_acks',
                    PARTITIONER_TYPE: 'common.kafka.topic.producer.partitioner_type',
                    PARTITION_KEY: 'common.kafka.topic.producer.partition_key'
                },
                PREFIX: 'common.kafka.topic.prefix',
                REVERSE_PATH: {
                    POSTFIX: {
                        DEVICE_CONFIGURATION: 'common.kafka.topic.reverse_path.postfix.device_configuration',
                        INCIDENT: 'common.kafka.topic.reverse_path.postfix.incident'
                    }
                },
                APPLICATION_SETTING: {
                    NAME: 'common.kafka.topic.application_setting.name',
                    FROM_OFFSET: 'common.kafka.topic.application_setting.from_offset',
                    PARTITION: 'common.kafka.topic.application_setting.partition',
                    PRODUCER: {
                        REQUIRE_ACKS: 'common.kafka.topic.application_setting.producer.require_acks',
                        PARTITIONER_TYPE: 'common.kafka.topic.application_setting.producer.partitioner_type',
                        PARTITION_KEY: 'common.kafka.topic.application_setting.producer.partition_key'
                    },
                    CONSUMER_GROUP: {
                        GROUP_ID: 'common.kafka.topic.application_setting.consumer_group.group_id',
                        AUTO_COMMIT_INTERVAL: {
                            MILLISECONDS: 'common.kafka.topic.application_setting.consumer_group.auto_commit_interval.milliseconds'
                        },
                        SESSION_TIMEOUT: {
                            MILLISECONDS: 'common.kafka.topic.application_setting.consumer_group.session_timeout.milliseconds'
                        },
                        PROTOCOL: 'common.kafka.topic.application_setting.consumer_group.protocol',
                        FROM_OFFSET: 'common.kafka.topic.application_setting.consumer_group.from_offset',
                        COMMIT_OFFSETS_ON_FIRST_JOIN: 'common.kafka.topic.application_setting.consumer_group.commit_offsets_on_first_join'
                    },
                    CONSUMER: {
                        AUTO_COMMIT: 'common.kafka.topic.application_setting.consumer.auto_commit',
                        AUTO_COMMIT_INTERVAL: {
                            MILLISECONDS: 'common.kafka.topic.application_setting.consumer.auto_commit_interval.milliseconds'
                        },
                        FROM_OFFSET: 'common.kafka.topic.application_setting.consumer.from_offset'
                    },
                }
            },
        },
        FR: {
            REFERENCE_IMAGE: {
                SECRET_KEY: 'common.fr.reference_image.secret_key',
            },
        },
        ENCRYPTION: {
            IS_ENABLE: {
                RESPONSE: 'common.encryption.is_enable.response'
            },
            SECRET_KEY: 'common.encryption.secret_key'
        },
        TEST: {
            INCLUDE_OTP_IN_REST_RESPONSE: 'common.test.include_otp_in_rest_response',
            INCLUDE_ALL_FIELDS_IN_REST_RESPONSE: 'common.test.include_all_fields_in_rest_response'
        }
    }
};