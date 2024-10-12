var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
const CommonModelFragments = require('./fragments');
const CommonConstants = require('../../../common/constant/constant');

const TrackerDetails = new Schema({
    lastUpdateTime: {
        type: Number
    },
    swv: {
        type: String,
        trim: true
    },
    pVer: {
        type: Number
    },
    sVer: {
        type: Number
    },
    tz: {
        type: Number
    }
});

const AssetDetails = new Schema({
    lastUpdateTime: {
        type: Number
    },
    fTy: {
        type: String,
        trim: true
    },
    bCap: {
        type: Number
    }
});

const TrackerStatus = new Schema({
    lastUpdateTime: {
        type: Number
    },
    bCur: {
        type: Number
    },
    sig: {
        type: Number
    }
});

const AssetStatus = new Schema({
    lastUpdateTime: {
        type: Number
    },
    tel: {
        type: CommonModelFragments.Telemetry
    },
    loc: {
        type: CommonModelFragments.Location
    }
});

var AssetTrackerSchema = new Schema({
    //TODO: phone number should include country code part also
    assetId: {
        type: CommonModelFragments.ObjectIdentifier,
        required: true,
    },
    assetName: {
        type: String,
        minlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.NAME.MIN_LENGTH,
        maxlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.NAME.MAX_LENGTH,
        trim: true
    },
    assetProfilePic: {
        //TODO: this should be valid file object in file server
        type: CommonModelFragments.ProfilePic
    },
    assetModel: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'assetmodels'
    },
    assetDetails: {
        type: AssetDetails
    },
    assetStatus: {
        type: AssetStatus
    },
    trackerId: {
        type: CommonModelFragments.ObjectIdentifier,
        required: true,
    },
    trackerName: {
        type: String,
        minlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.NAME.MIN_LENGTH,
        maxlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.NAME.MAX_LENGTH,
        trim: true
    },
    trackerImei: {
        type: CommonModelFragments.Imei,
    },
    trackerMac: {
        type: CommonModelFragments.Mac,
    },
    trackerPhoneNumber: {
        type: CommonModelFragments.PhoneNumber,
    },
    trackerImsi: {
        type: CommonModelFragments.Imsi,
    },
    trackerProfilePic: {
        type: CommonModelFragments.ProfilePic
    },
    trackerModel: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'trackermodels'
    },
    trackerDetails: {
        type: TrackerDetails
    },
    trackerStatus: {
        type: TrackerStatus
    },
    trackerFcmId: {
        type: String,
        trim: true
    },
    createdBy: {
        type: String,
        required: true
    },
    updatedBy: {
        type: String,
        required: true
    }
}, { timestamps: true });

Schema.Types.String.checkRequired(v => v != null);

// Indexes
AssetTrackerSchema.index({ 'trackerId.type': 1, 'trackerId.id': 1, 'assetId.type': 1, 'assetId.id': 1 }, { unique: true });

module.exports = Mongoose.model('assettracker', AssetTrackerSchema);