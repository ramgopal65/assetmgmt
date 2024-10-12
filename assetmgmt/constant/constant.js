const CommonConstants = require('../../common/constant/constant');
const AuthConstant = require('./auth-constant');
const CustomExtendableConstants = require('./custom-extendable-constant');

function array2Obj(arr) {
    let retObj = {};
    for (let i = 0; i < arr.length; i++) {
        retObj[arr[i]] = arr[i];
    }
    return retObj;
}

const APP_ACTION = {
    RESOURCE: {
        ADMINROLE: 'adminrole',
        ADMINUSER: 'adminuser',
        USER: 'user',
        POST: 'post',
        WHITELIST: 'whitelist',
        TESTIMONIAL: 'testimonial',
        TAG: 'tag',
        COURT: 'court'
    },
    ACTION: {
        USER: {
            CREATE: {
                API_NAME: 'user.create',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.OTHER,
                SUBJECT_LOCATION: AuthConstant.SUBJECT_LOCATION_IN_REQ.REQ_BODY_IDENTIFIER,
                ALLOWED_ROLE_MAP: {
                    [CustomExtendableConstants.USER_ROLE_NAMES.SUPERADMIN]: [
                        CustomExtendableConstants.USER_ROLE_NAMES.ADMIN
                    ],
                    [CustomExtendableConstants.USER_ROLE_NAMES.ADMIN]: [
                        CustomExtendableConstants.USER_ROLE_NAMES.ADMIN,
                        CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER,
                        'reviewer'
                    ],
                    [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER]:
                        [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER].concat(CustomExtendableConstants.USER_ROLES.filter(el => (!el.SYSTEM_ROLE)).map(el => el.CODE)),
                    [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER]:
                        [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER].concat(CustomExtendableConstants.USER_ROLES.filter(el => (!el.SYSTEM_ROLE)).map(el => el.CODE))
                }
            },
            OTP: {
                API_NAME: 'user.otp',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.REQ_BODY_IDENTIFIER,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.SAME,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => (!el.SYSTEM_ROLE)).map(el => el.CODE))
            },
            OTP_FOR_REGISTRATION: {
                API_NAME: 'user.otp_for_register',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.REQ_BODY_IDENTIFIER,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.SAME,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => (!el.SYSTEM_ROLE)).map(el => el.CODE))
            },
            OTP_REGISTER: {
                API_NAME: 'user.register_using_otp',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.REQ_PARAMS_ID,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.SAME,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => (!el.SYSTEM_ROLE)).map(el => el.CODE))
            },
            OTP_REGISTER_LOGIN: {
                API_NAME: 'user.register_and_login_using_otp',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.REQ_PARAMS_ID,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.SAME,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => (!el.SYSTEM_ROLE)).map(el => el.CODE))
            },
            OTP_FOR_LOGIN: {
                API_NAME: 'user.otp_for_login',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.REQ_BODY_IDENTIFIER,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.SAME,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.map(el => el.CODE))
            },
            OTP_LOGIN: {
                API_NAME: 'user.login_using_otp',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.REQ_BODY_IDENTIFIER,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.SAME,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.map(el => el.CODE))
            },
            PASSWORD_LOGIN: {
                API_NAME: 'user.login_using_password',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.REQ_BODY_IDENTIFIER,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.SAME,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.map(el => el.CODE))
            },
            LOGOUT: {
                API_NAME: 'user.logout',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.SAME,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.map(el => el.CODE))
            },
            TOKEN_REFRESH: {
                API_NAME: 'user.token_refresh',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.SAME,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.map(el => el.CODE))
            },
            READ_SELF: {
                API_NAME: 'user.read_self',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.SAME,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.map(el => el.CODE))
            },
            READ: {
                API_NAME: 'user.read',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.OTHER,
                SUBJECT_LOCATION: AuthConstant.SUBJECT_LOCATION_IN_REQ.REQ_PARAMS_ID,
                ALLOWED_ROLE_MAP: {
                    [CustomExtendableConstants.USER_ROLE_NAMES.SUPERADMIN]: [
                        CustomExtendableConstants.USER_ROLE_NAMES.SUPERADMIN,
                        CustomExtendableConstants.USER_ROLE_NAMES.ADMIN
                    ],
                    [CustomExtendableConstants.USER_ROLE_NAMES.ADMIN]: [
                        CustomExtendableConstants.USER_ROLE_NAMES.ADMIN,
                        CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER
                    ],
                    [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER]: [
                        CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER
                    ].concat(CustomExtendableConstants.USER_ROLES.filter(el => (!el.SYSTEM_ROLE)).map(el => el.CODE)),
                    [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER]: CustomExtendableConstants.USER_ROLES.filter(el => (!el.SYSTEM_ROLE)).map(el => el.CODE),
                    ['reviewer']: CustomExtendableConstants.USER_ROLES.filter(el => (!el.SYSTEM_ROLE)).map(el => el.CODE)
                }
            },
            READ_PROFILE_PIC_SELF: {
                API_NAME: 'user.read_profile_pic_self',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.SAME,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.map(el => el.CODE))
            },
            UPDATE_PROFILE_PIC_SELF: {
                API_NAME: 'update_profile_pic_self',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.SAME,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.map(el => el.CODE))
            },
            UPDATE_SELF: {
                API_NAME: 'user.update_self',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.SAME,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.map(el => el.CODE))
            },
            UPDATE: {
                API_NAME: 'user.update',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.OTHER,
                SUBJECT_LOCATION: AuthConstant.SUBJECT_LOCATION_IN_REQ.REQ_PARAMS_ID,
                ALLOWED_ROLE_MAP: {
                    [CustomExtendableConstants.USER_ROLE_NAMES.SUPERADMIN]: [
                        CustomExtendableConstants.USER_ROLE_NAMES.ADMIN
                    ],
                    [CustomExtendableConstants.USER_ROLE_NAMES.ADMIN]: [
                        CustomExtendableConstants.USER_ROLE_NAMES.ADMIN,
                        CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER
                    ],
                    [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER]:
                        [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER].concat(CustomExtendableConstants.USER_ROLES.filter(el => (!el.SYSTEM_ROLE)).map(el => el.CODE)),
                    [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER]:
                        [].concat(CustomExtendableConstants.USER_ROLES.filter(el => (!el.SYSTEM_ROLE)).map(el => el.CODE))
                }
            },
            DELETE_SELF: {
                API_NAME: 'user.delete_self',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.SAME,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.map(el => el.CODE))
            },
            DELETE: {
                API_NAME: 'user.delete',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.OTHER,
                SUBJECT_LOCATION: AuthConstant.SUBJECT_LOCATION_IN_REQ.REQ_PARAMS_ID,
                ALLOWED_ROLE_MAP: {
                    [CustomExtendableConstants.USER_ROLE_NAMES.SUPERADMIN]: [
                        CustomExtendableConstants.USER_ROLE_NAMES.ADMIN
                    ],
                    [CustomExtendableConstants.USER_ROLE_NAMES.ADMIN]: [
                        CustomExtendableConstants.USER_ROLE_NAMES.ADMIN,
                        CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER
                    ],
                    [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER]:
                        [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER].concat(CustomExtendableConstants.USER_ROLES.filter(el => (!el.SYSTEM_ROLE)).map(el => el.CODE)),
                    [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER]:
                        [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER].concat(CustomExtendableConstants.USER_ROLES.filter(el => (!el.SYSTEM_ROLE)).map(el => el.CODE))
                }
            },
            SEARCH_COUNT: {
                API_NAME: 'user.search_count',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.UNKNOWN,
                ALLOWED_ROLE_MAP: {
                    [CustomExtendableConstants.USER_ROLE_NAMES.SUPERADMIN]: [CustomExtendableConstants.USER_ROLE_NAMES.SUPERADMIN],
                    [CustomExtendableConstants.USER_ROLE_NAMES.ADMIN]: [CustomExtendableConstants.USER_ROLE_NAMES.ADMIN],
                    [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER]: [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER],
                    [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER]: [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER]
                }
            },
            SEARCH: {
                API_NAME: 'user.search',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.UNKNOWN,
                ALLOWED_ROLE_MAP: {
                    [CustomExtendableConstants.USER_ROLE_NAMES.SUPERADMIN]: [CustomExtendableConstants.USER_ROLE_NAMES.SUPERADMIN],
                    [CustomExtendableConstants.USER_ROLE_NAMES.ADMIN]: [CustomExtendableConstants.USER_ROLE_NAMES.ADMIN],
                    [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER]: [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER],
                    [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER]: [CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER]
                }
            },
            BUY_CREDIT: {
                API_NAME: 'user.buy_credit',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_USER_RELATION: AuthConstant.CALLER_USER_SUBJECT_USER_RELATION.SAME,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => (el.CODE === 'player')).map(el => el.CODE))
            },

        },
        POST: {
            CREATE: {
                API_NAME: 'post.create',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === 'player') || (el.CODE === 'reviewer'))).map(el => el.CODE))
            },  //TODO - cleanup the player, reviewer here
            CREATE_SESSION: {
                API_NAME: 'post.create_session',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => (el.CODE === 'player')).map(el => el.CODE))
            },
            ADD_SESSION_VIDEO: {
                API_NAME: 'post.add_session_video',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                POST_LOCATION: AuthConstant.POST_LOCATION_IN_REQ.REQ_PARAMS_ID,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => (el.CODE === 'player')).map(el => el.CODE))
            },
            DELETE_SESSION: {
                API_NAME: 'post.delete_session',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => (el.CODE === 'player')).map(el => el.CODE))
            },
            USAGE_REPORT: {
                API_NAME: 'post.usage_report',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => (el.CODE === 'player')).map(el => el.CODE))
            },
            USAGE_COUNT: {
                API_NAME: 'post.usage_count',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => (el.CODE === 'player')).map(el => el.CODE))
            },
            READ: {
                API_NAME: 'post.fetch_post',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => ((el.LEVEL >= CustomExtendableConstants.CUSTOM_USER_ROLE_START_LEVEL))).map(el => el.CODE))
            },
            UPDATE: {
                API_NAME: 'post.update',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => (el.CONTENT_OWNER)).map(el => el.CODE))
            },
            UPDATE_FAVOURITE: {
                API_NAME: 'post.update_favourite',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => (el.CONTENT_OWNER)).map(el => el.CODE))
            },
            DELETE: {
                API_NAME: 'post.delete',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => ((el.LEVEL >= CustomExtendableConstants.CUSTOM_USER_ROLE_START_LEVEL))).map(el => el.CODE))
            },
            REVIEW_REQUEST: {
                API_NAME: 'post.review_request',
            },
            REVIEW_RESPONSE: {
                API_NAME: 'post.review_response',
            },
            SEARCH_COUNT: {
                API_NAME: 'post.search_count',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => ((el.LEVEL >= CustomExtendableConstants.CUSTOM_USER_ROLE_START_LEVEL))).map(el => el.CODE))
            },
            SEARCH: {
                API_NAME: 'post.search',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: array2Obj(CustomExtendableConstants.USER_ROLES.filter(el => ((el.LEVEL >= CustomExtendableConstants.CUSTOM_USER_ROLE_START_LEVEL))).map(el => el.CODE))
            },
        },
        WHITELIST: {
            CREATE: {
                API_NAME: 'whitelist.create',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER))).map(el => el.CODE)
            },
            CREATE_MULTIPLE: {
                API_NAME: 'whitelist.create_multiple',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER))).map(el => el.CODE)
            },
            READ: {
                API_NAME: 'whitelist.read',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER) || (!el.SYSTEM_ROLE))).map(el => el.CODE)
            },
            READ_MULTIPLE: {
                API_NAME: 'whitelist.read_multiple',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER) || (!el.SYSTEM_ROLE))).map(el => el.CODE)
            },
            UPDATE_ONE: {
                API_NAME: 'whitelist.update_one',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER))).map(el => el.CODE)
            },
            DELETE: {
                API_NAME: 'whitelist.delete',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER))).map(el => el.CODE)
            },
            DELETE_MULTIPLE: {
                API_NAME: 'whitelist.delete_multiple',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER))).map(el => el.CODE)
            },
        },
        TESTIMONIAL: {
            CREATE: {
                API_NAME: 'testimonial.create',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER))).map(el => el.CODE)
            },
            READ: {
                API_NAME: 'testimonial.read',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER) || (!el.SYSTEM_ROLE))).map(el => el.CODE)
            },
            SEARCH: {
                API_NAME: 'testimonial.search',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER) || (!el.SYSTEM_ROLE))).map(el => el.CODE)
            }
        },
        TAG: {
            CREATE: {
                API_NAME: 'tag.create',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER))).map(el => el.CODE)
            },
            READ: {
                API_NAME: 'tag.read',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER) || (!el.SYSTEM_ROLE))).map(el => el.CODE)
            }
        },
        COURT: {
            CREATE: {
                API_NAME: 'court.create',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER))).map(el => el.CODE)
            },
            CREATE_MULTIPLE: {
                API_NAME: 'court.create_multiple',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER))).map(el => el.CODE)
            },
            READ: {
                API_NAME: 'court.read',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => (
                    (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) ||
                    (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER)) || 
                    (el.CODE === 'player')).map(el => el.CODE)
            },
            READ_MULTIPLE: {
                API_NAME: 'court.read_multiple',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER))).map(el => el.CODE)
            },
            UPDATE_ONE: {
                API_NAME: 'court.update_one',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER))).map(el => el.CODE)
            },
            DELETE: {
                API_NAME: 'court.delete',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER))).map(el => el.CODE)
            },
            DELETE_MULTIPLE: {
                API_NAME: 'court.delete_multiple',
                CALLER_LOCATION: AuthConstant.CALLER_LOCATION_IN_REQ.AUTHORIZATION_TOKEN,
                // CALLER_USER_SUBJECT_POST_RELATION: AuthConstant.CALLER_USER_SUBJECT_POST_RELATION.SAME_USER_POST,
                ALLOWED_ROLE_MAP: CustomExtendableConstants.USER_ROLES.filter(el => ((el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_ROOT_OWNER) || (el.CODE === CustomExtendableConstants.USER_ROLE_NAMES.ENTERPRISE_OWNER))).map(el => el.CODE)
            },
        }
    }
};

let BASIC = {
    SUPPORTED_DATA_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE,
    /*
    * PLAYER(ACTOR) in assetmgmt
    */
    PLAYER: {
        ASSET_OR_TRACKER: {
            CODE: 'asset-tracker',
        },
        ASSET: {
            CODE: 'asset',
            TYPE: {
                PERSON: 'person',
                WORKER: 'worker',
                VEHICLE: 'vehicle'
            }
        },
        TRACKER: {
            CODE: 'tracker',
        },
        USER: {
            ROLE: CustomExtendableConstants.USER_ROLES,
            CUSTOM_USER_ROLE_START_LEVEL: CustomExtendableConstants.CUSTOM_USER_ROLE_START_LEVEL,
            STATE: {
                REGISTERING: {
                    CODE: 'registering',
                    REASON: 'requested otp for registration'
                },
                ACTIVE: {
                    NEVER_LOGGED_IN: {
                        CODE: 'active_never_logged_in',
                        REASON: 'never logged in'
                    },
                    LOGGED_IN: {
                        CODE: 'active_logged_in',
                        REASON: 'logged in'
                    },
                    LOGGED_OUT: {
                        CODE: 'active_logged_out',
                        REASON: 'logged out'
                    },
                },
                LOCKED: {
                    CODE: 'locked',
                    REASON: {
                        EXCEEDED_REGISTRATION_OTP_GENERATION_COUNT: 'exceeded otp generation attempts for registration',
                        EXCEEDED_LOGIN_OTP_GENERATION_COUNT: 'exceeded otp generation attempts for login',
                        EXCEEDED_LOGIN_WRONG_PASSWORD_COUNT: 'exceeded wrong password attempts for login',
                        EXCEEDED_REGISTRATION_OTP_VALIDATION_COUNT: 'exceeded wrong otp attempts for registration',
                        EXCEEDED_LOGIN_OTP_VALIDATION_COUNT: 'exceeded wrong otp attempts for login',
                    }
                }
            }
        },
        SERVER: {
            CODE: 'server',
            NAME: 'Server'
        }
    },
    PROPERTY: {
        NAME: 'propName',
        VALUE_TYPE: 'propValueType',
        JSON_OBJECT_TYPE: 'propJsonObjectType',
        DESCRIPTION: 'propDescription'
    },
    INTERACTION: {
        CODE: 'code',
        DESCRIPTION: 'description',
        CONDITION: 'condition',
        ORIGIN: 'origin',
        DESTINATION: 'destination',
        SUPPORTED_PAYLOAD_VERSIONS: 'supportedPayloadVersions',
        DATA: 'data'
    }
};

module.exports = {
    ASSETMGMT: {
        APP_PLAYER: BASIC.PLAYER,
        APP_USER_ROLE_NAMES: CustomExtendableConstants.USER_ROLE_NAMES,
        APP_USER_ROLE_ASSOCIATION: CustomExtendableConstants.USER_ROLE_ASSOCIATION,
        APP_USER_HIERARCHICAL_ROLE_TYPE: CustomExtendableConstants.USER_HEIRARCHICAL_ROLE_TYPE,
        APP_FEATURE: {
            GENERIC: {
                NAME: {
                    MIN_LENGTH: 3,
                    MAX_LENGTH: 64
                },
                CODE: {
                    MIN_LENGTH: 3,
                    MAX_LENGTH: 64
                },
                DESCRIPTION: {
                    MIN_LENGTH: 4,
                    MAX_LENGTH: 64
                },
            },
            LOCATION: {
                NAME: 'Location',
                CODE: 'loc',
                DESCRIPTION: 'Location feature',
            },
            SCHEDULED_LOCATION: {
                NAME: 'Scheduled location',
                CODE: 'schloc',
                DESCRIPTION: 'Scheduled location feature',
            },
            TELEMETRY: {
                NAME: 'telemetry',
                CODE: 'tel',
                DESCRIPTION: 'Telemetry feature',
            },
            GEOFENCE: {
                NAME: 'Geofence',
                CODE: 'geo',
                DESCRIPTION: 'Geofence feature',
                MAX_SIZE: 4,
                MIN_RAD: 50,
                MAX_RAD: 500,
            },
            PHONEBOOK: {
                NAME: 'Phonebook',
                CODE: 'pbk',
                DESCRIPTION: 'Phonebook feature',
                MAX_SIZE: 8,
            },
            SPEED: {
                NAME: 'Speed',
                CODE: 'spd',
                DESCRIPTION: 'Speed feature',
            },
            DETAIL: {
                NAME: 'Details',
                CODE: 'det',
                DESCRIPTION: 'Asset or tracker details feature',
            },
            SOS: {
                NAME: 'SOS',
                CODE: 'sos',
                DESCRIPTION: 'SOS  feature',
            },
            TASK: {
                NAME: 'Task',
                CODE: 'tsk',
                DESCRIPTION: 'Task feature',
            },
            INCIDENT: {
                NAME: 'Incident',
                CODE: 'inc',
                DESCRIPTION: 'Incident feature',
            },
            ATTENDANCE: {
                NAME: 'Attendance',
                CODE: 'att',
                DESCRIPTION: 'Attendance feature',
            }
        },
        APP_INTERACTION: {
            LOCATION_SETTING: {
                [BASIC.INTERACTION.CODE]: 'locset',
                [BASIC.INTERACTION.DESCRIPTION]: 'Frequency and schedule for location publish',
                [BASIC.INTERACTION.CONDITION]: 'At server discretion',
                [BASIC.INTERACTION.ORIGIN]: BASIC.PLAYER.SERVER.CODE,
                [BASIC.INTERACTION.DESTINATION]: BASIC.PLAYER.ASSET_OR_TRACKER.CODE,
                [BASIC.INTERACTION.SUPPORTED_PAYLOAD_VERSIONS]: [1.0, 1.1],
                [BASIC.INTERACTION.DATA]: [
                    {
                        [BASIC.PROPERTY.NAME]: 'interval',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'location publish interval'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'start',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        [BASIC.PROPERTY.DESCRIPTION]: 'location publish start time'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'end',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        [BASIC.PROPERTY.DESCRIPTION]: 'location publish end time'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'daysOfWeek',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        [BASIC.PROPERTY.DESCRIPTION]: 'location publish days of week'
                    }
                ]
            },
            LOCATION_PUBLISH: {
                [BASIC.INTERACTION.CODE]: 'loc',
                [BASIC.INTERACTION.DESCRIPTION]: 'Location data publishing',
                [BASIC.INTERACTION.CONDITION]: 'As per the frequency and schedule set by server; At client discretion',
                [BASIC.INTERACTION.ORIGIN]: BASIC.PLAYER.ASSET_OR_TRACKER.CODE,
                [BASIC.INTERACTION.DESTINATION]: BASIC.PLAYER.SERVER.CODE,
                [BASIC.INTERACTION.SUPPORTED_PAYLOAD_VERSIONS]: [1.0, 1.1],
                [BASIC.INTERACTION.DATA]: [
                    {
                        [BASIC.PROPERTY.NAME]: 'ts',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'location capture time'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'lat',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.FLOAT,
                        [BASIC.PROPERTY.DESCRIPTION]: 'location latitude'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'lon',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.FLOAT,
                        [BASIC.PROPERTY.DESCRIPTION]: 'location longitude'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'alt',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.FLOAT,
                        [BASIC.PROPERTY.DESCRIPTION]: 'location altitude'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'ber',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.FLOAT,
                        [BASIC.PROPERTY.DESCRIPTION]: 'location bearing'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'acc',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.FLOAT,
                        [BASIC.PROPERTY.DESCRIPTION]: 'location accuracy'
                    }
                ]
            },
            TELEMERTY_PUBLISH: {
                [BASIC.INTERACTION.CODE]: 'tel',
                [BASIC.INTERACTION.DESCRIPTION]: 'Telemetry data publishing',
                [BASIC.INTERACTION.CONDITION]: 'At client discretion',
                [BASIC.INTERACTION.ORIGIN]: BASIC.PLAYER.ASSET_OR_TRACKER.CODE,
                [BASIC.INTERACTION.DESTINATION]: BASIC.PLAYER.SERVER.CODE,
                [BASIC.INTERACTION.SUPPORTED_PAYLOAD_VERSIONS]: [1.0, 1.1],
                [BASIC.INTERACTION.DATA]: [
                    {
                        [BASIC.PROPERTY.NAME]: 'ts',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'tel capture time'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'st',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'state'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'bMd',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        [BASIC.PROPERTY.DESCRIPTION]: 'bike mode'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'bBCur',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'battery charge level in percentage'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'bBT',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'bike temp in deg centigrade'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'rng',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'remaining range in km'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'sos',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'emergency state'
                    }
                ]
            },
            GEOFENCE_SETTING: {
                [BASIC.INTERACTION.CODE]: 'geoset',
                [BASIC.INTERACTION.DESCRIPTION]: 'Geofence definition, frequency and schedule',
                [BASIC.INTERACTION.CONDITION]: 'At server discretion',
                [BASIC.INTERACTION.ORIGIN]: BASIC.PLAYER.SERVER.CODE,
                [BASIC.INTERACTION.DESTINATION]: BASIC.PLAYER.ASSET_OR_TRACKER.CODE,
                [BASIC.INTERACTION.SUPPORTED_PAYLOAD_VERSIONS]: [1.0, 1.1],
                [BASIC.INTERACTION.DATA]: [
                    {
                        [BASIC.PROPERTY.NAME]: 'geofences',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.LISTOFJSON,
                        [BASIC.PROPERTY.JSON_OBJECT_TYPE]: [
                            {
                                [BASIC.PROPERTY.NAME]: 'gfName',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                                [BASIC.PROPERTY.DESCRIPTION]: 'geofence name'
                            },
                            {
                                [BASIC.PROPERTY.NAME]: 'gfCode',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                                [BASIC.PROPERTY.DESCRIPTION]: 'geofence code'
                            },
                            {
                                [BASIC.PROPERTY.NAME]: 'gfLat',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.FLOAT,
                                [BASIC.PROPERTY.DESCRIPTION]: 'geofence latitude'
                            },
                            {
                                [BASIC.PROPERTY.NAME]: 'gfLon',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.FLOAT,
                                [BASIC.PROPERTY.DESCRIPTION]: 'geofence longitude'
                            },
                            {
                                [BASIC.PROPERTY.NAME]: 'interval',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                                [BASIC.PROPERTY.DESCRIPTION]: 'geofence publish interval'
                            },
                            {
                                [BASIC.PROPERTY.NAME]: 'start',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                                [BASIC.PROPERTY.DESCRIPTION]: 'geofence publish start time'
                            },
                            {
                                [BASIC.PROPERTY.NAME]: 'end',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                                [BASIC.PROPERTY.DESCRIPTION]: 'geofene publish end time'
                            },
                            {
                                [BASIC.PROPERTY.NAME]: 'daysOfWeek',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                                [BASIC.PROPERTY.DESCRIPTION]: 'geofence publish days'
                            }
                        ],
                        [BASIC.PROPERTY.DESCRIPTION]: 'list of geofences'
                    }
                ]
            },
            GEOFENCE_PUBLISH: {
                [BASIC.INTERACTION.CODE]: 'geo',
                [BASIC.INTERACTION.DESCRIPTION]: 'Geofence event publishing',
                [BASIC.INTERACTION.CONDITION]: 'As per the frequency and schedule set by server; At client discretion',
                [BASIC.INTERACTION.ORIGIN]: BASIC.PLAYER.ASSET_OR_TRACKER.CODE,
                [BASIC.INTERACTION.DESTINATION]: BASIC.PLAYER.SERVER.CODE,
                [BASIC.INTERACTION.SUPPORTED_PAYLOAD_VERSIONS]: [1.0, 1.1],
                [BASIC.INTERACTION.DATA]: [
                    {
                        [BASIC.PROPERTY.NAME]: 'geofence events',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.LISTOFJSON,
                        [BASIC.PROPERTY.JSON_OBJECT_TYPE]: [
                            {
                                [BASIC.PROPERTY.NAME]: 'ts',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                                [BASIC.PROPERTY.DESCRIPTION]: 'geofence event time'
                            },
                            {
                                [BASIC.PROPERTY.NAME]: 'cd',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                                [BASIC.PROPERTY.DESCRIPTION]: 'geofence code'
                            },
                            {
                                [BASIC.PROPERTY.NAME]: 'val',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                                [BASIC.PROPERTY.DESCRIPTION]: 'breach event - in or out'
                            }
                        ],
                        [BASIC.PROPERTY.DESCRIPTION]: 'list of geofence events'
                    }
                ]
            },
            PHONEBOOK_SETTING: {
                [BASIC.INTERACTION.CODE]: 'pbkset',
                [BASIC.INTERACTION.DESCRIPTION]: 'Phonebook - Contacts to add',
                [BASIC.INTERACTION.CONDITION]: 'At server discretion',
                [BASIC.INTERACTION.ORIGIN]: BASIC.PLAYER.SERVER.CODE,
                [BASIC.INTERACTION.DESTINATION]: BASIC.PLAYER.ASSET_OR_TRACKER.CODE,
                [BASIC.INTERACTION.SUPPORTED_PAYLOAD_VERSIONS]: [1.0, 1.1],
                [BASIC.INTERACTION.DATA]: [
                    {
                        [BASIC.PROPERTY.NAME]: 'contactsToAdd',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.LISTOFJSON,
                        [BASIC.PROPERTY.JSON_OBJECT_TYPE]: [
                            {
                                [BASIC.PROPERTY.NAME]: 'Name',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                                [BASIC.PROPERTY.DESCRIPTION]: 'contact name'
                            },
                            {
                                [BASIC.PROPERTY.NAME]: 'phoneNumber',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                                [BASIC.PROPERTY.DESCRIPTION]: 'phone number'
                            },
                            {
                                [BASIC.PROPERTY.NAME]: 'phoneNumberType',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                                [BASIC.PROPERTY.DESCRIPTION]: 'phone number type - work or home'
                            }
                        ],
                        [BASIC.PROPERTY.DESCRIPTION]: 'contacts to add'
                    }
                ]
            },
            SPEED_SETTING: {
                [BASIC.INTERACTION.CODE]: 'spdset',
                [BASIC.INTERACTION.DESCRIPTION]: 'Interval and schedule for speed publish',
                [BASIC.INTERACTION.CONDITION]: 'At server discretion',
                [BASIC.INTERACTION.ORIGIN]: BASIC.PLAYER.SERVER.CODE,
                [BASIC.INTERACTION.DESTINATION]: BASIC.PLAYER.ASSET_OR_TRACKER.CODE,
                [BASIC.INTERACTION.SUPPORTED_PAYLOAD_VERSIONS]: [1.0, 1.1],
                [BASIC.INTERACTION.DATA]: [
                    {
                        [BASIC.PROPERTY.NAME]: 'interval',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'speed publish interval'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'start',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'speed publish start time'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'end',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'speed publish end time'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'daysOfWeek',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        [BASIC.PROPERTY.DESCRIPTION]: 'speed publish days'
                    }
                ]
            },
            SPEED_PUBLISH: {
                [BASIC.INTERACTION.CODE]: 'spd',
                [BASIC.INTERACTION.DESCRIPTION]: 'Speed data publishing',
                [BASIC.INTERACTION.CONDITION]: 'As per the frequency and schedule set by server; At client discretion',
                [BASIC.INTERACTION.ORIGIN]: BASIC.PLAYER.ASSET_OR_TRACKER.CODE,
                [BASIC.INTERACTION.DESTINATION]: BASIC.PLAYER.SERVER.CODE,
                [BASIC.INTERACTION.SUPPORTED_PAYLOAD_VERSIONS]: [1.0, 1.1],
                [BASIC.INTERACTION.DATA]: [
                    {
                        [BASIC.PROPERTY.NAME]: 'geofence events',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.LISTOFJSON,
                        [BASIC.PROPERTY.JSON_OBJECT_TYPE]: [
                            {
                                [BASIC.PROPERTY.NAME]: 'ts',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                                [BASIC.PROPERTY.DESCRIPTION]: 'speed event time'
                            },
                            {
                                [BASIC.PROPERTY.NAME]: 'val',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.FLOAT,
                                [BASIC.PROPERTY.DESCRIPTION]: 'speed value'
                            }
                        ],
                        [BASIC.PROPERTY.DESCRIPTION]: 'list of speed events'
                    }
                ]
            },
            DETAIL_SETTING: {
                [BASIC.INTERACTION.CODE]: 'detset',
                [BASIC.INTERACTION.DESCRIPTION]: 'Frequency and schedule of asset or tracker detail publish',
                [BASIC.INTERACTION.CONDITION]: 'At server discretion',
                [BASIC.INTERACTION.ORIGIN]: BASIC.PLAYER.SERVER.CODE,
                [BASIC.INTERACTION.DESTINATION]: BASIC.PLAYER.ASSET_OR_TRACKER.CODE,
                [BASIC.INTERACTION.SUPPORTED_PAYLOAD_VERSIONS]: [1.0, 1.1],
                [BASIC.INTERACTION.DATA]: [
                    {
                        [BASIC.PROPERTY.NAME]: 'interval',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'speed publish interval'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'start',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'speed publish start time'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'end',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'speed publish end time'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'daysOfWeek',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        [BASIC.PROPERTY.DESCRIPTION]: 'speed publish days'
                    }
                ]
            },
            DETAIL_PUBLISH: {
                [BASIC.INTERACTION.CODE]: 'det',
                [BASIC.INTERACTION.DESCRIPTION]: 'asset or tracker detail publishing',
                [BASIC.INTERACTION.CONDITION]: 'As per the interval and schedule set by server; At client discretion',
                [BASIC.INTERACTION.ORIGIN]: BASIC.PLAYER.ASSET_OR_TRACKER.CODE,
                [BASIC.INTERACTION.DESTINATION]: BASIC.PLAYER.SERVER.CODE,
                [BASIC.INTERACTION.SUPPORTED_PAYLOAD_VERSIONS]: [1.0, 1.1],
                [BASIC.INTERACTION.DATA]: [
                    {
                        [BASIC.PROPERTY.NAME]: 'detail ',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.LISTOFJSON,
                        [BASIC.PROPERTY.JSON_OBJECT_TYPE]: [
                            {
                                [BASIC.PROPERTY.NAME]: 'ts',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                                [BASIC.PROPERTY.DESCRIPTION]: 'detail event time'
                            },
                            {
                                [BASIC.PROPERTY.NAME]: 'rssi',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.FLOAT,
                                [BASIC.PROPERTY.DESCRIPTION]: 'signal strength'
                            },
                            {
                                [BASIC.PROPERTY.NAME]: 'cs',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                                [BASIC.PROPERTY.DESCRIPTION]: 'charging or discharging'
                            },
                            {
                                [BASIC.PROPERTY.NAME]: 'bs',
                                [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                                [BASIC.PROPERTY.DESCRIPTION]: 'battery percentage'
                            }
                        ],
                        [BASIC.PROPERTY.DESCRIPTION]: 'list of detail events'
                    }
                ]
            },
            SOS_PUBLISH: {
                [BASIC.INTERACTION.CODE]: 'sos',
                [BASIC.INTERACTION.DESCRIPTION]: 'Sos event publishing',
                [BASIC.INTERACTION.CONDITION]: 'At client discretion',
                [BASIC.INTERACTION.ORIGIN]: BASIC.PLAYER.ASSET_OR_TRACKER.CODE,
                [BASIC.INTERACTION.DESTINATION]: BASIC.PLAYER.SERVER.CODE,
                [BASIC.INTERACTION.SUPPORTED_PAYLOAD_VERSIONS]: [1.0, 1.1],
                [BASIC.INTERACTION.DATA]: [
                    {
                        [BASIC.PROPERTY.NAME]: 'ts',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'sos event time'
                    }
                ]
            },
            TASK_PUBLISH: {
                [BASIC.INTERACTION.CODE]: 'tsk',
                [BASIC.INTERACTION.DESCRIPTION]: 'Task data publishing',
                [BASIC.INTERACTION.CONDITION]: 'At client discretion',
                [BASIC.INTERACTION.ORIGIN]: BASIC.PLAYER.ASSET_OR_TRACKER.CODE,
                [BASIC.INTERACTION.DESTINATION]: BASIC.PLAYER.SERVER.CODE,
                [BASIC.INTERACTION.SUPPORTED_PAYLOAD_VERSIONS]: [1.0, 1.1],
                [BASIC.INTERACTION.DATA]: [
                    {
                        [BASIC.PROPERTY.NAME]: 'ts',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'event time'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'id',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        [BASIC.PROPERTY.DESCRIPTION]: 'the id to be updated'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'st',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        [BASIC.PROPERTY.DESCRIPTION]: 'status to be updated - new->open->inProgress->completed->closed'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'cmt',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        [BASIC.PROPERTY.DESCRIPTION]: 'comment to add'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'pic',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        [BASIC.PROPERTY.DESCRIPTION]: 'path of the pic file to add'
                    }
                ]
            },
            INCIDENT_PUBLISH: {
                [BASIC.INTERACTION.CODE]: 'inc',
                [BASIC.INTERACTION.DESCRIPTION]: 'Incident data publishing',
                [BASIC.INTERACTION.CONDITION]: 'At client discretion',
                [BASIC.INTERACTION.ORIGIN]: BASIC.PLAYER.ASSET_OR_TRACKER.CODE,
                [BASIC.INTERACTION.DESTINATION]: BASIC.PLAYER.SERVER.CODE,
                [BASIC.INTERACTION.SUPPORTED_PAYLOAD_VERSIONS]: [1.0, 1.1],
                [BASIC.INTERACTION.DATA]: [
                    {
                        [BASIC.PROPERTY.NAME]: 'ts',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'event time'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'id',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        [BASIC.PROPERTY.DESCRIPTION]: 'the id to be updated'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'st',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        [BASIC.PROPERTY.DESCRIPTION]: 'status to be updated - new->open->inProgress->completed->closed'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'cmt',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        [BASIC.PROPERTY.DESCRIPTION]: 'comment to add'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'pic',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        [BASIC.PROPERTY.DESCRIPTION]: 'path of the pic file to add'
                    }
                ]
            },
            ATTENDANCE_PUBLISH: {
                [BASIC.INTERACTION.CODE]: 'att',
                [BASIC.INTERACTION.DESCRIPTION]: 'Attendance data publishing',
                [BASIC.INTERACTION.CONDITION]: 'At client discretion',
                [BASIC.INTERACTION.ORIGIN]: BASIC.PLAYER.ASSET_OR_TRACKER.CODE,
                [BASIC.INTERACTION.DESTINATION]: BASIC.PLAYER.SERVER.CODE,
                [BASIC.INTERACTION.SUPPORTED_PAYLOAD_VERSIONS]: [1.0, 1.1],
                [BASIC.INTERACTION.DATA]: [
                    {
                        [BASIC.PROPERTY.NAME]: 'ts',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.INTEGER,
                        [BASIC.PROPERTY.DESCRIPTION]: 'event time'
                    },
                    {
                        [BASIC.PROPERTY.NAME]: 'val',
                        [BASIC.PROPERTY.VALUE_TYPE]: BASIC.SUPPORTED_DATA_TYPE.STRING,
                        [BASIC.PROPERTY.DESCRIPTION]: 'attendance state - in or out'
                    }
                ]
            },
        },
        APP_INTERACTION_SUPPORTED_DATA_TYPES: CommonConstants.COMMON.SUPPORTED_DATA_TYPE,
        APP_JWT: {
            AUDIENCE: {
                ASSET_OR_TRACKER: BASIC.PLAYER.ASSET_OR_TRACKER.CODE,
                ASSET: BASIC.PLAYER.ASSET.CODE,
                TRACKER: BASIC.PLAYER.TRACKER.CODE,
                USERS: BASIC.PLAYER.USER.ROLE.map(role => role.CODE)
            }
        },
        APP_PERSON: {
            GENDER: {
                MALE: 'male',
                FEMALE: 'female',
                OTHER: 'other'
            },
            WEIGHT: {
                MAX: 250,
                MIN: 25
            },
            HEIGHT: {
                MAX: 225,
                MIN: 75
            }
        },
        APP_MODEL: {
            PROPERTIES: {
                MIN_SIZE: 0,
                MAX_SIZE: 8
            },
            SETTINGS: {
                MIN_SIZE: 0,
                MAX_SIZE: 8
            },
            FEATURES: {
                MIN_SIZE: 0,
                MAX_SIZE: 8
            }
        },
        APP_ACTION: APP_ACTION,
        APP_SETTINGS: {
            POST: {
                CODE: 'post',
                NAME: 'Post',
                REVIEW: {
                    CREDIT_COUNT: {
                        PROPERTY: 'review.credit_count',
                        VALUE: '' + 12,
                        VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.INTEGER,
                        DESCRIPTION: 'count of review credits to add to user account'
                    },
                    LIMIT: {
                        WINDOW_DURATION_SEC: {
                            PROPERTY: 'review.limit.window_duration_sec',
                            VALUE: '' + 604800,
                            VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.INTEGER,
                            DESCRIPTION: 'duration for review limit window in seconds'
                        },
                        COUNT: {
                            PROPERTY: 'review.limit.count',
                            VALUE: '' + 2,
                            VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.INTEGER,
                            DESCRIPTION: 'review limit count'
                        }
                    },

                },
            }
        },
        GENERIC: {
            ERROR: 'error in assetmgmt',
            ERROR_ENV_DB_URL_NOT_SET: 'db connection failed. ASSETMGMT_BOOTSTRAP_DB_URL environment variable is not set. Please set it and restart this service to continue',
            ERROR_ENV_JWT_SECRET_NOT_SET: 'ASSETMGMT_JWT_SECRET environment variable is not set. set it and restart this service to continue',
            //CHANGE_PUBLISH_ERROR: 'error in publishing',
            //CHANGE_PUBLISH_KAFKA_ERROR: 'error in publishing. kafka error',
            //CHANGE_PUBLISH_SUCCESS: 'published successfully',
            EXITING: 'exiting assetmgmt abruptly..',
            PORT_REQUIRES_ELEVATED_PRIVILEDGES: ' requires elevated privileges',
            PORT_ALREADY_IN_USE: ' is already in use',
            SRVER_LISSTENING_ON_PORT: 'assetmgmt http server listening on ',
            SERVER_ALREADY_RUNNING_ON_PORT: 'assetmgmt http server is already running on port - ',
            STARTING_SERVICE: 'starting assetmgmt service...',
            STARTING_SERVER: 'starting assetmgmt http server...',
            STARTING_TESTIMONIAL_SERVER: 'starting testimonial http server...',
            TESTIMONIAL_SERVER_LISTENING_ON_PORT: 'testimonial http server listening on ',
            TESTIMONIAL_SERVER_ALREADY_RUNNING_ON_PORT: 'testimonial http server is already running on port - ',
        },
        PROVISION: {
            START: 'starting provisioning...>>>',
            COMPLETE: 'provision completed.....<<<',
            ERROR: 'provision failed',
            PROVISION_SUCCESS: 'provision successful',
            SUPER_ADMIN: {
                SUCCESS: 'superadmin provisioned successfully',
                ALREADY_AVAILABLE: 'superadmin is already provisioned',
                ERROR: 'error while provisioning superadmin',
                ERROR_TOO_MANY: 'more than one superadmins found'
            },
            SINGLETON_ROLE: {
                SUCCESS: 'singleton provisioned successfully',
                ALREADY_AVAILABLE: 'singleton already provisioned',
                ERROR: 'error while provisioning singleton',
                ERROR_TOO_MANY: 'more than one singleton found'
            },
            FEATURE: {
                MISSING: {
                    GET_ALL_ERROR: 'error while fetching all features',
                    NUM_TO_PROVISION: 'number of missing features to provision - ',
                    SUCCESS: 'all missing features provisioned successfully. ',
                    NOTHING_TO_PROVISION: 'no missing features found to provision',
                    CREATE_ERROR: 'error while creating missing features',
                    ERROR: 'error while provisioning missing features'
                },
                ERROR: 'error while provisioning features'
            },
            TRACKER_MODEL: {
                MISSING: {
                    GET_ALL_ERROR: 'error while fetching all tracker models',
                    NUM_TO_PROVISION: 'number of missing tracker models to provision - ',
                    SUCCESS: 'all missing tracker models provisioned successfully. ',
                    NOTHING_TO_PROVISION: 'no missing tracker models found to provision',
                    CREATE_ERROR: 'error while creating missing tracker models',
                    ERROR: 'error while provisioning missing tracker models'
                },
                ERROR: 'error while provisioning tracker models'
            },
            ASSET_MODEL: {
                MISSING: {
                    GET_ALL_ERROR: 'error while fetching all asset models',
                    NUM_TO_PROVISION: 'number of missing asset models to provision - ',
                    SUCCESS: 'all missing asset models provisioned successfully. ',
                    NOTHING_TO_PROVISION: 'no missing asset models found to provision',
                    CREATE_ERROR: 'error while creating missing asset models',
                    ERROR: 'error while provisioning missing asset models'
                },
                ERROR: 'error while provisioning asset models'
            },
            ROLE: {
                MISSING: {
                    GET_ALL_ERROR: 'error while fetching role',
                    NUM_TO_PROVISION: 'number of missing roles to provision - ',
                    SUCCESS: 'all missing roles provisioned successfully',
                    NOTHING_TO_PROVISION: 'no missing roles found to provision',
                    CREATE_ERROR: 'error while creating missing role',
                    ERROR: 'error while provisioning missing role'
                },
                ERROR: 'error while provisioning roles'
            },
        },
        FEATURES: {
            CREATE_ONE: {
                SUCCESS: 'one feature created successfully',
                ERROR: 'error while creating one feature'
            },
            CREATE_MULTIPLE: {
                SUCCESS: 'multiple features created successfully',
                ERROR: 'error while creating multiple features'
            },
            GET_ALL: {
                SUCCESS: 'features retrieved successfully',
                SUCCESS_NO_DATA: 'No features were found',
                ERROR: 'error while retrieving features'
            },
            GET_ALL_COUNT: {
                SUCCESS: 'feature count retrieved successfully',
                ERROR: 'error while retrieving feature count'
            },
            GET_ONE_BY_ID: {
                SUCCESS: 'one feature retrieved successfully by id',
                SUCCESS_NO_DATA: 'no feature found with given id',
                ERROR: 'error while retrieving one feature by id'
            },
            GET_ONE_BY_CODE: {
                SUCCESS: 'one feature retrieved successfully by code',
                SUCCESS_NO_DATA: 'no  feature found with given code',
                ERROR: 'error while retrieving one feature by code  '
            },
            SEARCH: {
                SUCCESS: 'features retrieved successfully',
                SUCCESS_NO_DATA: 'no feature found with the search key',
                ERROR: 'error while searching features',
                ERROR_KEY: 'either invalid or no search keys found'
            },
            UPDATE_ONE_BY_ID: {
                SUCCESS: 'one feature updated successfully by id',
                ERROR: 'error while updating one feature by id',
                ERROR_ID_NOT_FOUND: 'no feature found with this id'
            },
            DELETE_ONE_BY_ID: {
                SUCCESS: 'one feature deleted successfully by id',
                ERROR: 'error while deleting one feature by id',
                ERROR_ID_NOT_FOUND: 'no feature found with this id'
            }
        },
        TRACKER_MODELS: {
            CREATE_ONE: {
                SUCCESS: 'One tracker model created successfully',
                ERROR: 'Error while creating one tracker model'
            },
            CREATE_MULTIPLE: {
                SUCCESS: 'Multiple tracker models created successfully',
                ERROR: 'Error while creating multiple tracker models'
            },
            SEARCH: {
                SUCCESS: 'Tracker models retrieved successfully',
                SUCCESS_NO_DATA: 'No tracker models found with the search key',
                ERROR: 'Error while searching tracker model',
                ERROR_KEY: 'Either invalid or no search keys found'
            },
            GET_ALL: {
                SUCCESS: 'Tracker models retrieved successfully',
                SUCCESS_NO_DATA: 'No tracker models were found',
                ERROR: 'Error while retrieving tracker models'
            },
            GET_ALL_COUNT: {
                SUCCESS: 'trackermodel count retrieved successfully',
                ERROR: 'error while retrieving trackermodel count'
            },
            GET_ONE_BY_ID: {
                SUCCESS: 'One tracker model retrieved successfully by id',
                SUCCESS_NO_DATA: 'No tracker model found with given id',
                ERROR: 'Error while retrieving one tracker model by id'
            },
            GET_ONE_BY_CODE: {
                SUCCESS: 'One tracker model retrieved successfully by code',
                SUCCESS_NO_DATA: 'No tracker model found with given code',
                ERROR: 'Error while retrieving one tracker model by code  '
            },
            UPDATE_ONE_BY_ID: {
                SUCCESS: 'One tracker model updated successfully by id',
                ERROR: 'Error while updating one tracker model by id',
                ERROR_ID_NOT_FOUND: 'No tracker model found with this id'
            },
            DELETE_ONE_BY_ID: {
                SUCCESS: 'One tracker model deleted successfully by id',
                ERROR: 'Error while deleting one tracker model by id',
                ERROR_ID_NOT_FOUND: 'No tracker model found with this id'
            }
        },
        ASSET_MODELS: {
            CREATE_ONE: {
                SUCCESS: 'One asset model created successfully',
                ERROR: 'Error while creating one asset model'
            },
            CREATE_MULTIPLE: {
                SUCCESS: 'Multiple asset models created successfully',
                ERROR: 'Error while creating multiple asset models'
            },
            SEARCH: {
                SUCCESS: 'asset models retrieved successfully',
                SUCCESS_NO_DATA: 'No asset models found with the search key',
                ERROR: 'Error while searching asset model',
                ERROR_KEY: 'Either invalid or no search keys found'
            },
            GET_ALL: {
                SUCCESS: 'asset models retrieved successfully',
                SUCCESS_NO_DATA: 'No asset models were found',
                ERROR: 'Error while retrieving asset models'
            },
            GET_ALL_COUNT: {
                SUCCESS: 'asstemodel count retrieved successfully',
                ERROR: 'error while retrieving assetmodel count'
            },
            GET_ONE_BY_ID: {
                SUCCESS: 'One asset model retrieved successfully by id',
                SUCCESS_NO_DATA: 'No asset model found with given id',
                ERROR: 'Error while retrieving one asset model by id'
            },
            GET_ONE_BY_CODE: {
                SUCCESS: 'One asset model retrieved successfully by code',
                SUCCESS_NO_DATA: 'No asset model found with given code',
                ERROR: 'Error while retrieving one asset model by code  '
            },
            UPDATE_ONE_BY_ID: {
                SUCCESS: 'One asset model updated successfully by id',
                ERROR: 'Error while updating one asset model by id',
                ERROR_ID_NOT_FOUND: 'No asset model found with this id'
            },
            DELETE_ONE_BY_ID: {
                SUCCESS: 'One asset model deleted successfully by id',
                ERROR: 'Error while deleting one asset model by id',
                ERROR_ID_NOT_FOUND: 'No asset model found with this id'
            }
        },
        USER: {
            GENERIC: {
                PREPARE_RESPONSE_DATA: {
                    SUCCESS: {
                        MESSAGE: 'prepared response data successfully',
                        SUBCODE: 0
                    },
                    ERROR: {
                        MESSAGE: 'error in preparing response data',
                        SUBCODE: 101
                    },
                }
            },
            OTP: {
                SUCCESS: {
                    MESSAGE: 'otp generated and sent successfully',
                    SUBCODE: 0
                },
                SUCCESS_SMS: {
                    MESSAGE: 'otp sent successlly over sms',
                    SUBCODE: 1
                },
                SUCCESS_EMAIL: {
                    MESSAGE: 'otp sent successlly over email',
                    SUBCODE: 2
                },
                ERROR_GEN: {
                    MESSAGE: 'error while generating otp',
                    SUBCODE: 201
                },
                ERROR_SEND: {
                    MESSAGE: 'error while sending otp',
                    SUBCODE: 202
                },
                ERROR: {
                    MESSAGE: 'error while generating or sending otp',
                    SUBCODE: 203
                },
                ERROR_TOO_MANY_ATTEMPTS_LOCKED: {
                    MESSAGE: 'too many attempts, account is locked',
                    SUBCODE: 204
                },
                ERROR_USER_NOT_REGISTERING_STATE: {
                    MESSAGE: 'user is not in registering state',
                    SUBCODE: 205
                },
                ERROR_USER_NOT_ACTIVE_STATE: {
                    MESSAGE: 'user is not in active state',
                    SUBCODE: 206
                },
                ERROR_ROLE_NOT_SUPPORTED: {
                    MESSAGE: 'role not supported',
                    SUBCODE: 207
                },
                ERROR_CANNOT_SELF_REGISTER: {
                    MESSAGE: 'self registration is not allowed for this role',
                    SUBCODE: 208
                },
                ERROR_NOT_IN_WHITELIST: {
                    MESSAGE: 'error while generating or sending otp. not in whitelist',
                    SUBCODE: 209
                },
                ERROR_ASSOCIATED_COACH_NOT_FOUND: {
                    MESSAGE: 'error while generating or sending otp. associated coach not found',
                    SUBCODE: 210
                }
            },
            REGISTER: {
                SUCCESS: {
                    MESSAGE: 'user registered successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while registering user',
                    SUBCODE: 201
                },
                ERROR_USER_NOT_REGISTERING_STATE: {
                    MESSAGE: 'user is not in registering state',
                    SUBCODE: 202
                },
                ERROR_USER_ID_NOT_FOUND: {
                    MESSAGE: 'user with provided id is not found',
                    SUBCODE: 203
                },
                ERROR_INCORRECT_OTP: {
                    MESSAGE: 'incorrect otp provided',
                    SUBCODE: 204
                },
                ERROR_INCORRECT_OTP_LOCKED: {
                    MESSAGE: 'incorrect otp provided, account is locked',
                    SUBCODE: 205
                },
                ERROR_EMAIL_USED_AS_ID: {
                    MESSAGE: 'email is in use as id, cannot be updated',
                    SUBCODE: 206
                },
                ERROR_PHONE_USED_AS_ID: {
                    MESSAGE: 'phone is in use as id, cannot be updated',
                    SUBCODE: 207
                },
            },
            LOGIN: {
                SUCCESS: {
                    MESSAGE: 'user logged in successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while logging in user',
                    SUBCODE: 201
                },
                ERROR_USER_ID_NOT_FOUND: {
                    MESSAGE: 'user with provided id is not found',
                    SUBCODE: 202
                },
                ERROR_USER_NOT_COMPLETED_REGISTRATION: {
                    MESSAGE: 'user is not registered',
                    SUBCODE: 203
                },
                ERROR_USER_NOT_ACTIVE: {
                    MESSAGE: 'user is not in active state',
                    SUBCODE: 204
                },
                ERROR_NO_PASSWORD: {
                    MESSAGE: 'user registered with no password',
                    SUBCODE: 205
                },
                ERROR_INCORRECT_PASSWORD: {
                    MESSAGE: 'incorrect password provided',
                    SUBCODE: 206
                },
                ERROR_INCORRECT_PASSWORD_LOCKED: {
                    MESSAGE: 'incorrect password provided. account is locked',
                    SUBCODE: 207
                },
                ERROR_INCORRECT_OTP: {
                    MESSAGE: 'error while logging in user. incorrect otp provided',
                    SUBCODE: 208
                },
                ERROR_INCORRECT_OTP_LOCKED: {
                    MESSAGE: 'error while logging in user. incorrect otp provided. account is locked',
                    SUBCODE: 209
                },
            },
            LOGOUT: {
                SUCCESS: {
                    MESSAGE: 'user logged out successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while logging out user',
                    SUBCODE: 201
                },
            },
            TOKEN_REFRESH: {
                SUCCESS: {
                    MESSAGE: 'user token refreshed successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while refreshing user token',
                    SUBCODE: 201
                },
                ERROR_NOT_LOGGED_IN: {
                    MESSAGE: 'user is not logged in',
                    SUBCODE: 202
                },
            },
            CREATE: {
                SUCCESS: 'user created successfully',
                ERROR: 'error while creating user',
                ERROR_ID_NOT_SPECIFIED: 'neither phone not email is specified as identifier',
                ERROR_ASSOCIATE_NOT_PROVIDED: 'associate not provided'
            },
            CREATE_ONE: {
                SUCCESS: {
                    MESSAGE: 'one user created successfully',
                    SUBCODE: 201
                },
                ERROR: {
                    MESSAGE: 'cannot create, error while creating one user',
                    SUBCODE: 202
                },
                ERROR_ID_NOT_SPECIFIED: {
                    MESSAGE: 'cannot create, neither phone not email is specified as identifier',
                    SUBCODE: 203
                },
                ERROR_CANNOT_CREATE_ROLE: {
                    MESSAGE: 'cannot create, user of the provided role',
                    SUBCODE: 204
                },
                ERROR_ASSOCIATE_NOT_PROVIDED: {
                    MESSAGE: 'cannot create, associate not provided',
                    SUBCODE: 205
                }
            },
            CREATE_SUPER_ADMIN: {
                SUCCESS: 'superadmin user created successfully',
                ERROR: 'error while creating superadmin',
                ERROR_MISSING_EMAIL: 'error while creating superadmin. email is not provided',
                ERROR_MODIFY_SCHEMA: 'error while modifying schema',
                ERROR_RESTORE_SCHEMA: 'error while restoring schema'
            },
            CREATE_SINGLETON_ROLE: {
                SUCCESS: 'singleton user created successfully',
                ERROR: 'error while creating singleton',
                ERROR_MISSING_EMAIL: 'error while creating singleton. email is not provided',
            },
            CREATE_MULTIPLE: {
                SUCCESS: 'multiple users created successfully',
                ERROR: 'error while creating multiple users'
            },
            GET_ALL: {
                SUCCESS: 'users retrieved successfully',
                SUCCESS_NO_DATA: 'no users were found',
                ERROR: 'error while retrieving users'
            },
            GET_ALL_COUNT: {
                SUCCESS: 'users count retrieved successfully',
                ERROR: 'error while retrieving users count'
            },
            GET_ONE_BY_ID: {
                SUCCESS: 'one user retrieved successfully by id',
                SUCCESS_NO_DATA: 'no user found with given id',
                ERROR: 'error while retrieving one user by id'
            },
            GET_ONE_BY_IDENTIFIER: {
                SUCCESS: 'one user retrieved successfully by identifier',
                SUCCESS_NO_DATA: 'no user found with given identifier',
                ERROR: 'error while retrieving one user by identifier'
            },
            GET_ONE: {
                SUCCESS: {
                    MESSAGE: 'one user retrieved successfully',
                    SUBCODE: 0
                },
                SUCCESS_NO_DATA: {
                    MESSAGE: 'no user found with given qualifier',
                    SUBCODE: 1
                },
                ERROR: {
                    MESSAGE: 'error while retrieving one user with given qualifier',
                    SUBCODE: 201
                }
            },
            GET_ONE_BY_ROLE: {
                SUCCESS: {
                    MESSAGE: 'one user retrieved successfully',
                    SUBCODE: 0
                },
                SUCCESS_NO_DATA: {
                    MESSAGE: 'no user found with given role',
                    SUBCODE: 1
                },
                ERROR: {
                    MESSAGE: 'error while retrieving one user with given role',
                    SUBCODE: 201
                }
            },
            SEARCH: {
                SUCCESS: {
                    MESSAGE: 'users retrieved successfully',
                    SUBCODE: 0
                },
                SUCCESS_NO_DATA: {
                    MESSAGE: 'no users found with the search key',
                    SUBCODE: 1
                },
                ERROR: {
                    MESSAGE: 'error while searching users',
                    SUBCODE: 201
                },
                ERROR_INVALID_CONDITION: {
                    MESSAGE: 'Either invalid or no search condition found',
                    SUBCODE: 202
                }
            },
            SEARCH_COUNT: {
                SUCCESS: {
                    MESSAGE: 'user count retrieved successfully',
                    SUBCODE: 0
                },
                SUCCESS_NO_DATA: {
                    MESSAGE: 'no users found with the search key',
                    SUBCODE: 1
                },
                ERROR: {
                    MESSAGE: 'error while getting user count',
                    SUBCODE: 201
                },
                ERROR_INVALID_CONDITION: {
                    MESSAGE: 'Either invalid or no search condition found',
                    SUBCODE: 202
                }
            },
            UPDATE_ONE_BY_ID: {
                SUCCESS: {
                    MESSAGE: 'updated one user by id successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while updating one user by id',
                    SUBCODE: 201
                },
                ERROR_ID_NOT_FOUND: {
                    MESSAGE: 'no user found with thid id',
                    SUBCODE: 202
                },
                ERROR_EMAIL_USED_AS_ID: {
                    MESSAGE: 'email is in use as id, cannot be updated',
                    SUBCODE: 203
                },
                ERROR_PHONE_USED_AS_ID: {
                    MESSAGE: 'phone is in use as id, cannot be updated',
                    SUBCODE: 204
                },
                ERROR_ADDING_ASSOCIATION: {
                    MESSAGE: 'error while adding association',
                    SUBCODE: 205
                },
                ERROR_DELETING_ASSOCIATION: {
                    MESSAGE: 'error while deleting association',
                    SUBCODE: 206
                },
                ERROR_MODIFYING_ASSOCIATION: {
                    MESSAGE: 'error while modifying association',
                    SUBCODE: 207
                }
            },
            DELETE_ONE_BY_ID: {
                SUCCESS: {
                    MESSAGE: 'one user deleted successfully by id',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while deleting one user by id',
                    SUBCODE: 201
                },
                ERROR_ID_NOT_FOUND: {
                    MESSAGE: 'no user found with this id',
                    SUBCODE: 202
                },
                ERROR_ASSOCIATE_NOT_PROVIDED: {
                    MESSAGE: 'associate not provided',
                    SUBCODE: 203
                },
                ERROR_ASSOCIATE_LIST_NOT_EMPTY: {
                    MESSAGE: 'cannot delete, associate list is not empty',
                    SUBCODE: 204
                }
            },
            DELETE_MULTIPLE_BY_ID: {
                SUCCESS: 'multiple users deleted successfully by id',
                ERROR: 'error while deleting multiple users by id',
                ERROR_ID_NOT_FOUND: 'no users found with this id'
            },
            GET_PROFILE_PIC: {
                SUCCESS: {
                    MESSAGE: 'retrieved profile pic of one user',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error in retrieving profile pic of one user',
                    SUBCODE: 201
                },
                ERROR_NO_STREAM: {
                    MESSAGE: 'no stream',
                    SUBCODE: 202
                }
            },
            UPDATE_PROFILE_PIC: {
                SUCCESS: {
                    MESSAGE: 'updated profile pic of one user',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error in updating profile pic of one user',
                    SUBCODE: 201
                },
                ERROR_TOO_LARGE: {
                    MESSAGE: 'profile pic exceeds size limit',
                    SUBCODE: 202
                },
                ERROR_MIME_TYPE_NOT_ALLOWED: {
                    MESSAGE: 'mime type is not allowed',
                    SUBCODE: 203
                }
            },
            BUY_CREDIT: {
                SUCCESS: {
                    MESSAGE: 'bought review credits successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error in buying credits',
                    SUBCODE: 201
                },
                ERROR_HAS_CREDITS: {
                    MESSAGE: 'account has unused review credits',
                    SUBCODE: 202
                }
            }
        },
        USER_TOKEN_BLACKLIST: {
            ADD: {
                SUCCESS: 'user token added to blacklist successfully',
                ERROR: 'error while adding user token to blacklist',
                ERROR_EXPIRED: 'token has already expired, not adding to blacklist',
            },
            CHECK: {
                BLACKLISTED: 'user token is in blacklist',
                NOT_BLACKLISTED: 'user token is not in blacklist',
                ERROR: 'error while checking if user token is in blacklist'
            }
        },
        POST: {
            CODE: 'post',
            NAME: 'Post',
            TYPES: [
                {
                    CODE: 'game-review',
                    SUBTYPES: [
                        {
                            CODE: 'game',
                            MIN_NUM_FILES: {
                                PROPERTY: 'type.game.min_files',
                                VALUE: '' + 1,
                                VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.INTEGER,
                                DESCRIPTION: 'minimum number of files allowed per game post'
                            },
                            MAX_NUM_FILES: {
                                PROPERTY: 'type.game.max_files',
                                VALUE: '' + 1,
                                VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.INTEGER,
                                DESCRIPTION: 'maximum number of files allowed per game post'
                            },
                            MAX_ALLOWED_SIZE: {
                                PROPERTY: 'type.game.max_size',
                                VALUE: '' + 3 * 1024 * 1024 * 1024,
                                VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.INTEGER,
                                DESCRIPTION: 'maximum allowed size for game post'
                            },
                            ALLOWED_MIME_TYPES: {
                                PROPERTY: 'type.game.allowed_mime_types',
                                VALUE: 'video/*,',
                                VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.STRING,
                                DESCRIPTION: 'mime types allowed size for game post'
                            }
                        },
                        {
                            CODE: 'review',
                            MIN_NUM_FILES: {
                                PROPERTY: 'type.review.min_files',
                                VALUE: '' + 1,
                                VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.INTEGER,
                                DESCRIPTION: 'minimum number of files allowed per review post'
                            },
                            MAX_NUM_FILES: {
                                PROPERTY: 'type.review.max_files',
                                VALUE: '' + 32,
                                VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.INTEGER,
                                DESCRIPTION: 'maximum number of files allowed per review post'
                            },
                            MAX_ALLOWED_SIZE: {
                                PROPERTY: 'type.review.max_size',
                                VALUE: '' + 250 * 1024 * 1024,
                                VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.INTEGER,
                                DESCRIPTION: 'maximum allowed size for review post'
                            },
                            ALLOWED_MIME_TYPES: {
                                PROPERTY: 'type.review.allowed_mime_types',
                                VALUE: 'application/zip,',
                                VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.STRING,
                                DESCRIPTION: 'mime types allowed for review post'
                            }
                        },
                    ]
                }
            ],
            STATES: {
                SESSION_NOTIFIED: 'session_notified',
                CREATED: 'created',
                REVIEW_REQUESTED: 'review_requested',
                REVIEWED: 'reviewed'
            },
            GENERIC: {
                PREPARE_RESPONSE_DATA: {
                    SUCCESS: {
                        MESSAGE: 'prepared response data successfully',
                        SUBCODE: 0
                    },
                    ERROR: {
                        MESSAGE: 'error in preparing response data',
                        SUBCODE: 101
                    },
                }
            },
            CREATE_ONE: {
                SUCCESS: {
                    MESSAGE: 'one post created successfully',
                    SUBCODE: 0
                },
                SUCCESS_UPDATED_REVIEW_CREDITS: {
                    MESSAGE: 'one post created successfully, updated review credits',
                    SUBCODE: 1
                },
                ERROR: {
                    MESSAGE: 'error while creating one post',
                    SUBCODE: 201
                },
                ERROR_NOT_AUTHORIZED: {
                    MESSAGE: 'not authorized to create this post',
                    SUBCODE: 202
                },
                ERROR_TOO_LARGE: {
                    MESSAGE: 'post exceeds size limit',
                    SUBCODE: 203
                },
                ERROR_MIME_TYPE_NOT_ALLOWED: {
                    MESSAGE: 'mime type is not allowed',
                    SUBCODE: 204
                },
                ERROR_UNSUPPORTED_ZIP: {
                    MESSAGE: 'unsupported zip file',
                    SUBCODE: 205
                },
                ERROR_MEMBERSHIP_NOT_FOUND: {
                    MESSAGE: 'membership not found',
                    SUBCODE: 206
                },
                ERROR_MEMBERSHIP_NO_REVIEW_CREDITS: {
                    MESSAGE: 'no review credits',
                    SUBCODE: 207
                },
                ERROR_UPDATING_REVIEW_CREDITS: {
                    MESSAGE: 'unable to update review credits, aborting',
                    SUBCODE: 208
                },
                ERROR_EXHAUSTED_REVIEWS_FOR_PERIOD: {
                    MESSAGE: 'exhausted reviews for this period',
                    SUBCODE: 209
                }
            },
            START_ONE_POST_SESSION: {
                SUCCESS: {
                    MESSAGE: 'one post session started successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while starting one post session',
                    SUBCODE: 201
                },
                ERROR_NOT_AUTHORIZED: {
                    MESSAGE: 'error while starting one post session. not authorized to start post session',
                    SUBCODE: 202
                },
                ERROR_ACADEMY_OR_COURT_NOT_FOUND: {
                    MESSAGE: 'error while starting one post session. academy or court not found',
                    SUBCODE: 203
                },
            },
            ADD_GAME_VIDEO_TO_POST_SESSION: {
                SUCCESS: {
                    MESSAGE: 'added game video to post session successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while adding game video to post session',
                    SUBCODE: 201
                },
                ERROR_NOT_AUTHORIZED: {
                    MESSAGE: 'error while adding game video to post session. not authorized to add video to post session',
                    SUBCODE: 202
                },
                ERROR_TOO_LARGE: {
                    MESSAGE: 'error while adding game video to post session. post exceeds size limit',
                    SUBCODE: 203
                },
                ERROR_MIME_TYPE_NOT_ALLOWED: {
                    MESSAGE: 'error while adding game video to post session. mime type is not allowed',
                    SUBCODE: 204
                }
            },
            END_ONE_POST_SESSION: {
                SUCCESS: {
                    MESSAGE: 'one post session ended successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while ending one post session',
                    SUBCODE: 201
                },
                ERROR_NOT_AUTHORIZED: {
                    MESSAGE: 'error while ending one post session. not authorized to end post session',
                    SUBCODE: 202
                },
                ERROR_NO_EXISTING_SESSION: {
                    MESSAGE: 'error while ending one post session. no existing session to end',
                    SUBCODE: 203
                }
            },
            UPDATE_ONE: {
                SUCCESS: {
                    MESSAGE: 'one post updated successfully',
                    SUBCODE: 0
                },
                SUCCESS_UPDATED_REVIEW_CREDITS: {
                    MESSAGE: 'one post updated successfully, updated review credits',
                    SUBCODE: 1
                },
                ERROR: {
                    MESSAGE: 'error while updating one post',
                    SUBCODE: 201
                },
                ERROR_NOT_AUTHORIZED: {
                    MESSAGE: 'not authorized to update this post',
                    SUBCODE: 202
                },
                ERROR_TOO_LARGE: {
                    MESSAGE: 'post exceeds size limit',
                    SUBCODE: 203
                },
                ERROR_MIME_TYPE_NOT_ALLOWED: {
                    MESSAGE: 'mime type is not allowed',
                    SUBCODE: 204
                },
                ERROR_UNSUPPORTED_ZIP: {
                    MESSAGE: 'unsupported zip file',
                    SUBCODE: 205
                },
                ERROR_MEMBERSHIP_NOT_FOUND: {
                    MESSAGE: 'membership not found',
                    SUBCODE: 206
                },
                ERROR_MEMBERSHIP_NO_REVIEW_CREDITS: {
                    MESSAGE: 'no review credits',
                    SUBCODE: 207
                },
                ERROR_UPDATING_REVIEW_CREDITS: {
                    MESSAGE: 'unable to update review credits, aborting',
                    SUBCODE: 208
                },
                ERROR_EXHAUSTED_REVIEWS_FOR_PERIOD: {
                    MESSAGE: 'exhausted reviews for this period',
                    SUBCODE: 209
                }
            },
            GET_ALL_FOR_USER: {
                SUCCESS: 'users posts retrieved successfully',
                SUCCESS_NO_DATA: 'no posts were found',
                ERROR: 'error while retrieving users posts'
            },
            GET_ALL_COUNT: {
                SUCCESS: 'post count retrieved successfully',
                ERROR: 'error while retrieving post count'
            },
            GET_ONE_BY_ID: {
                SUCCESS: {
                    MESSAGE: 'one post retrieved successfully by id',
                    SUBCODE: 0
                },
                SUCCESS_NO_DATA: {
                    MESSAGE: 'no post found with given id',
                    SUBCODE: 1
                },
                ERROR: {
                    MESSAGE: 'error while retrieving one post by id',
                    SUBCODE: 201
                },
                ERROR_POST_TYPE_UNKNOWN: {
                    MESSAGE: 'error while retrieving one post by id. provided post type is unknown',
                    SUBCODE: 202
                },
                ERROR_REVIEW_NOT_AVAILABLE: {
                    MESSAGE: 'error while retrieving one post by id. review is not available',
                    SUBCODE: 203
                },
                ERROR_GAME_NOT_AVAILABLE: {
                    MESSAGE: 'error while retrieving one post by id. game is not available',
                    SUBCODE: 204
                },
                ERROR_STREAM_NOT_AVAILABLE: {
                    MESSAGE: 'error while retrieving one post by id. stream is not available',
                    SUBCODE: 205
                }
            },
            SEARCH: {
                SUCCESS: 'posts retrieved successfully',
                SUCCESS_NO_DATA: 'no posts found with the search key',
                ERROR: 'error while searching posts',
                ERROR_INVALID_CONDITION: 'Either invalid or no search condition found'
            },
            SEARCH_COUNT: {
                SUCCESS: 'posts count retrieved successfully',
                SUCCESS_NO_DATA: 'no posts found with the search key',
                ERROR: 'error while searching post count',
                ERROR_INVALID_CONDITION: 'Either invalid or no search condition found'
            },
            USAGE_REPORT: {
                SUCCESS: {
                    MESSAGE: 'usage report retrieved successfully',
                    SUBCODE: 0
                },
                SUCCESS_NO_DATA: {
                    MESSAGE: 'usage report retrieved successfully. no data found',
                    SUBCODE: 1
                },
                ERROR: {
                    MESSAGE: 'error while fetching usage report',
                    SUBCODE: 201
                },
                ERROR_INVALID_CONDITION: {
                    MESSAGE: 'Either invalid or no search condition found',
                    SUBCODE: 202
                }
            },
            USAGE_COUNT: {
                SUCCESS: {
                    MESSAGE: 'usage count retrieved successfully',
                    SUBCODE: 0
                },
                SUCCESS_NO_DATA: {
                    MESSAGE: 'usage count retrieved successfully. no data found',
                    SUBCODE: 1
                },
                ERROR: {
                    MESSAGE: 'error while fetching usage count',
                    SUBCODE: 201
                },
                ERROR_INVALID_CONDITION: {
                    MESSAGE: 'Either invalid or no search condition found',
                    SUBCODE: 202
                }
            },
            UPDATE_ONE_BY_ID: {
                SUCCESS: 'one post updated successfully by id',
                ERROR: 'error while updating one post by id',
                ERROR_ID_NOT_FOUND: 'no post found with this id'
            },
            DELETE_ONE_BY_ID: {
                SUCCESS: {
                    MESSAGE: 'one post deleted successfully by id',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while deleting one post by id',
                    SUBCODE: 201
                },
                ERROR_ID_NOT_FOUND: {
                    MESSAGE: 'no post found with this id',
                    SUBCODE: 202
                },
                ERROR_NOT_AUTHORIZED: {
                    MESSAGE: 'not authorized to delete this post',
                    SUBCODE: 203
                },
                ERROR_CANNOT_DELETE_FILES: {
                    MESSAGE: 'unable to delete files',
                    SUBCODE: 204
                }
            }
        },
        WHITELIST: {
            CREATE_ONE: {
                SUCCESS: {
                    MESSAGE: 'one whitelist user created successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while creating one whitelist user',
                    SUBCODE: 201
                }
            },
            CREATE_MULTIPLE: {
                SUCCESS: {
                    MESSAGE: 'whitelist users created successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while creating whitelist users',
                    SUBCODE: 201
                },
                ERROR_WRONG_CSV_FORMAT: {
                    MESSAGE: 'error while creating whitelist users. wrong csv format',
                    SUBCODE: 202
                },
                ERROR_TOO_MANY: {
                    MESSAGE: 'error while creating whitelist users. too many whitelist users',
                    SUBCODE: 203
                },
                ERROR_NONE: {
                    MESSAGE: 'error while creating whitelist users. no whitelist users',
                    SUBCODE: 204
                }
            },
            GET_ONE: {
                SUCCESS: {
                    MESSAGE: 'one whitelist user retrieved successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while retrieving whitelist user',
                    SUBCODE: 201
                }
            },
            UPDATE_ONE: {
                SUCCESS: {
                    MESSAGE: 'one whitelist user updated successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while updating whitelist user',
                    SUBCODE: 201
                }
            },
            DELETE_ONE: {
                SUCCESS: {
                    MESSAGE: 'one whitelist user deleted successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while deleting whitelist user',
                    SUBCODE: 201
                }
            },
            DELETE_MULTIPLE: {
                SUCCESS: {
                    MESSAGE: 'whitelist users deleted successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while deleting whitelist users',
                    SUBCODE: 201
                }
            },
        },
        TESTIMONIAL: {
            CREATE_ONE: {
                SUCCESS: {
                    MESSAGE: 'one testimonial created successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while creating one testimonial',
                    SUBCODE: 201
                },
                ERROR_NOT_AUTHORIZED: {
                    MESSAGE: 'not authorized to create this testimonial',
                    SUBCODE: 202
                }
            },
            GET_ONE_BY_ID: {
                SUCCESS: {
                    MESSAGE: 'one testimonial retrieved successfully by id',
                    SUBCODE: 0
                },
                SUCCESS_NO_DATA: {
                    MESSAGE: 'no testimonial found with given id',
                    SUBCODE: 1
                },
                ERROR: {
                    MESSAGE: 'error while retrieving one testimonial by id',
                    SUBCODE: 201
                }
            },
            SEARCH: {
                SUCCESS: {
                    MESSAGE: 'testimonials retrieved successfully',
                    SUBCODE: 0
                },
                SUCCESS_NO_DATA: {
                    MESSAGE: 'no testimonials found with the search key',
                    SUBCODE: 1
                },
                ERROR: {
                    MESSAGE: 'error while searching testimonials',
                    SUBCODE: 201
                },
                ERROR_INVALID_CONDITION: {
                    MESSAGE: 'Either invalid or no search condition found',
                    SUBCODE: 202
                }
            },
            SEARCH_COUNT: {
                SUCCESS: {
                    MESSAGE: 'testimonial count retrieved successfully',
                    SUBCODE: 0
                },
                SUCCESS_NO_DATA: {
                    MESSAGE: 'no testimonials found with the search key',
                    SUBCODE: 1
                },
                ERROR: {
                    MESSAGE: 'error while getting testimonial count',
                    SUBCODE: 201
                },
                ERROR_INVALID_CONDITION: {
                    MESSAGE: 'Either invalid or no search condition found',
                    SUBCODE: 202
                }
            }
        },
        TAG: {
            CREATE_ONE: {
                SUCCESS: {
                    MESSAGE: 'one tag created successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while creating one tag',
                    SUBCODE: 201
                },
                ERROR_NOT_AUTHORIZED: {
                    MESSAGE: 'not authorized to create this tag',
                    SUBCODE: 202
                }
            }
        },
        COURT: {
            CREATE_ONE: {
                SUCCESS: {
                    MESSAGE: 'one academy created successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while creating one academy',
                    SUBCODE: 201
                }
            },
            CREATE_MULTIPLE: {
                SUCCESS: {
                    MESSAGE: 'multiple academies created successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while creating multiple academies',
                    SUBCODE: 201
                },
                ERROR_NONE: {
                    MESSAGE: 'error while creating multiple academies. no academies',
                    SUBCODE: 202
                },
                ERROR_TOO_MANY: {
                    MESSAGE: 'error while creating multiple academies. too many academies',
                    SUBCODE: 203
                }
            },
            GET_ONE: {
                SUCCESS: {
                    MESSAGE: 'one academy retrieved successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while retrieving one academy',
                    SUBCODE: 201
                }
            },
            UPDATE_ONE: {
                SUCCESS: {
                    MESSAGE: 'one academy updated successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while updating one academy',
                    SUBCODE: 201
                }
            },
            DELETE_ONE: {
                SUCCESS: {
                    MESSAGE: 'one academy deleted successfully',
                    SUBCODE: 0
                },
                ERROR: {
                    MESSAGE: 'error while deleting one academy',
                    SUBCODE: 201
                },
                ERROR_ID_NOT_FOUND: {
                    MESSAGE: 'error while deleting one academy. no academy found with this id',
                    SUBCODE: 202
                }
            }
        }
    }
};