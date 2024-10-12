module.exports = {
    isValidMongoObjectId: isValidMongoObjectId,
    isBase64: isBase64,
    isNumeric: isNumeric,
    isNumericAndPositive: isNumericAndPositive,
    isInteger: isInteger,
    isIntegerAndPositive: isIntegerAndPositive,
    isAlphabetic: isAlphabetic,
    isAlphaNumeric: isAlphaNumeric,
    isAlphaNumericWithUnderscore: isAlphaNumericWithUnderscore,
    isAlphaNumericWithFwdSlashUnderscore: isAlphaNumericWithFwdSlashUnderscore,
    isAlphaNumericWithSpace: isAlphaNumericWithSpace,
    isAlphaNumericWithSpaceDot: isAlphaNumericWithSpaceDot,
    isAlphaNumericWithDot: isAlphaNumericWithDot,
    isAlphaNumericWithDotUnderscore: isAlphaNumericWithDotUnderscore,
    isAlphaNumericWithSpaceUnderscore: isAlphaNumericWithSpaceUnderscore,
    isAlphaNumericWithSpaceDotUnderscore: isAlphaNumericWithSpaceDotUnderscore,
    isAlphaNumericWithSpaceCommaDotUnderscore: isAlphaNumericWithSpaceCommaDotUnderscore,
    isAlphaNumericWithSpecial: isAlphaNumericWithSpecial,
    isString: isString,
    isNonEmptyString: isNonEmptyString,
    isEqualStrings: isEqualStrings,
    isEqualStringsIgnoreCase: isEqualStringsIgnoreCase,
    isBoolean: isBoolean,
    isBooleanString: isBooleanString,
    isVaildAndNonEmptyObject: isVaildAndNonEmptyObject,
    isVaildAndNonEmptyArray: isVaildAndNonEmptyArray,
    isNonEmptyObject: isNonEmptyObject,
    isNonEmptyArray: isNonEmptyArray,
    isNonEmptySet: isNonEmptySet,
    isTokenValidForUgsServer: isTokenValidForUgsServer,
    isValidPhone: isValidPhone,
    isValidPhoneCountryCode: isValidPhoneCountryCode,
    isValidPhoneNumber: isValidPhoneNumber,
    isValidPersonName: isValidPersonName,
    isvalidAdress: isvalidAdress,
    isValidAccessType: isValidAccessType,
    isValidDeviceIdentifier: isValidDeviceIdentifier,
    isValidDeviceType: isValidDeviceType,
    isValidSettingValueType: isValidSettingValueType,
    isValidRouteType: isValidRouteType,
    isValidRouteStatus: isValidRouteStatus,
    isValidRouteState: isValidRouteState,
    isValidRouteAccess: isValidRouteAccess,
    isValidRouteCheckpointType: isValidRouteCheckpointType,
    isValidGeofenceType: isValidGeofenceType,
    isValidGeofenceStatus: isValidGeofenceStatus,
    isValidGeofenceAccess: isValidGeofenceAccess,
    isValidGeofenceState: isValidGeofenceState,
    isValidGeofenceThresholdStatus: isValidGeofenceThresholdStatus,
    isValidAclRootDatPath: isValidAclRootDatPath,
    isValidTimezone: isValidTimezone,
    isValidDeviceId: isValidDeviceId,
    isValidIdOfGivenType: isValidIdOfGivenType,
    isValidMac: isValidMac,
    isValidImei: isValidImei,
    isValidImsi: isValidImsi,
    isValidSerial: isValidSerial,
    isValidRemoteTriggerSosStatus: isValidRemoteTriggerSosStatus,
    isValidStosNotificationEntity: isValidStosNotificationEntity,
    isValidStosNotificationOperation: isValidStosNotificationOperation,
    isValidAction: isValidAction,
    isValidEmail: isValidEmail,
    isValidTriggerDeviceCommand: isValidTriggerDeviceCommand,
    isValidUserStatus: isValidUserStatus,
    isValidUserType: isValidUserType,
    isValidJson: isValidJson,
    isValidPassword: isValidPassword,
    isValidLogType: isValidLogType,
    isValidApplicationCode: isValidApplicationCode,
    isValidAlertType: isValidAlertType,
    isValidAlertPriority: isValidAlertPriority,
    isValidAlertStatus: isValidAlertStatus,
    isValidLatLng: isValidLatLng,
    isValidFileType: isValidFileType,
    isValidIncidentType: isValidIncidentType,
    isValidIncidentSubType: isValidIncidentSubType,
    isValidIncidentStatus: isValidIncidentStatus,
    isValidMimeType: isValidMimeType,
    isValidFrMimeType: isValidFrMimeType,
    isSuccessResponse: isSuccessResponse,
    isSuccessResponseAndNonEmptyData: isSuccessResponseAndNonEmptyData,
    isSuccessKafkaResponse: isSuccessKafkaResponse,
    isValidAlertSubscriptionFrequency: isValidAlertSubscriptionFrequency,
    isValidDob: isValidDob,
    isValidEid: isValidEid,
    isValidEventType: isValidEventType,
    isValidUTCTimestamp: isValidUTCTimestamp,
    isValidJwt: isValidJwt,
    isValidJwtAudience: isValidJwtAudience,
    isValidTokenType: isValidTokenType,
    isValidDatPath: isValidDatPath,
    isValidMessageType: isValidMessageType,
    isValidObject: isValidObject,
    isValidJobType: isValidJobType,
    isValidJobStatus: isValidJobStatus,
    isValidEntity: isValidEntity,
    isValidEventPullSimConsentStatus: isValidEventPullSimConsentStatus,
    isSuccessResponseAndNonEmptyDataArray: isSuccessResponseAndNonEmptyDataArray,
    isValidSlaveId: isValidSlaveId,
    isValidTaskStatus: isValidTaskStatus,
    isValidMeterMac: isValidMeterMac,
    isObjectKeyExists: isObjectKeyExists,
    isValidDBQueryObject: isValidDBQueryObject,
    isNonEmptyAndValidJsonString: isNonEmptyAndValidJsonString,
    isValidJsonString: isValidJsonString,
    isValidOTPType: isValidOTPType,
    isValidOTPTokenObject: isValidOTPTokenObject,
    isAllowedMimeType: isAllowedMimeType,
    getMimeTypeFromExtension: getMimeTypeFromExtension
};

// Imports
const Mongoose = require('mongoose');
const JWT = require('jsonwebtoken');
const Constants = require('../constant/constant');
const CommonConstants = require('../../common/constant/constant');
const SettingsMap = require('../../common/wrappers/bootstrap/settings-map');
const CommonSettingsKeys = require('../../common/setting/keys');
const MimeMatch = require('mime-match');


/**
 * Check if given value is valid Mongo Object ID
 * @param {String} id 
 */
function isValidMongoObjectId(id) {
    return Mongoose.Types.ObjectId.isValid(id);
}

/**
 * Check if given string is base64
 * @param {*} str 
 */
function isBase64(str) {
    if (isNonEmptyString(str)) {
        return !!str.match(/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/);
    } else {
        return false;
    }
}

/**
 * Check if Number
 * @param {*} n 
 */
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Check if Number and Positive
 * @param {*} n 
 */
function isNumericAndPositive(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) && (parseFloat(n) >= 0);
}

/**
 * Check if Integer
 * @param {*} n 
 */
function isInteger(n) {
    return !isNaN(parseInt(n)) && isFinite(n);
}

/**
 * Check if Integer and Positive
 * @param {*} n 
 */
function isIntegerAndPositive(n) {
    return !isNaN(parseInt(n)) && isFinite(n) && (parseInt(n) >= 0);
}

/**
 * Check if alphabetic
 * @param {*} str 
 */
function isAlphabetic(str) {
    if (isNonEmptyString(str)) {
        return !!str.match(/^[a-zA-Z]+$/i);
    } else {
        return false;
    }
}


/**
 * Check if alpha numeric
 * @param {*} str 
 */
function isAlphaNumeric(str) {
    if (isNonEmptyString(str)) {
        return !!str.match(/^[a-zA-Z0-9]+$/i);
    } else {
        return false;
    }
}

/**
 * Check if alpha numeric with underscore
 * @param {*} str 
 */
function isAlphaNumericWithUnderscore(str) {
    if (isNonEmptyString(str)) {
        return !!str.match(/^[\w]+$/i);
    } else {
        return false;
    }
}

/**
 * Check if alpha numeric with forward slash
 * @param {*} str 
 */
function isAlphaNumericWithFwdSlashUnderscore(str) {
    if (isNonEmptyString(str)) {
        return !!str.match(/^[\w\/]+$/i);
    } else {
        return false;
    }
}

/**
 * Check if alpha numeric with space
 * @param {*} str 
 */
function isAlphaNumericWithSpace(str) {
    if (isNonEmptyString(str)) {
        return !!str.match(/^[a-zA-Z0-9 ]+$/i);
    } else {
        return false;
    }
}

/**
 * Check if alpha numeric with space, dot
 * @param {*} str 
 */
function isAlphaNumericWithSpaceDot(str) {
    if (isNonEmptyString(str)) {
        return !!str.match(/^[a-zA-Z0-9. ]+$/i);
    } else {
        return false;
    }
}

/**
 * Check if alpha numeric with dot
 * @param {*} str 
 */
function isAlphaNumericWithDot(str) {
    if (isNonEmptyString(str)) {
        return !!str.match(/^[a-zA-Z0-9.]+$/i);
    } else {
        return false;
    }
}

/**
 * Check if alpha numeric with dot, underscore
 * @param {*} str 
 */
function isAlphaNumericWithDotUnderscore(str) {
    if (isNonEmptyString(str)) {
        return !!str.match(/^[\w.]+$/i);
    } else {
        return false;
    }
}

/**
 * Check if alpha numeric with space, underscore
 * @param {*} str 
 */
function isAlphaNumericWithSpaceUnderscore(str) {
    if (isNonEmptyString(str)) {
        return !!str.match(/^[\w ]+$/i);
    } else {
        return false;
    }
}


/**
 * Check if alpha numeric with space, dot, underscore
 * @param {*} str 
 */
function isAlphaNumericWithSpaceDotUnderscore(str) {
    if (isNonEmptyString(str)) {
        return !!str.match(/^[\w. ]+$/i);
    } else {
        return false;
    }
}
/**
 * Check if alpha numeric with space, dot, underscore
 * @param {*} str 
 */
function isAlphaNumericWithSpaceCommaDotUnderscore(str) {
    if (isNonEmptyString(str)) {
        return !!str.match(/^[\w. ,]+$/i);
    } else {
        return false;
    }
}

/**
 * Check if alpha numeric with special characters
 * @param {*} str 
 */
function isAlphaNumericWithSpecial(str) {
    if (typeof str === 'string') {
        return !!str.match(/^[\w !@#$%^&*(),."':{}\\[\]\/\-]+$/i);
    } else {
        return false;
    }
}

/**
 * Check if address is valid
 * @param {*} str
 */
function isvalidAdress(str) {
    if (typeof str === 'string') {
        return !!str.match(/^[\w !+@#$%^&*(),."':{}\\[\]\/\-]+$/i);
    } else {
        return false;
    }
}


/**
 * Check if person name is valid
 * @param {*} json obj
 */
function isValidPersonName(nameObj) {
    if (isVaildAndNonEmptyObject(nameObj)) {
        if (isVaildAndNonEmptyObject(nameObj.firstName) &&
            typeof nameObj.firstName === 'string' &&
            isAlphabetic(nameObj.firstName) &&
            isVaildAndNonEmptyObject(nameObj.lastName) &&
            typeof nameObj.lastName === 'string' &&
            isAlphabetic(nameObj.lastName)) {
            if (isVaildAndNonEmptyObject(nameObj.middleName)) {
                if (typeof nameObj.middleName === 'string' && isAlphabetic(nameObj.middleName)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
}

/**
 * Check if string
 * @param {*} value 
 */
function isString(value) {
    if ((typeof value === 'string' || value instanceof String) && value != null && value != undefined && value != 'null' && value != 'undefined') {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if non empty string
 * @param {*} value 
 */
function isNonEmptyString(value) {
    if (value && isString(value) && value.trim() != '') {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if two strings are equal
 * @param {*} value 
 */
function isEqualStrings(str1, str2) {
    if (isString(str1) && isString(str2) && (str1 === str2)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if two strings are equal with case insensitive
 * @param {*} value 
 */
function isEqualStringsIgnoreCase(str1, str2) {
    if (isString(str1) && isString(str2) && (str1.toLowerCase() === str2.toLowerCase())) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if Boolean
 * @param {*} value 
 */
function isBoolean(value) {
    if (typeof value === 'boolean' || value instanceof Boolean) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if Boolean string
 * @param {*} value 
 */
function isBooleanString(value) {
    if (isNonEmptyString(value) && (value == Constants.COMMON.APP_STRING.TRUE || value == Constants.COMMON.APP_STRING.FALSE)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if non-empty object
 * @param {*} obj 
 */
function isNonEmptyObject(obj) {
    if (obj && Object.keys(obj).length > 0) {
        return true;
    } else {
        return false;
    }
}


/**
 * Check if object key exists or not
 * @param {*} obj type object
 * @param {*} key type string or array
 */
function isObjectKeyExists(obj, key) {
    try {
        let objKeyArray = [];
        if(isNonEmptyString(key)){
            objKeyArray = key.split('');
        }
        else if(isNonEmptyArray(key)){
            objKeyArray = key;
        }
        else {
            return false;
        }

        return objKeyArray.reduce((myObj, level) => {
            if(isVaildAndNonEmptyObject(myObj) && level in myObj){
                return myObj[level] || true;
            }

            return false;
        }, obj) ? true : false;
    }
    catch(e){
        return false;
    }
}

/**
 * Check if non-empty array
 * @param {*} arr 
 */
function isNonEmptyArray(arr) {
    if (arr && Array.isArray(arr) && arr.length > 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if non-empty set
 * @param {*} val 
 */
function isNonEmptySet(val) {
    if (val && val instanceof Set && val.size > 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * Validate Token
 * @param {*} tokenType 
 * @param {*} tokenCreatedAt 
 */
function isTokenValidForUgsServer(tokenType, tokenCreatedAt) {
    switch (tokenType) {
    case Constants.COMMON.APP_OTP.REGISTRATION.CODE:
        var current = Date.parse(new Date().toUTCString()); // Timezone not considered. Usually, tokens must be stored in UTC in DB.

        if (typeof tokenCreatedAt != 'number') {
            tokenCreatedAt = Date.parse(new Date(tokenCreatedAt).toUTCString());
        }

        if ((current - tokenCreatedAt) <= SettingsMap.get(SettingsMap.COMMON.LIMITS.EXPIRY.TOKEN.MILLISECONDS.REGISTRATION)) {
            return true;
        } else {
            return false;
        }

        break;

    case Constants.COMMON.APP_OTP.INVITE.CODE:

        break;

    case Constants.COMMON.APP_OTP.RECOVERY.CODE:
        var current = Date.parse(new Date().toUTCString()); // Timezone not considered. Usually, tokens must be stored in UTC in DB.

        if (typeof tokenCreatedAt != 'number') {
            tokenCreatedAt = Date.parse(new Date(tokenCreatedAt).toUTCString());
        }
            let limit = SettingsMap.get(SettingsMap.COMMON.LIMITS.EXPIRY.TOKEN.MILLISECONDS.RESET_PASSWORD);
        if ((current - tokenCreatedAt) <= limit) {
            return true;
        } else {
            return false;
        }
        break;

    default:
        return false;
        break;
    }
}

/**
 * Check if valid phone data
 * @param {*} phone json obj 
 */
function isValidPhone(phone) {

    return (phone.cc &&
        isValidPhoneCountryCode(phone.cc) &&
        phone.number &&
        isValidPhoneNumber(phone.number));
}


/**
 * Check if valid phone country code
 * @param {*} str 
 */
function isValidPhoneCountryCode(code) {
    if (code) {
        return !!code.match(/^(\+?\d{1,7}|\d{1,8})$/i);
    } else {
        return false;
    }
}

/**
 * Validate phone number
 * @param {*} number 
 */
function isValidPhoneNumber(number) {
    if (number) {
        number = number.toString();
        var phoneNum = number.replace(/[^\d]/g, '');
        if (phoneNum.length >= 3 && phoneNum.length <= 13) { // To support emergency numbers like 100, 108, etc.
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

/**
 * Check if valid token type
 * @param {*} tokenType string
 */
function isValidOTPType(tokenType) {

    return (tokenType == CommonConstants.COMMON.APP_OTP.REGISTRATION.CODE ||
        tokenType == CommonConstants.COMMON.APP_OTP.VERIFY_EMAIL.CODE ||
        tokenType == CommonConstants.COMMON.APP_OTP.VERIFY_PHONE.CODE ||
        tokenType == CommonConstants.COMMON.APP_OTP.RESET_PASSWORD.CODE);
}


/**
 * Validate access type
 * @param {*} accessType 
 */
function isValidAccessType(accessType) {
    return (accessType === Constants.ROUTE.STATE.IN || accessType === Constants.ROUTE.STATE.OUT) ? true : false;
}

/**
 * Validate device identifier
 * @param {*} identifier 
 */
function isValidDeviceIdentifier(identifier) {
    return (identifier == Constants.DEVICE.IDENTIFIER.IMEI
        || identifier == Constants.DEVICE.IDENTIFIER.WIFI_MAC
        || identifier == Constants.DEVICE.IDENTIFIER.BT_MAC
        || identifier == Constants.DEVICE.IDENTIFIER.PHONE) ? true : false;
}

/**
 * Validate device type
 * @param {*} type 
 */
function isValidDeviceType(type) {
    return (type == Constants.DEVICE.TYPE.WATCH
        || type == Constants.DEVICE.TYPE.TRACKER
        || type == Constants.DEVICE.TYPE.EMPLOYEE) ? true : false;
}

/**
 * Validate setting value type
 * @param {*} valueType 
 */
function isValidSettingValueType(valueType) {
    return (valueType == Constants.COMMON.APP_SETTING.VALUE.TYPE.STRING
        || valueType == Constants.COMMON.APP_SETTING.VALUE.TYPE.INT
        || valueType == Constants.COMMON.APP_SETTING.VALUE.TYPE.FLOAT
        || valueType == Constants.COMMON.APP_SETTING.VALUE.TYPE.BOOLEAN
        || valueType == Constants.COMMON.APP_SETTING.VALUE.TYPE.JSON
        || valueType == Constants.COMMON.APP_SETTING.VALUE.TYPE.STRING_CONSTANT
        || valueType == Constants.COMMON.APP_SETTING.VALUE.TYPE.LIST_OF_STRING
        || valueType == Constants.COMMON.APP_SETTING.VALUE.TYPE.LIST_OF_JSON) ? true : false;
}

/**
 * Check if valid route type
 * @param {*} routeType 
 */
function isValidRouteType(routeType) {
    return (routeType == Constants.ROUTE.TYPE.ROUTE) ? true : false;
}

/**
 * Validate geofence status
 * @param {*} geofenceStatus 
 */
function isValidRouteStatus(routeStatus) {
    return (routeStatus == Constants.ROUTE.STATUS.ACTIVE
        || routeStatus == Constants.ROUTE.STATUS.INACTIVE
        || routeStatus == Constants.ROUTE.STATUS.DELETED) ? true : false;
}

/**
 * Validate route state
 * @param {*} state 
 */
function isValidRouteState(state) {
    if (isNonEmptyString(state)) {
        return (state.toLowerCase() == Constants.ROUTE.STATE.UNKNOWN
            || state.toLowerCase() == Constants.ROUTE.STATE.START
            || state.toLowerCase() == Constants.ROUTE.STATE.END
            || state.toLowerCase() == Constants.ROUTE.STATE.DEVIATION
            || state.toLowerCase() == Constants.ROUTE.STATE.RE_ENTRY
            || state.toLowerCase() == Constants.ROUTE.STATE.EXIT) ? true : false;
    } else {
        return false;
    }
}

/**
 * Validate route access
 * @param {*} access 
 */
function isValidRouteAccess(access) {
    return (access == Constants.ROUTE.ACCESS_LEVEL.RESTRICTED
        || access == Constants.ROUTE.ACCESS_LEVEL.AUTHORIZED
        || access == Constants.ROUTE.ACCESS_LEVEL.UNAUTHORIZED) ? true : false;
}

/**
 * Validate route checkpoint type
 * @param {*} routeCheckpointType 
 */
function isValidRouteCheckpointType(routeCheckpointType) {
    return (routeCheckpointType == Constants.ROUTE.CHECKPOINT.TYPE.CIRCULAR
        || routeCheckpointType == Constants.ROUTE.CHECKPOINT.TYPE.POLYGONAL) ? true : false;
}

/**
 * Validate geofence type
 * @param {*} geofenceType 
 */
function isValidGeofenceType(geofenceType) {
    return (geofenceType == Constants.GEOFENCE.TYPE.CIRCULAR
        || geofenceType == Constants.GEOFENCE.TYPE.POLYGONAL) ? true : false;
}

/**
 * Validate geofence status
 * @param {*} geofenceStatus 
 */
function isValidGeofenceStatus(geofenceStatus) {
    return (geofenceStatus == Constants.GEOFENCE.STATUS.ACTIVE
        || geofenceStatus == Constants.GEOFENCE.STATUS.INACTIVE
        || geofenceStatus == Constants.GEOFENCE.STATUS.DELETED) ? true : false;
}

/**
 * Validate geofence access
 * @param {*} access 
 */
function isValidGeofenceAccess(access) {
    return (access == Constants.GEOFENCE.ACCESS_LEVEL.RESTRICTED
        || access == Constants.GEOFENCE.ACCESS_LEVEL.AUTHORIZED
        || access == Constants.GEOFENCE.ACCESS_LEVEL.UNAUTHORIZED) ? true : false;
}

/**
 * Validate geofence state
 * @param {*} state 
 */
function isValidGeofenceState(state) {
    if (isNonEmptyString(state)) {
        return (state.toUpperCase() == Constants.GEOFENCE.STATE.UNKNOWN
            || state.toUpperCase() == Constants.GEOFENCE.STATE.GIN
            || state.toUpperCase() == Constants.GEOFENCE.STATE.GOUT) ? true : false;
    } else {
        return false;
    }
}

/**
 * Validate geofence state
 * @param {*} state 
 */
function isValidGeofenceThresholdStatus(state) {
    return (state == Constants.GEOFENCE.THRESHOLD.STATUS.ACTIVE
        || state == Constants.GEOFENCE.THRESHOLD.STATUS.INACTIVE) ? true : false;
}

/**
 * Check if root dat path
 * @param {*} datPath 
 */
function isValidAclRootDatPath(datPath) {
    if (datPath && (typeof datPath == 'string' || datPath instanceof String)) {
        let datArr = datPath.split(Constants.STRING.FORWARD_SLASH);
        if (datArr.length == 1) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

/**
 * Check if valid timezone
 * @param {*} str 
 */
function isValidTimezone(str) {
    // Initialize
    let isValid = false;

    if (isNonEmptyString(str)) {
        // Format +05:30
        isValid = !!str.match(/^([\+\-]{1}(\d{1,2}){1}:{1}(\d{2}){1})+$/i);
        if (!isValid) {
            // Format 'Europe/Isle_of_Man'
            isValid = !!str.match(/^([a-zA-Z]+(\/){1}[a-zA-Z_]+)+$/i);
        }
    }

    return isValid;
}

/**
 * Check if valid id
 * @param {*} id 
 * @param {*} idType 
 */
function isValidIdOfGivenType(id, idType) {
    if (idType == Constants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.IMEI) {
        return isValidImei(id);
    } else if (idType == Constants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.SERIAL) {
        return isValidSerial(id);
    } else if (idType == Constants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.IMSI) {
        return isValidImei(id);
    } else if (idType == Constants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.MAC) {
        return isValidMac(id);
    } else if (idType == Constants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER) {
        return isValidPhoneNumber(id);
    } else if (idType == Constants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL) {
        return isValidEmail(id);
    } else if (idType == Constants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.OTHER_ID) {
        //TODO
        return isValidImei(id);
    } else {
        return false;
    }
}


/**
 * Check if valid device id
 * @param {*} str 
 */
function isValidDeviceId(str) {
    // Initialize
    let isValid = false;

    if (isNonEmptyString(str)) {
        // Format A1:B2:C3:D4:E5:F6
        isValid = isValidMac(str);
        if (!isValid) {
            // Format 111111111111110
            isValid = isValidImei(str);
            if (!isValid) {
                // Format 111AABB9348cc
                isValid = isValidSerial(str);
                if (!isValid) {
                    // Format 9909099090
                    isValid = isValidPhoneNumber(str);
                    if (!isValid) {
                        // Format 111111111111110_23
                        isValid = isValidMeterMac(str);
                    }
                }
            }
        }
    }

    return isValid;
}

/**
 * Check if valid MAC
 * @param {*} str 
 */
function isValidMac(str) {
    // Initialize
    if (isNonEmptyString(str)) {
        // Format A1:B2:C3:D4:E5:F6
        return !!str.match(/^[0-9a-z]{1,2}([:])(?:[0-9a-z]{1,2}\1){4}[0-9a-z]{1,2}$/i);
    }

    return false;
}

/**
 * Check if valid IMEI
 * @param {*} str 
 */
function isValidImei(str) {
    // Initialize
    if (isNonEmptyString(str)) {
        // Format 111111111111110
        return !!str.match(/^([0-9]{15})+$/);
    }

    var etal = /^[0-9]{15}$/;
    if (!etal.test(s))
        return false;
    let sum = 0;
    let mul = 2;
    let l = 14;
    for (let i = 0; i < l; i++) {
        let digit = s.substring(l - i - 1, l - i);
        let tp = parseInt(digit, 10) * mul;
        if (tp >= 10)
            sum += (tp % 10) + 1;
        else
            sum += tp;
        if (mul == 1)
            mul++;
        else
            mul--;
    }
    let chk = ((10 - (sum % 10)) % 10);
    if (chk != parseInt(s.substring(14, 15), 10))
        return false;
    return true;
}
/**
 * Check if valid IMSI
 * @param {*} str 
 */
function isValidImsi(str) {
    // Initialize
    if (isNonEmptyString(str)) {
        // Format 111111111111110
        return !!str.match(/^([0-9]{15})+$/);
    }

    return false;
}

/**
 * Check if valid serial
 * @param {*} str 
 */
function isValidSerial(str) {
    // Initialize
    if (isNonEmptyString(str)) {
        // Format 1111111111111ab
        return isAlphaNumeric(str);
    }

    return false;
}

/**
 * Check if valid remote trigger sos status
 * @param {*} status 
 */
function isValidRemoteTriggerSosStatus(status) {
    return (status == Constants.REMOTE_TRIGGER.SOS.STATUS.START
        || status == Constants.REMOTE_TRIGGER.SOS.STATUS.STOP) ? true : false;
}

/**
 * Check if valid stos notification entity
 * @param {*} entity 
 */
function isValidStosNotificationEntity(entity) {
    return (entity == Constants.STOS.NOTIFICATION.REQUEST.HEADER.ENTITY.B2B_DOMAIN_REGISTRATION
        || entity == Constants.STOS.NOTIFICATION.REQUEST.HEADER.ENTITY.B2B_DOMAIN_DEVICE_REGISTRATION
        || entity == Constants.STOS.NOTIFICATION.REQUEST.HEADER.ENTITY.B2C_CUSTOMER_REGISTRATION
        || entity == Constants.STOS.NOTIFICATION.REQUEST.HEADER.ENTITY.B2C_CUSTOMER_DEVICE_REGISTRATION
        || entity == Constants.STOS.NOTIFICATION.REQUEST.HEADER.ENTITY.CUSTOMER_CREDENTIAL) ? true : false;
}

/**
 * Check if valid stos notification operation
 * @param {*} operation 
 */
function isValidStosNotificationOperation(operation) {
    return (operation == Constants.STOS.NOTIFICATION.REQUEST.HEADER.OPERATION.CREATE
        || operation == Constants.STOS.NOTIFICATION.REQUEST.HEADER.OPERATION.READ
        || operation == Constants.STOS.NOTIFICATION.REQUEST.HEADER.OPERATION.UPDATE
        || operation == Constants.STOS.NOTIFICATION.REQUEST.HEADER.OPERATION.DELETE) ? true : false;
}

/**
 * Check if valid action
 * @param {*} action 
 */
function isValidAction(action) {
    return (action == Constants.ACTION.CREATE
        || action == Constants.ACTION.READ
        || action == Constants.ACTION.UPDATE
        || action == Constants.ACTION.DELETE) ? true : false;
}

/**
 * Check if valid email
 * @param {*} email 
 */
function isValidEmail(email) {
    if (isNonEmptyString(email)) {
        return !!email.match(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/i);
    } else {
        return false;
    }
}


/**
 * Check if trigger device command is valid
 * @param {*} command 
 */
function isValidTriggerDeviceCommand(command) {
    return (command == Constants.TRIGGER.DEVICE.COMMAND.SOS_BY_DAT
        || command == Constants.TRIGGER.DEVICE.COMMAND.SIM_BASED_TRACKING_BY_DAT
        || command == Constants.TRIGGER.DEVICE.COMMAND.SOS_BY_GEOFENCE
        || command == Constants.TRIGGER.DEVICE.COMMAND.DELETE_GEOFENCE) ? true : false;
}

/**
 * Check if valid user status
 * @param {*} status 
 */
function isValidUserStatus(status) {
    return (status == Constants.USER.STATUS.ACTIVE
        || status == Constants.USER.STATUS.EMAIL_NOT_VERIFIED
        || status == Constants.USER.STATUS.INSTOCK
        || status == Constants.USER.STATUS.LOCKED
        || status == Constants.USER.STATUS.MARKED_FOR_DELETION
        || status == Constants.USER.STATUS.NO_REFERNCE
        || status == Constants.USER.STATUS.UNLOCK
        || status == Constants.USER.STATUS.UNMARKED_FROM_DELETION
    ) ? true : false;
}

/**
 * Check if valid user type
 * @param {*} type 
 */
function isValidUserType(type) {
    return (type == Constants.USER.TYPE.SUPERVISOR
        || type == Constants.USER.TYPE.SERVER
        || type == Constants.USER.TYPE.STUDENT
        || type == Constants.USER.TYPE.WATCH
        || type == Constants.USER.TYPE.EMPLOYEE
    ) ? true : false;
}




/**
 * Check if valid json
 * @param {*} json 
 */
function isValidJson(json) {
    try {
        if (isValidObject(json)) {
            JSON.parse(JSON.stringify(json));
        } else {
            JSON.parse(json);
        }
    } catch (error) {
        return false;
    }
    return true;
}

/**
 * Check if valid password
 * @param {*} password 
 */
function isValidPassword(password) {
    try {
        if (isNonEmptyString(password)) {
            // Initialize
            let isMinLength = false;
            let isMaxLength = false;
            let hasUpperCase = false;
            let hasLowerCase = false;
            let hasNumber = false;
            let hasSpecialChar = false;

            isMinLength = (password.length >= 8) ? true : false;
            isMaxLength = (password.length <= 16) ? true : false;

            // Check for atleast one
            hasUpperCase = /[A-Z]/.test(password);
            hasLowerCase = /[a-z]/.test(password);
            hasNumber = /\d/.test(password);
            hasSpecialChar = /[!@#$%^&*()_\-+=]+/.test(password);

            // Check if any invalid special character
            // hasSpecialChar = !!password.match(/^[\w!@#$%^&*()_\-+=]+$/i);

            if (isMinLength && isMaxLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

/**
 * Check if valid log type
 * @param {*} type 
 */
function isValidLogType(type) {
    return (type == Constants.LOG.TYPE.API) ? true : false;
}

/**
 * Check if valid application code
 * @param {*} code 
 */
function isValidApplicationCode(code) {
    return (code == Constants.APPLICATION.BOOTSTRAP_SERVER.CODE
        || code == Constants.APPLICATION.CACHE.CODE
        || code == Constants.APPLICATION.UGS_SERVER.CODE
        || code == Constants.APPLICATION.JOB.ADD_DAT_TO_DEVICE.CODE
        || code == Constants.APPLICATION.JOB.ADD_DAT_TO_OTHER_DAT_USER.CODE
        || code == Constants.APPLICATION.JOB.ASSIGN_DAT_TO_DEVICE.CODE
        || code == Constants.APPLICATION.JOB.ASSOCIATE_USER_AND_PERSON_TRACKER_DEVICE.CODE
        || code == Constants.APPLICATION.JOB.ASSOCIATE_USER_AND_VEHICLE_TRACKER_DEVICE.CODE
        || code == Constants.APPLICATION.JOB.DELETE_DAT.CODE
        || code == Constants.APPLICATION.JOB.DEVICE_REPORT.CODE
        || code == Constants.APPLICATION.JOB.DEVICE_USAGE_REPORT.CODE
        || code == Constants.APPLICATION.JOB.DEVICE_USAGE_REPORT_BY_DAT.CODE
        || code == Constants.APPLICATION.JOB.EDIT_DAT.CODE
        || code == Constants.APPLICATION.JOB.MOVE_DAT_OF_DEVICE.CODE
        || code == Constants.APPLICATION.JOB.REMOVE_DAT_FROM_DEVICE.CODE
        || code == Constants.APPLICATION.JOB.TRIGGER_DEVICE_CMD.CODE
        || code == Constants.APPLICATION.JOB.DOWNLOAD.CODE
        || code == Constants.APPLICATION.JOB.ONBOARD_STATS_REPORT.CODE
        || code == Constants.APPLICATION.MESSAGE_PROCESSOR.CODE
        || code == Constants.APPLICATION.MESSAGE_PROCESSOR.AWS_IOT_EVENT.CODE
        || code == Constants.APPLICATION.MESSAGE_PROCESSOR.KAFKA_DEVICE_EVENT.CODE
        || code == Constants.APPLICATION.MESSAGE_PROCESSOR.KAFKA_FOTA.CODE
        || code == Constants.APPLICATION.MESSAGE_PROCESSOR.KAFKA_EVENT.CODE
        || code == Constants.APPLICATION.MESSAGE_PROCESSOR.STOS_NTFY_B2B_DOMAIN.CODE
        || code == Constants.APPLICATION.MESSAGE_PROCESSOR.STOS_NTFY_B2B_DOMAIN_DEVICE.CODE
        || code == Constants.APPLICATION.MESSAGE_PROCESSOR.STOS_NTFY_B2C_CUSTOMER.CODE
        || code == Constants.APPLICATION.MESSAGE_PROCESSOR.STOS_NTFY_B2C_CUSTOMER_DEVICE.CODE
        || code == Constants.APPLICATION.MESSAGE_PROCESSOR.STOS_NTFY_CUSTOMER_CREDENTIAL.CODE
        || code == Constants.APPLICATION.MESSAGE_PROCESSOR.AUDIT_LOG.CODE
        || code == Constants.APPLICATION.MESSAGE_PROCESSOR.ALERT.CODE
        || code == Constants.APPLICATION.MESSAGE_PROCESSOR.KAFKA_REVERSE_EVENT.CODE
        || code == Constants.APPLICATION.FILE_SERVER.CODE
        || code == Constants.APPLICATION.SMPP_SERVER.CODE
        || code == Constants.APPLICATION.AUDIT_SERVER.CODE
        || code == Constants.APPLICATION.NOTIFICATION_SERVER.CODE
        || code == Constants.APPLICATION.ALERT_SERVER.CODE) ? true : false;
}

/**
 * Check if valid alert type
 * @param {*} type 
 */
function isValidAlertType(type) {
    return (type === Constants.ALERT.TYPE.SMS
        || type === Constants.ALERT.TYPE.EMAIL
        || type === Constants.ALERT.TYPE.FCM
        || type === Constants.ALERT.TYPE.UI) ? true : false;
}

/**
 * Check if valid alert priority
 * @param {*} priority 
 */
function isValidAlertPriority(priority) {
    return isIntegerAndPositive(priority);
}

/**
 * Check if valid alert status
 * @param {*} priority 
 */
function isValidAlertStatus(status) {
    return (status === Constants.ALERT.STATUS.ACKNOWLEDGED
        || status === Constants.ALERT.STATUS.UNACKNOWLEDGED
        || status === Constants.ALERT.STATUS.CLOSED
        || status === Constants.ALERT.STATUS.COMPLETED
        || status === Constants.ALERT.STATUS.IN_PROGRESS
        || status === Constants.ALERT.STATUS.OPEN
        || status === Constants.ALERT.STATUS.PENDING) ? true : false;
}

/**
 * Check if valid task status
 * @param {*} priority
 */
function isValidTaskStatus(status) {
    return (status === Constants.TASK.STATUS.NEW
        || status === Constants.TASK.STATUS.OPEN
        || status === Constants.TASK.STATUS.IN_PROGRESS
        || status === Constants.TASK.STATUS.CLOSED
        || status === Constants.TASK.STATUS.COMPLETED
        || status === Constants.TASK.STATUS.PENDING) ? true : false;
}

/**
 * Validate latitude and longitude
 * @param {*} latLng 
 */
function isValidLatLng(latLng) {
    try {
        if (latLng && isNonEmptyObject(latLng)) {
            if (latLng.lat && latLng.lng) {
                let isLat = false;
                let isLng = false;
                isLat = /^([-+]?)([\d]{1,2})(((\.)(\d+)))(\s*)$/.test(latLng.lat);
                isLng = /^(([-+]?)([\d]{1,3})((\.)(\d+))?)$/.test(latLng.lng);
                if (isLat == true && isLng == true) {
                    return true;
                } else {
                    return false;
                }
            } else if (latLng.latitude && latLng.longitude) {
                let isLat = false;
                let isLng = false;
                isLat = /^([-+]?)([\d]{1,2})(((\.)(\d+)))(\s*)$/.test(latLng.latitude);
                isLng = /^(([-+]?)([\d]{1,3})((\.)(\d+))?)$/.test(latLng.longitude);
                if (isLat == true && isLng == true) {
                    return true;
                } else {
                    return false;
                }
            }
            else {
                return false;
            }
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

/**
 * Check if valid file type
 * @param {*} type 
 */
function isValidFileType(type) {
    return (type == Constants.FILE.TYPE.AUDIO
        || type == Constants.FILE.TYPE.VIDEO
        || type == Constants.FILE.TYPE.CONTACT
        || type == Constants.FILE.TYPE.IMAGE) ? true : false;
}

/**
 * Check if valid incident type
 * @param {*} type 
 */
function isValidIncidentType(type) {
    if (isNonEmptyString(type)) {
        return (type.toLowerCase() == Constants.INCIDENT.TYPE.INCIDENT
            || type.toLowerCase() == Constants.INCIDENT.TYPE.SOS) ? true : false;
    } else {
        return false;
    }
}

/**
 * Check if valid incident sub type
 * @param {*} subType 
 */
function isValidIncidentSubType(subType) {
    if (isNonEmptyString(subType)) {
        return (subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.ANTI_SOCIAL_ELEMENTS
            || subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.CABLE_CUT
            || subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.CONSTRUCTION_ACTIVITY
            || subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.DANGER_TO_LIFE
            || subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.DEFAULT
            || subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.DEVELOPMENT_ACTIVITY
            || subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.EMERGENCY
            || subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.EMERGENCY_SOS
            || subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.ENCROACHMENT
            || subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.EXCAVATION
            || subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.LEAK
            || subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.OTHER
            || subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.PIPELINE_OR_CABLE_EXPOSURE
            || subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.ROAD_WIDENING_ACTIVITY
            || subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.SUSPICIOUS_ACTIVITY
            || subType.toLowerCase() == Constants.INCIDENT.SUB_TYPE.VULNERABLE_AREA) ? true : false;
    } else {
        return false;
    }
}

/**
 * Check if valid incident status
 * @param {*} status 
 */
function isValidIncidentStatus(status) {
    return (status == Constants.INCIDENT.STATUS.ACKNOWLEDGED
        || status == Constants.INCIDENT.STATUS.UNACKNOWLEDGED
        || status == Constants.INCIDENT.STATUS.CLOSED
        || status == Constants.INCIDENT.STATUS.COMPLETED
        || status == Constants.INCIDENT.STATUS.IN_PROGRESS
        || status == Constants.INCIDENT.STATUS.OPEN
        || status == Constants.INCIDENT.STATUS.PENDING) ? true : false;
}

/**
 * Check if valid mime type
 * @param {*} type 
 */
function isValidMimeType(type) {
    return (
        type == Constants.FILE.MIME_TYPE.APPLICATION.OCTET_STREAM
        || type == Constants.FILE.MIME_TYPE.APPLICATION.OGG
        || type == Constants.FILE.MIME_TYPE.APPLICATION.JSON
        || type == Constants.FILE.MIME_TYPE.APPLICATION.VND_MS_EXCEL
        || type == Constants.FILE.MIME_TYPE.APPLICATION.EXCEL_XLSX
        || type == Constants.FILE.MIME_TYPE.APPLICATION.ZIP
        || type == Constants.FILE.MIME_TYPE.APPLICATION.XZIP
        || type == Constants.FILE.MIME_TYPE.AUDIO.WAVE
        || type == Constants.FILE.MIME_TYPE.AUDIO.WAV
        || type == Constants.FILE.MIME_TYPE.AUDIO.OGG
        || type == Constants.FILE.MIME_TYPE.AUDIO.MP3
        || type == Constants.FILE.MIME_TYPE.AUDIO.MP4
        || type == Constants.FILE.MIME_TYPE.AUDIO.MPEG
        || type == Constants.FILE.MIME_TYPE.AUDIO.X_AAC
        || type == Constants.FILE.MIME_TYPE.AUDIO.AAC
        || type == Constants.FILE.MIME_TYPE.AUDIO.AMR
        || type == Constants.FILE.MIME_TYPE.IMAGE.JPEG
        || type == Constants.FILE.MIME_TYPE.IMAGE.PNG
        || type == Constants.FILE.MIME_TYPE.IMAGE.GIF
        || type == Constants.FILE.MIME_TYPE.TEXT.CSV
        || type == Constants.FILE.MIME_TYPE.VIDEO.WAVE
        || type == Constants.FILE.MIME_TYPE.VIDEO.WAV
        || type == Constants.FILE.MIME_TYPE.VIDEO.OGG
        || type == Constants.FILE.MIME_TYPE.VIDEO.MP4
    ) ? true : false;
}

/**
 * Check if valid mime type for Image Upload
 * @param {*} type 
 */
function isValidFrMimeType(type) {
    return (type == Constants.FILE.MIME_TYPE.IMAGE.JPEG
        || type == Constants.FILE.MIME_TYPE.IMAGE.PNG
    ) ? true : false;
}

/**
 * Check if success response
 * @param {*} response 
 */
function isSuccessResponse(response) {
    if (isNonEmptyObject(response)
        && (response.code == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE
        || response.status == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE
        || response.sts == CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if success response for kafka as code will be 202
 * @param {*} response
 */
function isSuccessKafkaResponse(response) {
    if (isNonEmptyObject(response)
        && (response.code == Constants.HTTP.STATUS.ACCEPTED_PROCESSING.CODE
            || response.status == Constants.HTTP.STATUS.ACCEPTED_PROCESSING.CODE
            || response.sts == Constants.HTTP.STATUS.ACCEPTED_PROCESSING.CODE)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if success response with non empty data
 * @param {*} response 
 */
function isSuccessResponseAndNonEmptyData(response) {
    if (isSuccessResponse(response) && isNonEmptyObject(response.data)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if success response with non empty data array
 * @param {*} response 
 */
function isSuccessResponseAndNonEmptyDataArray(response) {
    if (isSuccessResponse(response) && isNonEmptyArray(response.data)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if valid alert subscription frequency
 * @param {String} frequency
 */
function isValidAlertSubscriptionFrequency(frequency) {
    if (isNonEmptyString(frequency)) {
        return (frequency == Constants.ALERT.SUBSCRIPTION.FREQUENCY.OCCASIONAL
            || frequency == Constants.ALERT.SUBSCRIPTION.FREQUENCY.DAILY) ? true : false;
    } else {
        return false;
    }
}

/**
 * Verify dob
 * @param {*} dob 
 */
function isValidDob(dob) {
    if (isNonEmptyString(dob)) {
        return !!dob.match(/^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[012])-\d{4}$/);
    } else {
        return false;
    }
}

/**
 * Verify eid
 * @param {*} eid
 */
function isValidEid(eid) {
    if (isNonEmptyString(eid)) {
        return (eid == Constants.TENANT.MVP.CODE
            || eid == Constants.TENANT.SSP.CODE
            // || eid == Constants.TENANT.WFM.CODE
        ) ? true : false;
    } else {
        return false;
    }
}

/**
 * Verify event type
 * @param {*} type 
 */
function isValidEventType(type) {
    if (isNonEmptyString(type)) {
        return (type == Constants.EVENT.SOS
            || type == Constants.EVENT.SAFEZONE_ENTRY
            || type == Constants.EVENT.SAFEZONE_EXIT
            || type == Constants.EVENT.DEVICE_GEOFENCE
            || type == Constants.EVENT.BATTERY_STATUS
            || type == Constants.EVENT.BATTERY_ALERT
            || type == Constants.EVENT.TAMPER_ALERT
            || type == Constants.EVENT.BATTERY_CONNECT
            || type == Constants.EVENT.BATTERY_DISCONNECT
            || type == Constants.EVENT.THRESHOLD_BREACH
            || type == Constants.EVENT.MOVEMENT_ALERT
            || type == Constants.EVENT.INCIDENT
            || type == Constants.EVENT.OVER_SPEED
            || type == Constants.EVENT.OVER_STOP
            || type == Constants.EVENT.LOCATION
            || type == Constants.EVENT.WEARING
            || type == Constants.EVENT.NOT_WEARING
            || type == Constants.EVENT.CLASS_MODE
            || type == Constants.EVENT.STATUS
            || type == Constants.EVENT.ROUTE_ENTRY
            || type == Constants.EVENT.ROUTE_EXIT
            || type == Constants.EVENT.ROUTE_START
            || type == Constants.EVENT.ROUTE_END
            || type == Constants.EVENT.ROUTE_EXIT
            || type == Constants.EVENT.ROUTE_RE_ENTRY
            || type == Constants.EVENT.ROUTE_DEVIATION
            || type == Constants.EVENT.ROUTE_CHECKPOINT
            || type == Constants.EVENT.SHUTTER.OPEN
            || type == Constants.EVENT.SHUTTER.CLOSE
            || type == Constants.EVENT.SHOP.ARM
            || type == Constants.EVENT.SHOP.DISARM

        ) ? true : false;
    } else {
        return false;
    }
}

/**
 * Verify if valid UTC timestamp
 * @param {*} value 
 */
function isValidUTCTimestamp(value) {
    try {
        if (isNumericAndPositive(value)) {
            value = parseFloat(value);
            return new Date(value).getTime() > 0;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

/**
 * Verify if valid JWT
 * @param {*} token 
 * @param {*} params 
 * @param {*} flags 
 */
function isValidJwt(token, params, flags) {
    try {
        if (isNonEmptyString(token)) {
            if (!flags) {
                flags = {};
            }
            let isValid = false;
            JWT.verify(token, SettingsMap.get(CommonSettingsKeys.COMMON.JWT.SECRET), (error, decoded) => {
                if (error) {
                    if (flags.isSkipExpiryCheck && error.name == 'TokenExpiredError') {
                        isValid = true;
                    } else {
                        isValid = false;
                    }
                } else {
                    isValid = true;
                }
            });
            return isValid;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

/**
 * Verify JWT audience
 * @param {*} audience 
 */
function isValidJwtAudience(audience) {
    return (
        isNonEmptyString(audience)
        && Constants.JWT.AUDIENCE[audience.toUpperCase()] != undefined
    ) ? true : false;
}

/**
 * Verify token type
 * @param {*} type 
 */
function isValidTokenType(type) {
    return (
        isNonEmptyString(type)
        && Constants.TOKEN.TYPE[type.toUpperCase()] != undefined
    ) ? true : false;
}

/**
 * Verify if valid DAT path
 * @param {*} dat 
 */
function isValidDatPath(dat) {
    return isAlphaNumericWithFwdSlashUnderscore(dat);
}

/**
 * Verify if valid message type
 * @param {*} type 
 */
function isValidMessageType(type) {
    if (isNonEmptyString(type)) {
        return (Constants.MESSAGE.TYPE.TEXT == type
            || Constants.MESSAGE.TYPE.AUDIO) ? true : false;
    } else {
        return false;
    }
}

/**
 * Verify if valid object
 * @param {*} value 
 */
function isValidObject(value) {
    if (typeof value === 'object' || value instanceof Object) {
        return true;
    } else {
        return false;
    }
}

/**
 * Verify if valid job type
 * @param {*} type 
 */
function isValidJobType(type) {
    return (
        Constants.JOB.TYPE.ADD_DAT_TO_DEVICE ||
        Constants.JOB.TYPE.ADD_DAT_TO_OTHER_DAT_USER ||
        Constants.JOB.TYPE.ASSIGN_DAT_TO_DEVICE ||
        Constants.JOB.TYPE.ASSOCIATE_USER_AND_PERSON_TRACKER_DEVICE ||
        Constants.JOB.TYPE.ASSOCIATE_USER_AND_STUDENT_TRACKER_DEVICE ||
        Constants.JOB.TYPE.ASSOCIATE_USER_AND_VEHICLE_TRACKER_DEVICE ||
        Constants.JOB.TYPE.ASSOCIATE_USER_STUDENT_REFERENCE_IMAGE ||
        Constants.JOB.TYPE.DELETE_DAT ||
        Constants.JOB.TYPE.DELETE_DEVICE ||
        Constants.JOB.TYPE.DELETE_TASK_DATA ||
        Constants.JOB.TYPE.DELETE_ENTITY ||
        Constants.JOB.TYPE.DEVICE_REPORT ||
        Constants.JOB.TYPE.DEVICE_USAGE_REPORT ||
        Constants.JOB.TYPE.DEVICE_USAGE_REPORT_BY_DAT ||
        Constants.JOB.TYPE.EDIT_DAT ||
        Constants.JOB.TYPE.MOVE_DAT_OF_DEVICE ||
        Constants.JOB.TYPE.REMOVE_DAT_FROM_DEVICE ||
        Constants.JOB.TYPE.RIGHT_TO_DELETE ||
        Constants.JOB.TYPE.RIGHT_TO_KNOW ||
        Constants.JOB.TYPE.TRIGGER_DEVICE_CMD ||
        Constants.JOB.TYPE.REPORT
    ) ? true : false;
}

/**
 * Verify if valid job status
 * @param {*} status
 */
function isValidJobStatus(status) {
    return (
        Constants.JOB.STATUS.CREATED ||
        Constants.JOB.STATUS.READY_FOR_EXECUTION ||
        Constants.JOB.STATUS.IN_PROGRESS ||
        Constants.JOB.STATUS.CANCELED ||
        Constants.JOB.STATUS.COMPLETED ||
        Constants.JOB.STATUS.PARTIAL_SUCCESS ||
        Constants.JOB.STATUS.ERROR
    ) ? true : false;
}

/**
 * Check if valid entity
 * @param {*} entity 
 */
function isValidEntity(entity) {
    return (
        isNonEmptyString(entity)
        && Constants.ENTITY[entity.toUpperCase()] != undefined
    ) ? true : false;
}

/**
 * Check if valid event pull SIM consent status
 * @param {*} status 
 */
function isValidEventPullSimConsentStatus(status) {
    return (
        isNonEmptyString(status)
        && Constants.SIM_EVENT.SIM.CONSENT.STATUS[status.toUpperCase()] != undefined
    ) ? true : false;
}

/**
 * Check if valid slave id
 * @param {*} str 
 */
function isValidSlaveId(str) {
    // Initialize
    if (isNonEmptyString(str)) {
        // Format numeric
        return !!str.match(/^([0-9])+$/);
    }

    return false;
}

/**
 * Check if valid meter mac
 * @param {*} str 
 */
function isValidMeterMac(str) {
    // Initialize
    if (isNonEmptyString(str)) {
        let splitStr = str.split('_');
        if (splitStr.length == 2 && isValidImei(splitStr[0]) && isValidSlaveId(splitStr[1])) {
            return true;
        }
    }

    return false;
}


/**
 * isValidDBFetchAllLimit
 * @param {*} n 
 */
function isValidDBFetchAllLimit(n) {
    let maxLimit, minLimit;
    if (isIntegerAndPositive(SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.LIMIT.MAX))) {
        maxLimit = SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.LIMIT.MAX);
    } else {
        maxLimit = CommonConstants.COMMON.APP_DB.FETCH_ALL.LIMIT.MAX;
    }
    if (isIntegerAndPositive(SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.LIMIT.MIN))) {
        minLimit = SettingsMap.get(CommonSettingsKeys.COMMON.DATABASE.FETCH_ALL.LIMIT.MIN);
    } else {
        minLimit = CommonConstants.COMMON.APP_DB.FETCH_ALL.LIMIT.MIN;
    }

    return !isNaN(parseInt(n)) && isFinite(n) && (isIntegerAndPositive(n)) && (minLimit <= n) && (n <= maxLimit);
}

/**
 * isValidDBFetchAllSkip
 * @param {*} n 
 */
function isValidDBFetchAllSkip(n) {
    return !isNaN(parseInt(n)) && isFinite(n) && isIntegerAndPositive(n);
}
/**
 * isValidDBQueryObject
 * @param {*} obj 
 */
function isValidDBQueryObject(obj) {
    return isVaildAndNonEmptyObject(obj) && isValidDBFetchAllSkip(parseInt(obj.skip)) && isValidDBFetchAllLimit(parseInt(obj.limit));
}

/**
 * isNonEmptyAndValidJsonString
 * @param {*} str 
 */
function isNonEmptyAndValidJsonString(str) {
    try {
        var o = JSON.parse(str);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns null, and typeof null === "object", 
        // so we must check for that, too. Thankfully, null is falsey, so this suffices:
        if (o && typeof o === 'object' && Object.keys(o).length > 0) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (e) {
        return false;
    }
}

/**
* isValidJsonString
* @param {*} str 
*/
function isValidJsonString(str) {
    try {
        var o = JSON.parse(str);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns null, and typeof null === "object", 
        // so we must check for that, too. Thankfully, null is falsey, so this suffices:
        if (o && typeof o === 'object') {
            return true;
        }
        else {
            return false;
        }
    }
    catch (e) {
        return false;
    }
}
/**
 * Check if valid-and-non-empty object
 * @param {*} obj 
 */
function isVaildAndNonEmptyObject(obj) {
    if (obj && typeof obj == 'object'
        && ['[object Object]', '[object Error]'].includes(Object.prototype.toString.call(obj))
        && Object.keys(obj).length > 0) {
        return true;
    } else {
        return false;
    }
}
/**
 * Check if valid-and-non-empty array
 * @param {*} obj 
 */
function isVaildAndNonEmptyArray(obj) {
    if (obj && typeof obj === 'object'
        && Array.isArray(obj)
        && obj.length > 0) {
        return true;
    } else {
        return false;
    }
}


/**
* Check if valid otpToken
* @param {*} obj 
*/
function isValidOTPTokenObject(obj) {
    if (obj && (obj['type']) && (obj['otp']) && (obj['expiry'])) {
        return true;
    } else {
        return false;
    }
}

/**
* Check if allowed mime type
* @param {*} obj 
*/
function isAllowedMimeType(mimeTypeToCheck, allowedMimeTypes) {
    let mimeTypeArray;
    if (allowedMimeTypes.split(',').length == 2) {
        mimeTypeArray = [];
        mimeTypeArray.push(allowedMimeTypes.replaceAll(',', ''));
    } else {
        mimeTypeArray = allowedMimeTypes.split(',');
    }
    allowedMimeTypes = mimeTypeArray;
    let length = allowedMimeTypes.length;
    let i = 0;
    for (i = 0; i < length; i++) {
        if (MimeMatch(mimeTypeToCheck, allowedMimeTypes[i])) {
            return true;
        }
    }
    return false;
}

//TODO get rid of the following
function getMimeTypeFromExtension(extension = 'txt') {
    if (extension[0] === '.') {
        extension = extension.substr(1);
    }
    return {
        'aac': 'audio/aac',
        'abw': 'application/x-abiword',
        'arc': 'application/x-freearc',
        'avi': 'video/x-msvideo',
        'mkv': 'video/x-matroska',
        'mov': 'video/x-quicktime',
        'azw': 'application/vnd.amazon.ebook',
        'bin': 'application/octet-stream',
        'bmp': 'image/bmp',
        'bz': 'application/x-bzip',
        'bz2': 'application/x-bzip2',
        'cda': 'application/x-cdf',
        'csh': 'application/x-csh',
        'css': 'text/css',
        'csv': 'text/csv',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'eot': 'application/vnd.ms-fontobject',
        'epub': 'application/epub+zip',
        'gz': 'application/gzip',
        'gif': 'image/gif',
        'htm': 'text/html',
        'html': 'text/html',
        'ico': 'image/vnd.microsoft.icon',
        'ics': 'text/calendar',
        'jar': 'application/java-archive',
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'js': 'text/javascript',
        'json': 'application/json',
        'jsonld': 'application/ld+json',
        'mid': 'audio/midi audio/x-midi',
        'midi': 'audio/midi audio/x-midi',
        'mjs': 'text/javascript',
        'mp3': 'audio/mpeg',
        'mp4': 'video/mp4',
        'mpeg': 'video/mpeg',
        'mpkg': 'application/vnd.apple.installer+xml',
        'odp': 'application/vnd.oasis.opendocument.presentation',
        'ods': 'application/vnd.oasis.opendocument.spreadsheet',
        'odt': 'application/vnd.oasis.opendocument.text',
        'oga': 'audio/ogg',
        'ogv': 'video/ogg',
        'ogx': 'application/ogg',
        'opus': 'audio/opus',
        'otf': 'font/otf',
        'png': 'image/png',
        'pdf': 'application/pdf',
        'php': 'application/x-httpd-php',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'rar': 'application/vnd.rar',
        'rtf': 'application/rtf',
        'sh': 'application/x-sh',
        'svg': 'image/svg+xml',
        'swf': 'application/x-shockwave-flash',
        'tar': 'application/x-tar',
        'tif': 'image/tiff',
        'tiff': 'image/tiff',
        'ts': 'video/mp2t',
        'ttf': 'font/ttf',
        'txt': 'text/plain',
        'vsd': 'application/vnd.visio',
        'wav': 'audio/wav',
        'weba': 'audio/webm',
        'webm': 'video/webm',
        'webp': 'image/webp',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
        'xhtml': 'application/xhtml+xml',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'xml': 'application/xml',
        'xul': 'application/vnd.mozilla.xul+xml',
        'zip': 'application/zip',
        '3gp': 'video/3gpp',
        '3g2': 'video/3gpp2',
        '7z': 'application/x-7z-compressed'
    }[extension] || 'application/octet-stream';
}