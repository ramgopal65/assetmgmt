module.exports = {
    sendSMS: sendSMS,
    sendLocalSMS: sendLocalSMS,
    sendEMail: sendEMail,
}

//Imports
const NotificationHelper = require('../helpers/notification');
const RejectData = require('../../../common/response/reject-data');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const To = require('../../../common/to/to');
const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');
const SettingsKey = require('../../setting/keys');

const Mustache = require('mustache');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */

async function sendSMS(req, res, next) {
    try {
        let error, result;
        let rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.NOTIFICATION.SEND_SMS.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null
        );

        const msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;

        // Helper function to handle validation errors
        const handleValidationError = (field) => {
            console.log(field);
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage(field);
            req.trace.response = rejectObject.jsonObject();
            next();
        };

        // Validating the information
        if (!req.body.phone?.cc) return handleValidationError('req.body.phone.cc');
        if (!req.body.phone?.number) return handleValidationError('req.body.phone.number');
        if (!req.body.type) return handleValidationError('req.body.type');
        if (!req.body.otp) return handleValidationError('req.body.otp');

        // Creating a uniform phone number including country code
        let phoneNumber = req.body.phone.cc.startsWith('+')
            ? req.body.phone.cc.slice(1) + req.body.phone.number
            : req.body.phone.cc + req.body.phone.number;

        let messageBodyTemplate = SettingsMap.get(SettingsKey.NOTIFICATION.SEND.SMS.SMS_BODY);
        let templateData = {
            type: req.body.type,
            otp: req.body.otp
        };
        let messageBody = Mustache.render(messageBodyTemplate, templateData);

        // Sending the SMS
        [error, result] = await To(NotificationHelper.sendSMS(phoneNumber, messageBody));
        req.trace.response = error || result;
        next();
    } catch (error) {
        let rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.NOTIFICATION.SEND_SMS.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error
        );
        req.trace.response = rejectObject.jsonObject();
        next();
    }
};


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function sendEMail(req, res, next) {
    try {
        // Initializing reject object with default error structure
        let rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.NOTIFICATION.SEND_EMAIL.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null
        );

        // Common error message for missing or invalid fields
        const msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;

        // Helper function to append message to reject object and set the response
        const handleValidationError = (field) => {
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage(field);
            req.trace.response = rejectObject.jsonObject();
            next();
        };

        // Validate required fields
        if (!req.body.email) return handleValidationError('req.body.email');
        if (!req.body.type) return handleValidationError('req.body.type');
        if (!req.body.otp) return handleValidationError('req.body.otp');

        // Prepare the email message body using Mustache for templating
        const messageBodyTemplate = SettingsMap.get(SettingsKey.NOTIFICATION.SEND.EMAIL.EMAIL_BODY) + '\n' + SettingsMap.get(SettingsKey.NOTIFICATION.SEND.EMAIL.SIGNATURE);
        const templateData = {
            email: req.body.email,
            type: req.body.type,
            otp: req.body.otp
        };
        const messageBody = Mustache.render(messageBodyTemplate, templateData);

        // Sending the email
        let error, result;
        [error, result] = await To(NotificationHelper.sendEMail(templateData.email, messageBody));
        req.trace.response = error || result;
        next();
    } catch (error) {
        // Handling unexpected errors
        const rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.NOTIFICATION.SEND_EMAIL.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error
        );
        req.trace.response = rejectObject.jsonObject();
        next();
    }
};


async function sendLocalSMS(req, res, next) {
    try {
        let error, result, templateId;
        let rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
            Constants.NOTIFICATION.SEND_SMS.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
            null
        );

        const msg = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;

        // Helper function to handle validation errors
        const handleValidationError = (field) => {
            console.log(field);
            rejectObject.appendMessage(msg);
            rejectObject.appendMessage(field);
            req.trace.response = rejectObject.jsonObject();
            next();
        };

        // Validating the information
        if (!req.body.phone?.cc) return handleValidationError('req.body.phone.cc');
        if (!req.body.phone?.number) return handleValidationError('req.body.phone.number');
        if (!req.body.type) return handleValidationError('req.body.type');
        if (!req.body.otp) return handleValidationError('req.body.otp');

        if (req.body.type === 'registration') {
            templateId = SettingsMap.get(SettingsKey.NOTIFICATION.SEND.SMS_LOCAL.TEMPLATE_ID_FOR_REGISTRATION);
        } else {
            templateId = SettingsMap.get(SettingsKey.NOTIFICATION.SEND.SMS_LOCAL.TEMPLATE_ID_FOR_LOGIN);
        }
        // Creating a uniform phone number including country code
        let phoneNumber = req.body.phone.cc.startsWith('+')
            ? req.body.phone.cc.slice(3) + req.body.phone.number
            : req.body.phone.cc + req.body.phone.number;

        let messageBodyTemplate = SettingsMap.get(SettingsKey.NOTIFICATION.SEND.SMS_LOCAL.SMS_BODY_LOCAL);

        let templateData = {
            type: req.body.type,
            otp: req.body.otp
        };
        let messageBody = Mustache.render(messageBodyTemplate, templateData);

        // Sending the SMS
        [error, result] = await To(NotificationHelper.sendLocalSMS(phoneNumber, messageBody, templateId));
        req.trace.response = error || result;
        next();
    } catch (error) {
        let rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.NOTIFICATION.SEND_SMS.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            error
        );
        req.trace.response = rejectObject.jsonObject();
        next();
    }
};