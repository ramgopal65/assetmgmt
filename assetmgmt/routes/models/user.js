var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
const CommonModelFragments = require('./fragments');
const Constants = require('../../constant/constant');

//TODO: to be elaborated
const UserPreference = new Schema({
    AlertType: {
        lowBattery: {
            type: Boolean,
            default: true
        },
        overSpeed: {
            type: Boolean,
            default: true
        },
        theft: {
            type: Boolean,
            default: true
        },
        geofenceEntry: {
            type: Boolean,
            default: true
        },
        geofenceExit: {
            type: Boolean,
            default: true
        },
        sos: {
            type: Boolean,
            default: true
        },
        dataOn: {
            type: Boolean,
            default: true
        },
        dataOff: {
            type: Boolean,
            default: true
        },
        gpsOn: {
            type: Boolean,
            default: true
        },
        gpsOff: {
            type: Boolean,
            default: true
        }
    },
    AlertLevel: {
        critical: {
            type: Boolean,
            default: true
        }, // 1 - yes, 0 - no
        major: {
            type: Boolean,
            default: false
        },
        low: {
            type: Boolean,
            default: false
        }
    },
    AlertNotification: {
        Email: {
            lowBattery: {
                type: Boolean,
                default: true
            },
            overSpeed: {
                type: Boolean,
                default: true
            },
            theft: {
                type: Boolean,
                default: true
            },
            geofenceEntry: {
                type: Boolean,
                default: true
            },
            geofenceExit: {
                type: Boolean,
                default: true
            },
            sos: {
                type: Boolean,
                default: true
            },
            dataOn: {
                type: Boolean,
                default: true
            },
            dataOff: {
                type: Boolean,
                default: true
            },
            gpsOn: {
                type: Boolean,
                default: true
            },
            gpsOff: {
                type: Boolean,
                default: true
            }
        },
        SMS: {
            lowBattery: {
                type: Boolean,
                default: true
            },
            overSpeed: {
                type: Boolean,
                default: true
            },
            theft: {
                type: Boolean,
                default: true
            },
            geofenceEntry: {
                type: Boolean,
                default: true
            },
            geofenceExit: {
                type: Boolean,
                default: true
            },
            sos: {
                type: Boolean,
                default: true
            },
            dataOn: {
                type: Boolean,
                default: true
            },
            dataOff: {
                type: Boolean,
                default: true
            },
            gpsOn: {
                type: Boolean,
                default: true
            },
            gpsOff: {
                type: Boolean,
                default: true
            }        },
        FCM: {
            lowBattery: {
                type: Boolean,
                default: true
            },
            overSpeed: {
                type: Boolean,
                default: true
            },
            theft: {
                type: Boolean,
                default: true
            },
            geofenceEntry: {
                type: Boolean,
                default: true
            },
            geofenceExit: {
                type: Boolean,
                default: true
            },
            sos: {
                type: Boolean,
                default: true
            },
            dataOn: {
                type: Boolean,
                default: true
            },
            dataOff: {
                type: Boolean,
                default: true
            },
            gpsOn: {
                type: Boolean,
                default: true
            },
            gpsOff: {
                type: Boolean,
                default: true
            }
        },
        WEB_UI: {
            lowBattery: {
                type: Boolean,
                default: true
            },
            overSpeed: {
                type: Boolean,
                default: true
            },
            theft: {
                type: Boolean,
                default: true
            },
            geofenceEntry: {
                type: Boolean,
                default: true
            },
            geofenceExit: {
                type: Boolean,
                default: true
            },
            sos: {
                type: Boolean,
                default: true
            },
            dataOn: {
                type: Boolean,
                default: true
            },
            dataOff: {
                type: Boolean,
                default: true
            },
            gpsOn: {
                type: Boolean,
                default: true
            },
            gpsOff: {
                type: Boolean,
                default: true
            }
        }
    },
});

const ActivityDetails = new Schema({
    remainingAttempts: {
        type: Number
    },
    lastFailedLoginTs: {
        type: Number
    },
    lastSuccessfulLoginTs: {
        type: Number
    }
});

const RoleAssociation = new Schema({
    type: {
        type: String,
        required: true,
        enum: Constants.ASSETMGMT.APP_USER_ROLE_ASSOCIATION
    },
    associateRole: {
        type: String,
        enum: Constants.ASSETMGMT.APP_PLAYER.USER.ROLE.filter(el =>
            ((el.ROLE_ASSOCIATION_TYPE === Constants.ASSETMGMT.APP_USER_ROLE_ASSOCIATION.ONE) ||
            (el.ROLE_ASSOCIATION_TYPE === Constants.ASSETMGMT.APP_USER_ROLE_ASSOCIATION.MANY))).map(role => role.CODE)
    },
    associates: {
        type: [Schema.Types.ObjectId],
        ref: 'user',
    },
});

var UserSchema = new Schema({
    identifier: {
        type: CommonModelFragments.PersonIdentifier,
        required: true
    },
    phone: {
        type: CommonModelFragments.PhoneNumber,
    },
    email: {
        type: CommonModelFragments.Email
    },
    state: {
        type: CommonModelFragments.State,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: Constants.ASSETMGMT.APP_PLAYER.USER.ROLE.map(role => role.CODE)
    },
    roleAssociation: {
        type: RoleAssociation,
        required: true
    },
    hierarchyCode: {
        type: String,
        required: true
    },
    token: {
        type: CommonModelFragments.JWTToken,
    },
    profileData: {
        type: CommonModelFragments.ProfileData
    },
    password: {
        type: String
    },
    otpToken: {
        type: CommonModelFragments.OTPToken
    },
    activityDetails: {
        type: ActivityDetails
    },
    preferences: {
        type: UserPreference
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        //required: true    //TODO - How to handle making this mandatory
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        //required: true    //TODO - How to handle making this mandatory
    }
}, { timestamps: true});

Schema.Types.String.checkRequired(v => v != null);

// Indexes
UserSchema.index({ 'identifier.type': 1, 'identifier.id': 1 }, { unique: true });
UserSchema.index(
    {
        'email.email': 1
    },
    {
        unique: true,
        partialFilterExpression: {
            'email.email': {
                $type: 'string'
            }
        }
    }
);
UserSchema.index(
    {
        'phone.cc': 1,
        'phone.number': 1
    },
    {
        unique: true,
        partialFilterExpression: {
            'phone.cc': {
                $type: 'string'
            },
            'phone.number': {
                $type: 'string'
            }
        }
    }
);
module.exports = Mongoose.model('user', UserSchema);