let BASIC = {
    /*
    * SUPPORTED_DATA_TYPE are the data types supported in this system
    *     - for data elements in interactions(BASIC.INTERACTION.DATA)
    *     - for properties of the players(BASIC.PROPERTY)
    *     - settings 
    */
    SUPPORTED_DATA_TYPE: {
        STRING: 'string',
        BOOLEAN: 'boolean',
        INTEGER: 'integer',
        FLOAT: 'float',
        JSON: 'json',
        LISTOFJSON: 'listofjson'
    },
    PLAYER: {
        APPLICATION: {
            CODE: 'application',
            NAME: 'Application'
        }
    },

};

module.exports = {
    COMMON: {
        SUPPORTED_DATA_TYPE: BASIC.SUPPORTED_DATA_TYPE,
        APP_PLAYER: BASIC.PLAYER,
        APP_DB: {
            FETCH_ALL: {
                LIMIT: {
                    MIN: 1,
                    MAX: 100,
                    DEFAULT: 10
                },
                SKIP: {
                    DEFAULT: 0
                }
            },
            SORT_ORDER: {
                ID_ASCENDING: '{ _id: 1}',
                ID_DESCENDING: '{ _id: -1}',
                DEFAULT: '{}'
            },
            SELECT: {
                DEFAULT: ''
            },
            STARTING_DB_CONNECTION: 'connecting to db, dburl is - ',
            DB_CONNECTION_SUCCESS: 'database connection successful',
            DB_CONNECTION_ERROR: 'database connection error',
            DB_CONNECTION_CLOSED: 'database connection closed',
            ERROR_ENV_DB_URL_NOT_SET: 'db connection failed. db url is not set (variable ASSETMGMT_BOOTSTRAP_DB_URL is not set in env). Please set it and restart this service to continue',
            ERROR_DB_URL_NOT_SET: 'db url is not set (db url is not configured in settings). Please set it and restart this service to continue',

        },
        APP_SETTINGS: {
            DEFAULT_VALUE: {
                EDITABLE: 'true',
                ENCRYPTION_REQUIRED: 'false'
            },
            GENERIC: {
                CODE: 'generic',
                NAME: 'Generic'
            },
            COMMON: {
                CODE: 'common',
                NAME: 'Common'
            },
            HTTP: {
                CODE: 'http',
                NAME: 'Http',
                CORS: {
                    ACCESS_CONTROL_ALLOW_HEADERS: {
                        PROPERTY: 'CORS.Access-Control-Allow-Headers',
                        VALUE: 'Origin, X-Requested-With, Content-Type, Accept, captcha, authorization, method, enc, isEncriptionRequired, filename, streamsize, reviewindex',
                        VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        DESCRIPTION: 'default response for Access-Control-Allow-Headers in req'
                    },
                    ACCESS_CONTROL_ALLOW_METHODS: {
                        PROPERTY: 'CORS.Access-Control-Allow-Methods',
                        VALUE: 'GET, PUT, POST, DELETE, OPTIONS, PATCH',
                        VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        DESCRIPTION: 'default response for Access-Control-Allow-Methods in req'
                    },
                    ACCESS_CONTROL_ALLOW_ORIGIN: {
                        PROPERTY: 'CORS.Access-Control-Allow-Origin',
                        VALUE: '*',
                        VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        DESCRIPTION: 'default response for Access-Control-Allow-Origin in req'
                    }
                }
            },
            DEPLOYMENT: {
                CODE: 'deployment',
                NAME: 'Deployment'
            },
            DATABASE: {
                CODE: 'database',
                NAME: 'Database',
                SORT_ORDER: {
                    PROPERTY: 'sort_order.default',
                    VALUE: '{"_id":-1}',
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.JSON,
                    DESCRIPTION: 'default value for sort order in a db fetch operation'
                },
                SELECT: {
                    PROPERTY: 'select.default',
                    VALUE: '',
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'default value for select in a db fetch operation'
                },
                FETCH_ALL_SKIP_DEFAULT: {
                    PROPERTY: 'fetch_all.skip.default',
                    VALUE: 0,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'default value for skip in a fetch all operation'
                },
                FETCH_ALL_LIMIT_DEFAULT: {
                    PROPERTY: 'fetch_all.limit.default',
                    VALUE: 10,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'default value for limit in a fetch all operation'
                },
                FETCH_ALL_LIMIT_MIN: {
                    PROPERTY: 'fetch_all.limit.min',
                    VALUE: 1,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'minimum value for limit in a fetch all operation'
                },
                FETCH_ALL_LIMIT_MAX: {
                    PROPERTY: 'fetch_all.limit.max',
                    VALUE: 100,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'maximum value for limit in a fetch all operation'
                },
                CONNECT_PARAM: {
                    USE_NEW_URL_PARSER: {
                        PROPERTY: 'connect_param.use_new_url_parser',
                        VALUE: true,
                        VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.BOOLEAN,
                        DESCRIPTION: 'Enable/Disable use_new_url_parser for database connection as per the mongodb version'
                    }
                }
            }
        },
        APP_MICRO_SERVICES: {
            COMMON: {
                CODE: 'common',
                NAME: 'Common',
                DESCRIPTION: 'placeholder for common functions. remove this'
            },
            BOOTSTRAP: {
                CODE: 'bootstrap',
                NAME: 'Bootstrap',
                DESCRIPTION: 'Bootstrap microservice'
            },
            ASSETMGMT: {
                CODE: 'assetmgmt',
                NAME: 'Assetmgmt',
                DESCRIPTION: 'Asset management microservice'
            },
            EVENT: {
                CODE: 'event',
                NAME: 'Event management',
                DESCRIPTION: 'Event management microservice'
            },
            AUDIT: {
                CODE: 'audit',
                NAME: 'Audit',
                DESCRIPTION: 'Audit microservice'
            },
            ALERT: {
                CODE: 'alert',
                NAME: 'Alert',
                DESCRIPTION: 'alert management microservice'
            },
            NOTIFICATION: {
                CODE: 'notification',
                NAME: 'Notification',
                DESCRIPTION: 'notification (sms, email, push notification) generator microservice'
            },
            FILE: {
                CODE: 'file',
                NAME: 'File',
                DESCRIPTION: 'file management microservice'
            },
            TESTIMONIAL: {
                CODE: 'testimonial',
                NAME: 'Testimonial',
                DESCRIPTION: 'testimonial management microservice'
            },
            JOB: {
                ADD_DAT_TO_DEVICE: {
                    CODE: 'job_add_dat_to_device',
                    NAME: 'Job - Add DAT to Device'
                },
                ASSIGN_ASSETTYPE_TO_DEVICE: {
                    CODE: 'job_assign_assetyype_to_device',
                    NAME: 'Job - Add ASSETTYPE to Device'
                },
                ADD_DAT_TO_OTHER_DAT_USER: {
                    CODE: 'job_add_dat_to_other_dat_user',
                    NAME: 'Job - Add DAT to Other DAT User'
                },
                ASSIGN_DAT_TO_DEVICE: {
                    CODE: 'job_assign_dat_to_device',
                    NAME: 'Job - Assign DAT to Device'
                },
                ASSOCIATE_USER_AND_PERSON_TRACKER_DEVICE: {
                    CODE: 'job_associate_user_and_person_tracker_device',
                    NAME: 'Job - Associate User and Person Tracker Device'
                },
                ASSOCIATE_USER_AND_STUDENT_TRACKER_DEVICE: {
                    CODE: 'job_associate_user_and_student_tracker_device',
                    NAME: 'Job - Associate User and student Tracker Device'
                },
                ASSOCIATE_USER_AND_VEHICLE_TRACKER_DEVICE: {
                    CODE: 'job_associate_user_and_vehicle_tracker_device',
                    NAME: 'Job - Associate User and Vehicle Tracker Device'
                },
                ASSOCIATE_USER_STUDENT_REFERENCE_IMAGE: {
                    CODE: 'job_associate_user_student_reference_image',
                    NAME: 'Job - Associate User Student Reference Image'
                },
                DELETE_DAT: {
                    CODE: 'job_delete_dat',
                    NAME: 'Job - Delete DAT'
                },
                DELETE_DEVICE: {
                    CODE: 'job_delete_device',
                    NAME: 'Job - Delete Device'
                },
                DELETE_TASK_DATA: {
                    CODE: 'job_delete_task_data',
                    NAME: 'Job - Delete task datas'
                },
                REPORT: {
                    CODE: 'job_report',
                    NAME: 'Job - Report'
                },
                CONTACT_TRACING: {
                    CODE: 'job_contact_tracing',
                    NAME: 'Job - Contact Tracing'
                },
                DELETE_ENTITY: {
                    CODE: 'job_delete_entity',
                    NAME: 'Job - Delete Entity'
                },
                DEVICE_REPORT: {
                    CODE: 'job_device_report',
                    NAME: 'Job - Device Report'
                },
                DEVICE_USAGE_REPORT: {
                    CODE: 'job_device_usage_report',
                    NAME: 'Job - Device Usage Report'
                },
                DEVICE_USAGE_REPORT_BY_DAT: {
                    CODE: 'job_device_usage_report_by_dat',
                    NAME: 'Job - Device Usage Report by DAT'
                },
                EDIT_DAT: {
                    CODE: 'job_edit_dat',
                    NAME: 'Job - Edit DAT'
                },
                MOVE_DAT_OF_DEVICE: {
                    CODE: 'job_move_dat_of_device',
                    NAME: 'Job - Move DAT of Device'
                },
                REMOVE_DAT_FROM_DEVICE: {
                    CODE: 'job_remove_dat_from_device',
                    NAME: 'Job - Remove DAT from Device'
                },
                RIGHT_TO_DELETE: {
                    CODE: 'job_right_to_delete',
                    NAME: 'Job - Remove user related backups'
                },
                RIGHT_TO_KNOW: {
                    CODE: 'job_right_to_know',
                    NAME: 'Job - explore user related settings'
                },
                TRIGGER_DEVICE_CMD: {
                    CODE: 'job_trigger_device_cmd',
                    NAME: 'Job - Trigger Device CMD'
                },
                DOWNLOAD: {
                    CODE: 'job_download',
                    NAME: 'Job - Download'
                },
                ONBOARD_STATS_REPORT: {
                    CODE: 'job_onboard_stats_report',
                    NAME: 'Job - Onboarded devices stats download'
                },
                AM_REPORT: {
                    CODE: 'job_am_report',
                    NAME: 'Job - AM Report'
                },
                ATTENDANCE_REPORT: {
                    CODE: 'job_attendance_report',
                    NAME: 'Job - Attendance Report'
                },
                ATTENDANCE_DATA: {
                    CODE: 'job_attendance_data',
                    NAME: 'Job - Attendance Data'
                },
                SHOP_REPORT: {
                    CODE: 'job_shop_report',
                    NAME: 'Job - Shop Report'
                },
                TASK_REPORT: {
                    CODE: 'job_shop_report',
                    NAME: 'Job - Shop Report'
                }
            },
        },
        APP_JWT: {
            CODE: 'jwt',
            NAME: 'JWT',
            ISSUER: {
                PROPERTY: 'issuer',
                VALUE: 'borqsio',
                VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.STRING,
                DESCRIPTION: 'issuer name of tokens issued by borqsio server',
            },
            EXPIRY_DURATION_SECONDS: {
                PROPERTY: 'expiry_duration_sec',
                VALUE: 2592000,
                VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                DESCRIPTION: 'sso token expiry duration in seconds',
            },
            AUDIENCE: {
                APPLICATION: BASIC.PLAYER.APPLICATION.CODE
            }
        },

        APP_HTTP: {
            HEADER: {
                CONTENT_TYPE: {
                    KEY: 'Content-Type',
                    APPLICATION: {
                        JSON: 'application/json'
                    }
                },
                AUTHORIZATION: {
                    KEY: 'Authorization',
                    TYPE: {
                        BEARER: 'Bearer '
                    }
                }
            },
            METHODS: {
                DELETE: 'delete',
                GET: 'get',
                POST: 'post',
                PUT: 'put',
                OPTIONS: 'options',
            },
            STATUS: {
                UNKNOWN: {
                    CODE: 100,
                    MESSAGE: 'UNKNOWN'
                },
                OK: {
                    CODE: 200,
                    MESSAGE: 'SUCCESS'
                },
                CREATED: {
                    CODE: 201,
                    MESSAGE: 'CREATED'
                },
                ACCEPTED_PROCESSING: {
                    CODE: 202,
                    MESSAGE: 'ACCEPTED_PROCESSING'
                },
                PARTIAL_SUCCESS: {
                    CODE: 206,
                    MESSAGE: 'PARTIAL_SUCCESS'
                },
                BAD_REQUEST: {
                    CODE: 400,
                    MESSAGE: 'BAD_REQUEST'
                },
                UNAUTHORIZED: {
                    CODE: 401,
                    MESSAGE: 'UNAUTHORIZED'
                },
                FORBIDDEN: {
                    CODE: 403,
                    MESSAGE: 'FORBIDDEN'
                },
                NOT_FOUND: {
                    CODE: 404,
                    MESSAGE: 'NOT_FOUND'
                },
                METHOD_NOT_ALLOWED: {
                    CODE: 405,
                    MESSAGE: 'METHOD_NOT_ALLOWED'
                },
                CONFLICT: {
                    CODE: 409,
                    MESSAGE: 'CONFLICT'
                },
                EXPECTATION_FAILED: {
                    CODE: 417,
                    MESSAGE: 'EXPECTATION_FAILED'
                },
                UNPROCESSABLE: {
                    CODE: 422,
                    MESSAGE: 'UNPROCESSABLE'
                },
                INTERNAL_SERVER_ERROR: {
                    CODE: 500,
                    MESSAGE: 'INTERNAL SERVER ERROR'
                },
                BAD_GATEWAY: {
                    CODE: 500,
                    MESSAGE: 'BAD GATEWAY'
                }
            },
            SEND: {
                SUCCESS: 'sending json',
                SUCCESS_PIPE: 'piping stream',
                ERROR: 'error while processing the request'
            }
        },
        APP_OBJECT: {
            GENERIC: {
                IDENTIFIER_TYPE: {
                    IMEI: 'imei',
                    SERIAL: 'serial',
                    IMSI: 'imsi',
                    MAC: 'mac',
                    PHONE_NUMBER: 'phone',
                    EMAIL: 'email',
                    OTHER_ID: 'otherId'
                },
                NAME: {
                    MIN_LENGTH: 4,
                    MAX_LENGTH: 64
                },
                CODE: {
                    MIN_LENGTH: 3,
                    MAX_LENGTH: 32
                },
                VERSION: {
                    MIN_LENGTH: 1,
                    MAX_LENGTH: 16
                },
                DESCRIPTION: {
                    MIN_LENGTH: 3,
                    MAX_LENGTH: 64
                }
            },
            SETTINGS: {
                PROPERTY: {
                    MIN_LENGTH: 3,
                    MAX_LENGTH: 128
                },
                VALUE: {
                    MIN_LENGTH: 0,
                    MAX_LENGTH: 1024
                },
                VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE
            },
            PHONE_NUMBER: {
                MIN_LENGTH: 3,
                MAX_LENGTH: 13
            }
        },
        APP_ACTION: {
            TYPE: {
                REST_API: 'rest-api'
            }
        },
        APP_OTP: {
            CODE: 'otp',
            NAME: 'OTP',
            REGISTRATION: {
                CODE: 'registration',
                NAME: 'Registration',
                DESCRIPTION: 'otp for user self-registration',
                RETRY_COUNT: {
                    PROPERTY: 'registration.retry_count',
                    VALUE: 3,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'registration otp retry count',
                },
                EXPIRY_DURATION_SECONDS: {
                    PROPERTY: 'registration.expiry_duration_sec',
                    VALUE: 600,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'registration otp expiry duration in secs',
                },
                LENGTH: {
                    PROPERTY: 'registration.length',
                    VALUE: 4,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'registration otp length',
                }
            },
            VERIFY_EMAIL: {
                CODE: 'verify_email',
                NAME: 'Verify Email',
                DESCRIPTION: 'otp for email verification',
                RETRY_COUNT: {
                    PROPERTY: 'verify_email.retry_count',
                    VALUE: 3,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'verify email otp retry count',
                },
                EXPIRY_DURATION_SECONDS: {
                    PROPERTY: 'verify_email.expiry_duration_sec',
                    VALUE: 600,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'verify email otp expiry duration in secs',
                },
                LENGTH: {
                    PROPERTY: 'verify_email.length',
                    VALUE: 4,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'verify email otp length',
                }
            },
            VERIFY_PHONE: {
                CODE: 'verify_phone',
                NAME: 'Verify Phone',
                DESCRIPTION: 'otp for phone verification',
                RETRY_COUNT: {
                    PROPERTY: 'verify_phone.retry_count',
                    VALUE: 3,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'verify phone otp retry count',
                },
                EXPIRY_DURATION_SECONDS: {
                    PROPERTY: 'verify_phone.expiry_duration_sec',
                    VALUE: 600,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                },
                LENGTH: {
                    PROPERTY: 'verify_phone.length',
                    VALUE: 4,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'verify phone otp length',
                }
            },
            RESET_PASSWORD: {
                CODE: 'reset_password',
                NAME: 'Reset Password',
                DESCRIPTION: 'otp for password reset',
                RETRY_COUNT: {
                    PROPERTY: 'reset_password.retry_count',
                    VALUE: 3,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'reset password otp retry count',
                },
                EXPIRY_DURATION_SECONDS: {
                    PROPERTY: 'reset_password.expiry_duration_sec',
                    VALUE: 600,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'reset password otp expiry duration in secs',
                },
                LENGTH: {
                    PROPERTY: 'reset_passwordlength',
                    VALUE: 4,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'reset password otp length',
                }
            },
            OTP_LOGIN: {
                CODE: 'login',
                NAME: 'Otp based login',
                DESCRIPTION: 'otp based login',
                RETRY_COUNT: {
                    PROPERTY: 'otp_login.retry_count',
                    VALUE: 3,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'otp retry count for otp based login',
                },
                EXPIRY_DURATION_SECONDS: {
                    PROPERTY: 'otp_login.expiry_duration_sec',
                    VALUE: 600,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'otp expiry duration in sec for otp based login',
                },
                LENGTH: {
                    PROPERTY: 'otp_login.length',
                    VALUE: 4,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'otp length for  otp based login',
                }
            },
            EMAIL_OTP_LOGIN: {
                CODE: 'email_otp_login',
                NAME: 'Email/Otp based login',
                DESCRIPTION: 'email/otp based login',
                RETRY_COUNT: {
                    PROPERTY: 'email_otp_login.retry_count',
                    VALUE: 3,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'otp retry count for email/otp based login',
                },
                EXPIRY_DURATION_SECONDS: {
                    PROPERTY: 'email_otp_login.expiry_duration_sec',
                    VALUE: 600,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'otp expiry duration in sec for email/otp based login',
                },
                LENGTH: {
                    PROPERTY: 'email_otp_login.length',
                    VALUE: 4,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'otp length for  email/otp based login',
                }
            },
            PHONE_OTP_LOGIN: {
                CODE: 'phone_otp_login',
                NAME: 'Phone/Otp based login',
                DESCRIPTION: 'phone/otp based login',
                RETRY_COUNT: {
                    PROPERTY: 'phone_otp_login.retry_count',
                    VALUE: 3,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'otp retry count for phone/otp based login',
                },
                EXPIRY_DURATION_SECONDS: {
                    PROPERTY: 'phone_otp_login.expiry_duration_sec',
                    VALUE: 600,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'otp expiry duration in sec for phone/otp based login',
                },
                LENGTH: {
                    PROPERTY: 'phone_otp_login.length',
                    VALUE: 4,
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                    DESCRIPTION: 'otp length for  phone/otp based login',
                }
            },
            TYPE: {
                PROPERTY: 'type',
                NUMERIC: {
                    VALUE: 'numeric',
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'numeric otp',
                },
                ALPHABETIC: {
                    VALUE: 'alphabetic',
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'alphabetic otp',
                },
                ALPHA_NUMERIC: {
                    VALUE: 'alpha_numeric',
                    VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'alpha numeric otp',
                },
            },
            RETRY_COUNT: {
                PROPERTY: 'retry_count',
                VALUE: 3,
                VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                DESCRIPTION: 'common otp retry count',
            },
            EXPIRY_DURATION_SECONDS: {
                PROPERTY: 'expiry_duration_sec',
                VALUE: 600000,
                VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                DESCRIPTION: 'common otp expiry duration in sec',
            },
            LENGTH: {
                PROPERTY: 'length',
                VALUE: 4,
                VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                DESCRIPTION: 'common otp length',
            }
        },
        APP_STRING: {
            TRUE: 'true',
            FALSE: 'false',
            UNKNOWN: 'UNKNOWN',
            GIN: 'GIN',
            GOUT: 'GOUT',
            FORWARD_SLASH: '/',
            PIPE: '|',
            SEPARATOR: {
                COMMA: ','
            },
            STAR: '*',
            WHITESPACE: ' ',
            EMPTY: '',
            DOT: '.',
        },
        APP_ERROR: {
            TYPE: {
                DATA: 'Data error',
                SYSTEM: 'System error',
                UNKNOWN: 'Unknown error'
            },
            SUCCESS: {
                MESSAGE: 'success',
                SUBCODE: 0
            },
            AUTH_ERROR: {   //1 to 10
                INVALID_TOKEN: {
                    MESSAGE: 'unauthorized! invalid token',
                    SUBCODE: 1
                },
                TOKEN_INSUFFICIENT_AUTHORIZATION: {
                    MESSAGE: 'unauthorized! insufficient privilege',
                    SUBCODE: 2
                },
                TOKEN_NOT_PROVIDED: {
                    MESSAGE: 'unauthorized! token not provided',
                    SUBCODE: 3
                },
                TOKEN_VERIFICATION_ERROR: {
                    MESSAGE: 'token could not be verified',
                    SUBCODE: 4
                },
                USER_NOT_FOUND: {
                    MESSAGE: 'user not found',
                    SUBCODE: 5
                },
                USER_DETAILS_NOT_PROVIDED: {
                    MESSAGE: 'user details not provided',
                    SUBCODE: 6
                },
                AUTHENTICATION_ERROR: {
                    MESSAGE: 'authentication error',
                    SUBCODE: 7
                },
                AUTHORIZATION_ERROR: {
                    MESSAGE: 'authorization error',
                    SUBCODE: 8
                },
                AUTHORIZATION_ERROR_NOT_IN_HIERARCHY: {
                    MESSAGE: 'authorization error, not in hierarchy',
                    SUBCODE: 9
                }
            },
            SUBJECT_ERROR: {   //11 to 20
                NOT_PROVIDED: {
                    MESSAGE: 'subject not provided',
                    SUBCODE: 11
                },
                NOT_FOUND: {
                    MESSAGE: 'subject does not exist',
                    SUBCODE: 12
                },
            },
            MONGO_ERROR: {  //21 to 40
                ERROR_PROVIDED_KEY_ALREADY_IN_USE: {
                    MONGO_CODE: '11000',
                    MESSAGE: 'db error - provided key is already in use',
                    SUBCODE: 21
                },
                ERROR_CURSOR_NOT_FOUND: {
                    MONGO_CODE: '43',
                    MESSAGE: 'db error - cursor not found',
                    SUBCODE: 22
                },
                ERROR_MONGO_CAST: {
                    MESSAGE: 'db error - cast error',
                    SUBCODE: 23
                },
                ERROR_UNKNOWN_MONGO: {
                    MESSAGE: 'db error - unknown mongo error',
                    SUBCODE: 30
                },
                ERROR_VALIDATION: {
                    MESSAGE: 'validation error',
                    SUBCODE: 31
                },
                ERROR_CAST: {
                    MESSAGE: 'cast error',
                    SUBCODE: 32
                },
                ERROR_UNKNOWN: {
                    MESSAGE: 'unknown error',
                    SUBCODE: 40
                },
            },
            AXIOS_ERROR: {
                SERVER_ERROR: {
                    AXIOS_STATUS_CODE: 'tbd',
                    MESSAGE: 'recieved failure status code from server',
                    SUBCODE: 51
                },
                NO_RESPONSE: {
                    MESSAGE: 'no response from server',
                    SUBCODE: 52
                },
                UNKNOWN: {
                    MESSAGE: 'unknown',
                    SUBCODE: 53
                }
            },
            REQUEST_VALIDATION_ERROR: { //41 to 100
                REQUEST_FIELD_MISSING: {
                    MESSAGE: 'request validation error, missing field in request',
                    SUBCODE: 41
                },
                REQUEST_FIELD_INVALID: {
                    MESSAGE: 'request validation error, invalid value in request',
                    SUBCODE: 42
                },
                REQUEST_FIELD_MISSING_OR_INVALID: {
                    MESSAGE: 'request validation error, missing field or invalid value in request',
                    SUBCODE: 43
                },
                REQUEST_FIELD_ALPNUM_OR_UNDSCR_ALLOWED: {
                    MESSAGE: 'request validation error, only alphabets, numbers or underscore allowed',
                    SUBCODE: 44
                },
                REQUEST_FIELD_ALPNUM_OR_SPACE_ALLOWED: {
                    MESSAGE: 'request validation error, only alphabets, numbers or space allowed',
                    SUBCODE: 45
                },
                REQUEST_FIELD_NOT_ALLOWED: {
                    MESSAGE: 'request validation error, unallowed field in request',
                    SUBCODE: 46
                },
                REQUEST_HEADER_MISSING: {
                    MESSAGE: 'request validation error, unallowed field in request',
                    SUBCODE: 47
                }

            }
        },
        APP_TEST: {
            CODE: 'test',
            NAME: 'Test',
            INCLUDE_OTP_IN_REST_RESPONSE: {
                PROPERTY: 'include_otp_in_rest_response',
                VALUE: false,
                VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.BOOLEAN,
                DESCRIPTION: 'for test only - includes otp in rest response'
            },
            INCLUDE_ALL_FIELDS_IN_REST_RESPONSE: {
                PROPERTY: 'include_all_fields_in_rest_response',
                VALUE: false,
                VALUE_TYPE: BASIC.SUPPORTED_DATA_TYPE.BOOLEAN,
                DESCRIPTION: 'for test only - includes all fields in rest response'
            }
        }
    }
};
