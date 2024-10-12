var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
const CommonConstants = require('../../../common/constant/constant');

var SettingsSchema = new Schema({
    applicationCode: { //TODO: valus here to be limited to the codes populated in application collection
        //type: { type: Schema.Types.ObjectId, ref: 'applications' },
        type: String,
        required: true,
        trim: true
    },
    applicationName: {
        type: String,
        required: true,
        trim: true
    },
    categoryCode: { //TODO: to limit to possible categories
        //TODO: Unique for applicationCode.categoryCode.property
        type: String,
        required: true,
        trim: true
    },
    categoryName: { //TODO: to limit to possible categories
        type: String,
        required: true,
        trim: true
    },
    property: {
        type: String,
        required: true,
        minlength: CommonConstants.COMMON.APP_OBJECT.SETTINGS.PROPERTY.MIN_LENGTH,
        maxlength: CommonConstants.COMMON.APP_OBJECT.SETTINGS.PROPERTY.MAX_LENGTH,
        trim: true
    },
    value: {
        type: String,
        required: true,
        minlength: CommonConstants.COMMON.APP_OBJECT.SETTINGS.VALUE.MIN_LENGTH,
        maxlength: CommonConstants.COMMON.APP_OBJECT.SETTINGS.VALUE.MAX_LENGTH,
        trim: true
    },
    valueType: {
        type: String,
        required: true,
        enum: Object.values(CommonConstants.COMMON.APP_OBJECT.SETTINGS.VALUE_TYPE),
        trim: true
    },
    isEditable: {
        type: Boolean,
        default: true
    },
    description: {
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
SettingsSchema.index({ applicationCode: 1, categoryCode: 1, property: 1 }, { unique: true });

module.exports = Mongoose.model('setting', SettingsSchema);