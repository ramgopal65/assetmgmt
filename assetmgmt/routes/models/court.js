var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
const Constants = require('../../constant/constant');

const Camera = new Schema({
    name: {
        type: String,
        required: true,
        minlength: Constants.ASSETMGMT.APP_FEATURE.GENERIC.NAME.MIN_LENGTH,
        maxlength: Constants.ASSETMGMT.APP_FEATURE.GENERIC.NAME.MAX_LENGTH,
        trim: true
    },
    id: {
        type: String,
        minlength: Constants.ASSETMGMT.APP_FEATURE.GENERIC.CODE.MIN_LENGTH,
        maxlength: Constants.ASSETMGMT.APP_FEATURE.GENERIC.CODE.MAX_LENGTH,
        trim: true
    }
});

const Court = new Schema({
    name: {
        type: String,
        required: true,
        minlength: Constants.ASSETMGMT.APP_FEATURE.GENERIC.NAME.MIN_LENGTH,
        maxlength: Constants.ASSETMGMT.APP_FEATURE.GENERIC.NAME.MAX_LENGTH,
        trim: true
    },
    cameras: {
        type: [Camera]
    }
});


var AcademySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: Constants.ASSETMGMT.APP_FEATURE.GENERIC.NAME.MIN_LENGTH,
        maxlength: Constants.ASSETMGMT.APP_FEATURE.GENERIC.NAME.MAX_LENGTH,
        trim: true
    },
    courts: {
        type: [Court]
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }

}, { timestamps: true });
AcademySchema.index({ 'name': 1, 'courts.name': 1, 'courts.cameras.name': 1 }, { unique: true });
module.exports = Mongoose.model('court', AcademySchema);