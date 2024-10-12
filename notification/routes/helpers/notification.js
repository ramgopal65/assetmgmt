module.exports = {
    sendSMS: sendSMS,
    sendLocalSMS: sendLocalSMS,
    sendEMail: sendEMail
}

//Imports
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const Config = require('../../config/config');
const SettingsKey = require('../../setting/keys');
const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');

const RejectData = require('../../../common/response/reject-data');
const ResolveData = require('../../../common/response/resolve-data');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const To = require('../../../common/to/to');

const axios = require('axios');
const Mustache = require('mustache');

//AWS SNS CONFIGURATION
AWS.config.update({
    accessKeyId: SettingsMap.get(SettingsKey.NOTIFICATION.AWS.SNS.KEY_ID),
    secretAccessKey: SettingsMap.get(SettingsKey.NOTIFICATION.AWS.SNS.SECRET_KEY),
    region: SettingsMap.get(SettingsKey.NOTIFICATION.AWS.SNS.REGION)
});

//Email configuration begins
const transporter = nodemailer.createTransport({
    host: SettingsMap.get(SettingsKey.NOTIFICATION.EMAIL.SMTP.HOST),
    port: SettingsMap.get(SettingsKey.NOTIFICATION.EMAIL.SMTP.PORT),
    secure: SettingsMap.get(SettingsKey.NOTIFICATION.EMAIL.SMTP.SECURE),
    auth: {
        user: SettingsMap.get(SettingsKey.NOTIFICATION.EMAIL.SMTP.USERNAME),
        pass: SettingsMap.get(SettingsKey.NOTIFICATION.EMAIL.SMTP.PASSWORD),
    },
});

/**
 * 
 * @param {*} phone 
 * @param {*} message 
 */

async function sendSMS(phone, message) {

    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.NOTIFICATION.SEND_SMS.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.NOTIFICATION.SEND_SMS.SUCCESS,
        null
    );

    let publishSMSNotification = new AWS.SNS({ apiVersion: Config.NOTIFICATION.AWS.API_VERSION, region: AWS.config.region });

    try {
        let error, result;

        let params = {
            Message: message,
            PhoneNumber: '+' + phone
        };

        [error, result] = await To(publishSMSNotification.publish(params).promise());
        if(error){
            rejectObject.setDetails(error);
            rejectObject.appendMessage(error.message);
            return Promise.reject(rejectObject.jsonObject());
        }
        resolveObject.appendMessage(result.MessageId);
        resolveObject.setData(result.MessageId);
        return Promise.resolve(resolveObject.jsonObject());
    } catch (error) {
        rejectObject.setDetails(error);
        rejectObject.appendMessage(error.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
 * 
 * @param {*} email 
 * @param {*} message 
 * @returns 
 */
async function sendEMail(email, message) {
    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.NOTIFICATION.SEND_EMAIL.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.NOTIFICATION.SEND_EMAIL.SUCCESS,
        null
    );
    let error, result, data;
    try {
        data = {
            from: SettingsMap.get(SettingsKey.NOTIFICATION.SEND.EMAIL.FROM), // sender address
            to: `${email}`, // list of receivers
            subject: SettingsMap.get(SettingsKey.NOTIFICATION.SEND.EMAIL.SUBJECT), // Subject line
            text: `${message}`, // plain text body
        };

        // const sendEmail = await transporter.sendMail();
        [error, result] = await To(transporter.sendMail(data));
        if(error){
            rejectObject.setDetails(error);
            rejectObject.appendMessage(error.message);
            return Promise.reject(rejectObject.jsonObject());
        }
        resolveObject.appendMessage(result.messageId);
        resolveObject.setData(result.messageId)
        return Promise.resolve(resolveObject.jsonObject());
    } catch (error) {
        rejectObject.setDetails(error);
        rejectObject.appendMessage(error.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

async function sendLocalSMS(phone, message, templateId) {

    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.NOTIFICATION.SEND_SMS.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.NOTIFICATION.SEND_SMS.SUCCESS,
        null
    );

    try {
        let error, result;

        let smsGatewayUrlTemplate = SettingsMap.get(SettingsKey.NOTIFICATION.SEND.SMS_LOCAL.URL);

        let params = {
            authKey: SettingsMap.get(SettingsKey.NOTIFICATION.SEND.SMS_LOCAL.AUTH_KEY), 
            senderId: SettingsMap.get(SettingsKey.NOTIFICATION.SEND.SMS_LOCAL.SENDER_ID),
            route: SettingsMap.get(SettingsKey.NOTIFICATION.SEND.SMS_LOCAL.ROUTE),
            templateId: templateId,
            phone: phone,
            message: message
        };

        let smsGatewayUrl = Mustache.render(smsGatewayUrlTemplate, params);

        [error, result] = await To(axios.get(smsGatewayUrl));
        if (error) {
            rejectObject.setDetails(error);
            rejectObject.appendMessage(error.message);
            return Promise.reject(rejectObject.jsonObject());
        }
        resolveObject.appendMessage(result.data);
        resolveObject.setData(result.data);
        return Promise.resolve(resolveObject.jsonObject());
    } catch (error) {
        rejectObject.setDetails(error);
        rejectObject.appendMessage(error.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}