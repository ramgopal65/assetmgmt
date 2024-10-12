const CommonConstants = require('../../common/constant/constant');

module.exports = {
    NOTIFICATION: {
        APP_ACTION: {
            RESOURCE: {
                NOTIFICATION: 'notification'
            },
            ACTION: {
                NOTIFICATION: {
                    SEND_SMS: 'send_sms',
                    SEND_SMS_LOCAL: 'send_sms_local',
                    SEND_EMAIL: 'send_email'
                }
            }
        },
        GENERIC: {
            STARTING_SERVER: 'starting notification http server',
            ERROR: 'error in notification.',
            EXITING: 'exiting notification abruptly...',
            PROVISION_ERROR: 'provision failed.',
            PROVISION_SUCCESS: 'provision successful.',
            PORT_REQUIRES_ELEVATED_PRIVILEDGES: ' requires elevated privileges',
            PORT_ALREADY_IN_USE: ' is already in use',
            SERVER_LISSTENING_ON_PORT: 'notification http server listening on ',
            SERVER_ALREADY_RUNNING_ON_PORT: 'notification http server is already running on port - ',
        },
        SEND_SMS: {
            SUCCESS: 'one sms sent successfully.',
            ERROR: 'error while sending one sms'
        },
        SEND_EMAIL: {
            SUCCESS: 'one email sent successfully.',
            ERROR: 'error while sending one email'
        },
        SEND: {
            CODE: 'send',
            NAME: 'Send',
            SMS: {
                SMS_BODY: {
                    PROPERTY: 'sms.sms_body',
                    VALUE: 'Hi!\nPlease use this OTP {{otp}} for {{type}}.\nThanks,\nVISIST.AI Team',
                    VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'sms body to be sent for otp'
                }
            },
            SMS_LOCAL: {
                SMS_BODY_LOCAL: {
                    PROPERTY: 'sms_local.sms_body_local',
                    VALUE: 'Hi!\nPlease use this OTP {{otp}} for {{type}}.\nThanks,\nBORQS Team',
                    VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'sms body to be sent for otp'
                },
                URL: {
                    PROPERTY: 'sms_local.url',
                    VALUE: 'http://sms.tddigitalsolution.com/http-tokenkeyapi.php?authentic-key={{authKey}}&senderid={{senderId}}&route={{route}}&number={{phone}}&message={{message}}&templateid={{templateId}}',
                    VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'local sms gateway GET-API url'
                },
                AUTH_KEY: {
                    PROPERTY: 'sms_local.auth_key',
                    VALUE: '3734424f5251533138353332381716884669',
                    VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'auth key for sending the sms using sms gateway'
                },
                ROUTE: {
                    PROPERTY: 'sms_local.route',
                    VALUE: '1',
                    VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'route for sending the sms using sms gateway'
                },
                SENDER_ID: {
                    PROPERTY: 'sms_local.sender_id',
                    VALUE: 'BORQST',
                    VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'sender id approved from the DLT for sending the sms'
                },
                TEMPLATE_ID_FOR_REGISTRATION: {
                    PROPERTY: 'sms_local.template_id_for_registration',
                    VALUE: '1707171689285512264',
                    VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'template id approved from the DLT to send registration sms'
                },
                TEMPLATE_ID_FOR_LOGIN: {
                    PROPERTY: 'sms_local.template_id_for_login',
                    VALUE: '1707171689249264232',
                    VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'template id approved from the DLT to send login sms'
                }
            },
            EMAIL: {
                FROM: {
                    PROPERTY: 'email.from',
                    VALUE: '"Visist AI" <assetmgmt.borqsio@borqs.com>',
                    VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'email address to send emails from'
                },
                SUBJECT: {
                    PROPERTY: 'email.subject',
                    VALUE: 'One Time Password (OTP)',
                    VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'email subject to be entered'
                },
                EMAIL_BODY: {
                    PROPERTY: 'email.email_body',
                    VALUE: 'Hi!\nPlease use this OTP {{otp}} for {{type}}.\nThanks,',
                    VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'email body to be used to send email'
                },
                SIGNATURE: {
                    PROPERTY: 'email.signature',
                    VALUE: 'VISIST.AI Team',
                    VALUE_TYPE: CommonConstants.COMMON.SUPPORTED_DATA_TYPE.STRING,
                    DESCRIPTION: 'signature for the email'
                },
            }
        }
    }
};