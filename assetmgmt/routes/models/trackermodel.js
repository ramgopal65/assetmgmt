const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const CommonConstants = require('../../../common/constant/constant');
const CommonModel = require('./commonmodel');

const TrackerModelSchema = new Schema({
    ...CommonModel.BaseModel.obj,
    name: {
        type: String,
        required: true,
        unique: [true, 'tracker model already exists with this name'],
        minlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.NAME.MIN_LENGTH,
        maxlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.NAME.MAX_LENGTH,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: [true, 'tracker model already exists with this code'],
        lowercase: true,
        minlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.CODE.MIN_LENGTH,
        maxlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.CODE.MAX_LENGTH,
        trim: true
    },
    description: {
        type: String,
        minlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.DESCRIPTION.MIN_LENGTH,
        maxlength: CommonConstants.COMMON.APP_OBJECT.GENERIC.DESCRIPTION.MAX_LENGTH,
        trim: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'adminusers',
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'adminusers',
        required: true
    }
}, { timestamps: true });

// Indexes
TrackerModelSchema.index({ code: 1 }, { unique: true });
module.exports = Mongoose.model('trackermodel', TrackerModelSchema);