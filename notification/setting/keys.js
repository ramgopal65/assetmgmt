module.exports = {
    NOTIFICATION: {
        DATABASE: {
            CONNECT: {
                URL_READ_ONLY: 'notification.database.connect.url.read_only',
                URL_READ_WRITE: 'notification.database.connect.url.read_write'
            }
        },
        AWS: {
            SNS: {
                API_VERSION: 'notification.aws.sns.api_version',
                SECRET_KEY: 'notification.aws.sns.secret_key',
                KEY_ID: 'notification.aws.sns.key_id',
                REGION: 'notification.aws.sns.region',
                TOPIC: 'notification.aws.sns.topic'
            }
        },
        EMAIL: {
            SMTP: {
                USERNAME: 'notification.email.smtp.username',
                PASSWORD: 'notification.email.smtp.password',
                HOST: 'notification.email.smtp.host',
                PORT: 'notification.email.smtp.port',
                SECURE: 'notification.email.smtp.secure'
            }
        },
        SEND: {
            SMS: {
                SMS_BODY: 'notification.send.sms.sms_body'
            },
            SMS_LOCAL: {
                SMS_BODY_LOCAL: 'notification.send.sms_local.sms_body_local',
                URL: 'notification.send.sms_local.url',
                AUTH_KEY: 'notification.send.sms_local.auth_key',
                ROUTE: 'notification.send.sms_local.route',
                SENDER_ID: 'notification.send.sms_local.sender_id',
                TEMPLATE_ID_FOR_REGISTRATION: 'notification.send.sms_local.template_id_for_registration',
                TEMPLATE_ID_FOR_LOGIN: 'notification.send.sms_local.template_id_for_login'
            },
            EMAIL: {
                FROM: 'notification.send.email.from',
                SUBJECT: 'notification.send.email.subject',
                EMAIL_BODY: 'notification.send.email.email_body',
                SIGNATURE: 'notification.send.email.signature'
            }
        }
    }
};