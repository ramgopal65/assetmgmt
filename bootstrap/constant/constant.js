const CommonConstants = require('../../common/constant/constant');

module.exports = {
    BOOTSTRAP: {
        APP_JWT: {
            AUDIENCE: {
                APPLICATION: CommonConstants.COMMON.APP_PLAYER.APPLICATION.CODE,
            }
        },
        APP_ACTION: {
            RESOURCE: {
                APPLICATION: 'application',
                SETTING: 'setting',
            },
            ACTION: {
                APPLICATION: {
                    GET_ALL: 'get_all',
                    GET_ONE_BY_ID: 'get_one_by_id',
                    GET_ONE_BY_CODE: 'get_one_by_code',
                    LOGIN: 'login',
                },
                SETTING: {
                    CREATE_ONE: 'create_one',
                    GET_ALL_COUNT: 'get_all_count',
                    GET_ONE_BY_APPCODE_CATCODE_PROPERTY: 'get_one_by_application_code_category_code_property',
                    GET_MANY_SORT_SELECT: 'get_many',
                    GET_ONE_BY_ID: 'get_one_by_id',
                    SEARCH_COUNT: 'search_count',
                    SEARCH: 'search',
                    UPDATE_ONE_BY_ID: 'update_one_by_id',
                    DELETE_ONE_BY_ID: 'delete_one_by_id',
                    DELETE_MULTIPLE_BY_IDS: 'delete_multiple_by_ids',
                }
            }
        },
        GENERIC: {
            ERROR: 'error in bootstrap',
            ERROR_ENV_DB_URL_NOT_SET: 'db connection failed. ASSETMGMT_BOOTSTRAP_DB_URL environment variable is not set. Please set it and restart this service to continue',
            ERROR_ENV_JWT_SECRET_NOT_SET: 'ASSETMGMT_JWT_SECRET environment variable is not set. set it and restart this service to continue',
            //CHANGE_PUBLISH_ERROR: 'error in publishing',
            //CHANGE_PUBLISH_KAFKA_ERROR: 'error in publishing. kafka error',
            //CHANGE_PUBLISH_SUCCESS: 'published successfully',
            EXITING: 'exiting bootstrap abruptly..',
            PROVISION_ERROR: 'provision failed',
            DB_CONNECTION_SUCCESS: 'database connection successful',
            DB_CONNECTION_ERROR: 'database connection error',
            DB_CONNECTION_CLOSED: 'database connection closed',
            PROVISION_SUCCESS: 'provision successful',
            PORT_REQUIRES_ELEVATED_PRIVILEDGES: ' requires elevated privileges',
            PORT_ALREADY_IN_USE: ' is already in use',
            SRVER_LISSTENING_ON_PORT: 'bootstrap http server listening on ',
            SERVER_ALREADY_RUNNING_ON_PORT: 'bootstrap server is already running on port - ',
            STARTING_SERVER: 'starting bootstrap server...'
        },
        PROVISION: {
            APPLICATIONS: {
                BOOTSTRAP: {
                    SUCCESS: 'bootstrap application provisioned successfully. ',
                    NOTHING_TO_PROVISION: 'bootstrap application is already provisioned',
                    ERROR: 'error in provisioning bootstrap application.',
                },
                MISSING: {
                    GET_ALL_ERROR: 'error while fetching all applications. ',
                    NUM_TO_PROVISION: 'number of missing applications to provision - ',
                    SUCCESS: 'all missing applications provisioned successfully. ',
                    NOTHING_TO_PROVISION: 'no missing applications found to provision',
                    CREATE_ERROR: 'error while creating missing applications. ',
                    ERROR: 'error while provisioning missing applications. '
                },
                ALL: {
                    SUCCESS: 'all missing applications provisioned successfully. ',
                    ERROR: 'error while provisioning missing applications'
                },
                ERROR: 'error while provisioning applications'
            },
            SETTINGS: {
                MISSING: {
                    GET_ALL_ERROR: 'error while fetching settings',
                    GET_ALL_COUNT_ERROR: 'error while fetching settings count',
                    NUM_TO_PROVISION: 'number of missing settings to provision - ',
                    SUCCESS: 'all missing settings provisioned successfully. ',
                    NOTHING_TO_PROVISION: 'no missing settings found to provision',
                    CREATE_ERROR: 'error while creating missing settings',
                    ERROR: 'error while provisioning missing settings'
                },
                ALL: {
                    SUCCESS: 'all missing settings provisioned successfully. ',
                    ERROR: 'error while provisioning missing settings'
                },
                ERROR: 'error while provisioning settings'
            },
            ADMIN_LOGIN_ERROR: 'failed to login provided admin user - '
        },
        APPLICATIONS: {
            APPLICATION_LOGIN: {
                SUCCESS: 'application login is successful for - ',
                ERROR: 'application login failed for - ',
                UNKNOWN_APPLICATION_CODE: 'unknown application code'
            },
            CREATE_ONE: {
                SUCCESS: 'one application created successfully',
                ERROR: 'error while creating one application'
            },
            CREATE_MULTIPLE: {
                SUCCESS: 'multiple applications created successfully',
                ERROR: 'error while creating multiple applications'
            },
            GET_ONE_BY_ID: {
                SUCCESS: 'one application retrieved successfully by id',
                SUCCESS_NO_DATA: 'no application found with given id',
                ERROR: 'error while retrieving one application by id'
            },
            GET_ONE_BY_CODE: {
                SUCCESS: 'one application retrieved successfully by code',
                SUCCESS_NO_DATA: 'no application found with given code',
                ERROR: 'error while retrieving one application by code'
            },
            GET_ALL: {
                SUCCESS: 'applications retrieved successfully',
                SUCCESS_NO_DATA: 'no applications were found',
                ERROR: 'error while retrieving applications'
            },
            UPDATE_ONE_BY_ID: {
                SUCCESS: 'one application updated successfully by id',
                SUCCESS_NO_DATA: 'no application found with given id',
                ERROR: 'error while updating one application by id'
            },
        },
        SETTINGS: {
            CREATE: {
                SUCCESS: 'setting created successfully',
                ERROR: 'error while creating setting'
            },
            CREATE_ONE: {
                SUCCESS: 'one setting created successfully',
                ERROR: 'error while creating one setting'
            },
            CREATE_MULTIPLE: {
                SUCCESS: 'multiple settings created successfully',
                ERROR: 'error while creating multiple settings'
            },
            GET_ALL: {
                SUCCESS: 'settings retrieved successfully',
                SUCCESS_NO_DATA: 'no settings were found',
                ERROR: 'error while retrieving settings'
            },
            GET_ALL_COUNT: {
                SUCCESS: 'settings count retrieved successfully',
                ERROR: 'error while retrieving settings count'
            },
            GET_ONE_BY_ID: {
                SUCCESS: 'one setting retrieved successfully by id',
                SUCCESS_NO_DATA: 'no settings found with given id',
                ERROR: 'error while retrieving one setting by id'
            },
            GET_ONE_BY_CODE: {
                SUCCESS: 'one setting retrieved successfully by code',
                SUCCESS_NO_DATA: 'no settings found with given code',
                ERROR: 'error while retrieving one setting by code'
            },
            GET_ONE: {
                SUCCESS: 'one setting retrieved successfully ',
                SUCCESS_NO_DATA: 'no settings found with given qualifier',
                ERROR: 'error while retrieving one settings with given qualifier'
            },
            SEARCH: {
                SUCCESS: 'settings retrieved successfully',
                SUCCESS_NO_DATA: 'no settings found with the search key',
                ERROR: 'error while searching settings',
                ERROR_INVALID_CONDITION: 'Either invalid or no search condition found'
            },
            SEARCH_COUNT: {
                SUCCESS: 'settings count retrieved successfully',
                SUCCESS_NO_DATA: 'no settings found with the search key',
                ERROR: 'error while searching settings count',
                ERROR_INVALID_CONDITION: 'Either invalid or no search condition found'
            },
            UPDATE_ONE_BY_ID: {
                SUCCESS: 'one setting updated successfully by id',
                ERROR: 'error while updating one setting by id',
                ERROR_ID_NOT_FOUND: 'no settings found with this id'
            },
            DELETE_ONE_BY_ID: {
                SUCCESS: 'one setting deleted successfully by id',
                ERROR: 'error while deleting one setting by id',
                ERROR_ID_NOT_FOUND: 'no settings found with this id'
            },
            DELETE_MULTIPLE_BY_ID: {
                SUCCESS: 'multiple setting deleted successfully by id',
                ERROR: 'error while deleting multiple setting by id',
                ERROR_ID_NOT_FOUND: 'no settings found with this id'
            }
        },
        SETTINGS_FETCH_ERROR: 'error while fetching settings',
        SETTINGS_FETCH_SUCCESS: 'successfully fetched settings'

    }
};
