const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const CommonConstants = require('../../../common/constant/constant');

let ApplicationSchema = new Schema({
    code: {
        type: String,
        required: true,
        enum: [
            CommonConstants.COMMON.APP_MICRO_SERVICES.BOOTSTRAP.CODE,
            CommonConstants.COMMON.APP_MICRO_SERVICES.ASSETMGMT.CODE,
            CommonConstants.COMMON.APP_MICRO_SERVICES.AUDIT.CODE,
            CommonConstants.COMMON.APP_MICRO_SERVICES.EVENT.CODE,
            CommonConstants.COMMON.APP_MICRO_SERVICES.ALERT.CODE,
            CommonConstants.COMMON.APP_MICRO_SERVICES.NOTIFICATION.CODE,
            CommonConstants.COMMON.APP_MICRO_SERVICES.FILE.CODE,
            CommonConstants.COMMON.APP_MICRO_SERVICES.TESTIMONIAL.CODE,
        ],
        trim: true
    },
    name: {
        type: String,
        required: true,
        enum: [
            CommonConstants.COMMON.APP_MICRO_SERVICES.BOOTSTRAP.NAME,
            CommonConstants.COMMON.APP_MICRO_SERVICES.ASSETMGMT.NAME,
            CommonConstants.COMMON.APP_MICRO_SERVICES.AUDIT.NAME,
            CommonConstants.COMMON.APP_MICRO_SERVICES.EVENT.NAME,
            CommonConstants.COMMON.APP_MICRO_SERVICES.ALERT.NAME,
            CommonConstants.COMMON.APP_MICRO_SERVICES.NOTIFICATION.NAME,
            CommonConstants.COMMON.APP_MICRO_SERVICES.FILE.NAME,
            CommonConstants.COMMON.APP_MICRO_SERVICES.TESTIMONIAL.NAME,
        ],
        trim: true
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

module.exports = Mongoose.model('application', ApplicationSchema);