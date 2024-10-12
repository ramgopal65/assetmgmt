var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
const Constants = require('../../constant/constant');
const CommonConstants = require('../../../common/constant/constant');
const CommonValidator = require('../../../common/validate/validator');
const Validator = require('../../validate/validator');

const ObjectIdentifier = new Schema({
    id: {
        type: String,
        validate: {
            validator: function (id) {
                return CommonValidator.isValidIdOfGivenType(id, this.type);
            }
        },
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.IMEI,
            CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.SERIAL,
            CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.IMSI,
            CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.MAC,
            CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER,
            CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.OTHER_ID
        ],
        trim: true
    }

});

const PersonIdentifier = new Schema({
    id: {
        type: String,
        validate: {
            validator: function (identifier) {
                return CommonValidator.isValidIdOfGivenType(identifier, this.type);
            }
        },
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.PHONE_NUMBER,
            CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL
        ],
        trim: true
    }
});
const OTPToken = new Schema({
    type: {
        type: String,
        enum: [
            CommonConstants.COMMON.APP_OTP.REGISTRATION.CODE,
            CommonConstants.COMMON.APP_OTP.VERIFY_EMAIL.CODE,
            CommonConstants.COMMON.APP_OTP.VERIFY_PHONE.CODE,
            CommonConstants.COMMON.APP_OTP.RESET_PASSWORD.CODE,
            CommonConstants.COMMON.APP_OTP.OTP_LOGIN.CODE,
        ],
        trim: true
    },
    otp: {
        type: String,
        trim: true
    },
    remainingAttempts: {
        type: Number
    },
    expiry: {
        type: Number
    }
});

const JWTToken = new Schema({
    token: {
        type: String,
        trim: true
    },
    expiry: {
        type: Number
    }
});

const Imei = new Schema({
    imei: {
        type: String,
        validate: {
            validator: function (imei) {
                return CommonValidator.isValidImei(imei);
            }
        },
        trim: true
    }
});

const Mac = new Schema({
    mac: {
        type: String,
        validate: {
            validator: function (mac) {
                return CommonValidator.isValidMac(mac);
            }
        },
        trim: true
    }
});

const PhoneNumber = new Schema({
    cc: {
        type: String,
        validate: {
            validator: function (cc) {
                return CommonValidator.isValidPhoneCountryCode(cc);
            }
        },
        trim: true
    },
    number: {
        type: String,
        validate: {
            validator: function (p) {
                return CommonValidator.isValidPhoneNumber(p);
            }
        },
        trim: true
    },
    verified: {
        type: Boolean,
    },
});

const Imsi = new Schema({
    imsi: {
        type: String,
        validate: {
            validator: function (imsi) {
                return CommonValidator.isValidImsi(imsi);
            }
        },
        trim: true
    }
});

const Email = new Schema({
    email: {
        type: String,
        validate: {
            validator: function (email) {
                return CommonValidator.isValidEmail(email);
            }
        },
        trim: true
    },
    verified: {
        type: Boolean,
    },

});

const PersonName = new Schema({
    firstName: {
        type: String,
        required: true, //TODO - This is not getting invoked when using findOneByIdAndUpdate
        minlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.NAME.MIN_LENGTH,
        maxlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.NAME.MAX_LENGTH,
        trim: true
    },
    middleName: {
        type: String,
        //minlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.NAME.MIN_LENGTH,
        maxlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.NAME.MAX_LENGTH,
        trim: true
    },
    lastName: {
        type: String,
        //required: true, //TODO - This is not getting invoked when using findOneByIdAndUpdate
        //minlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.NAME.MIN_LENGTH,
        maxlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.NAME.MAX_LENGTH,
        trim: true
    }
});

const ProfileData = new Schema({
    name: {
        type: PersonName,
        required: true,
        validate: { //TODO - This is not getting invoked when using findOneByIdAndUpdate
            validator: function (name) {
                return (name.firstName && name.lastName);
            }
        }
    },
    pic: {
        type: String,
        trim: true,
        //default: '/user/common/images/profile_pic.png' //TODO100 get this from setting
    },
    dob: {
        type: String,
        trim: true,
        validate: {
            validator: function (dob) {
                return CommonValidator.isValidDob(dob);
            }
        }
    },
    gender: {
        type: String,
        trim: true,
        validate: {
            validator: function (gender) {
                return Validator.isValidGender(gender);
            }
        }    },
    weight: {
        type: Number,
        validate: {
            validator: function (wt) {
                return Validator.isValidWeight(wt);
            }
        }
    },
    height: {
        type: Number,
        validate: {
            validator: function (ht) {
                return Validator.isValidHeight(ht);
            }
        }
    },
    gamingProfile: {
        type: Object
    },
    membershipProfile: {
        type: Schema.Types.Mixed
    }
});

const Location = new Schema({
    //TODO: validation for location fields
    ts: {
        type: Number
    },
    lat: {
        type: Number
    },
    lon: {
        type: Number
    },
    alt: {
        type: Number
    },
    ber: {
        type: Number
    },
    acc: {
        type: Number
    }
});

const Telemetry = new Schema({
    //TODO: validation for telemetry fields
    ts: {
        type: Number
    },
    st: {
        type: String,
        trim: true
    },
    bMd: {
        type: String,
        trim: true
    },
    bCur: {
        type: Number
    },
    bTem: {
        type: Number
    },
    rng: {
        type: Number
    },
    spd: [
        {
            ts: Number,
            val: Number
        }
    ],
});

const State = new Schema({
    state: {
        type: String,
        required: true,
        enum: [
            Constants.ASSETMGMT.APP_PLAYER.USER.STATE.REGISTERING.CODE,
            Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.NEVER_LOGGED_IN.CODE,
            Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_IN.CODE,
            Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_OUT.CODE,
            Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.CODE
        ],
        trim: true
    },
    stateReason: {
        type: String,
        enum: [
            Constants.ASSETMGMT.APP_PLAYER.USER.STATE.REGISTERING.REASON,
            Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.NEVER_LOGGED_IN.REASON,
            Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_IN.REASON,
            Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_OUT.REASON,
            Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.REASON.EXCEEDED_REGISTRATION_OTP_GENERATION_COUNT,
            Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.REASON.EXCEEDED_LOGIN_OTP_GENERATION_COUNT,
            Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.REASON.EXCEEDED_LOGIN_WRONG_PASSWORD_COUNT,
            Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.REASON.EXCEEDED_REGISTRATION_OTP_VALIDATION_COUNT,
            Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.REASON.EXCEEDED_LOGIN_OTP_VALIDATION_COUNT,

        ],
        trim: true
    }
});

module.exports = {
    ObjectIdentifier,
    PersonIdentifier,
    Imei,
    Mac,
    PhoneNumber,
    Imsi,
    Email,
    PersonName,
    ProfileData,
    Location,
    Telemetry,
    OTPToken,
    JWTToken,
    State
};