const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const Constants = require('../../constant/constant');
const Interactions = require('./interaction');


//Feature of asset or tracker
const Feature/*Schema*/ = new Schema({
    code: {
        type: String,
        required: true,
        ////unique: true,  //needed only when feature is added by reference in model
        lowercase: true,
        minlength: Constants.ASSETMGMT.APP_FEATURE.GENERIC.CODE.MIN_LENGTH,
        maxlength: Constants.ASSETMGMT.APP_FEATURE.GENERIC.CODE.MAX_LENGTH,
        trim: true
    },
    name: {
        type: String,
        required: true,
        minlength: Constants.ASSETMGMT.APP_FEATURE.GENERIC.NAME.MIN_LENGTH,
        maxlength: Constants.ASSETMGMT.APP_FEATURE.GENERIC.NAME.MAX_LENGTH,
        trim: true
    },
    description: {
        type: String,
        minlength: Constants.ASSETMGMT.APP_FEATURE.GENERIC.DESCRIPTION.MIN_LENGTH,
        maxlength: Constants.ASSETMGMT.APP_FEATURE.GENERIC.DESCRIPTION.MAX_LENGTH,
        trim: true
    },
    interactions: {
        type: [Interactions.Interaction],
        required: true,
        validate: {
            validator: function (interactions) {
                return interactions.length >= 0;
            },
            message: props => `${props.path} has value : ${props.value}. there should be at least one interaction per feature`
        }
    },
//    //Below fields are needed only when feature is added by reference in model
//    //Not needed when feature is embeddin in model
//    createdBy: {
//        type: Schema.Types.ObjectId,
//        ref: 'adminusers',
//        required: true
//    },
//    updatedBy: {
//        type: Schema.Types.ObjectId,
//        ref: 'adminusers',
//        required: true
//    }
}, { timestamps: true, _id: false });

//// Indexes - Needed when using feature data by reference in asset/tracked model
//FeatureSchema.index({ code: 1 }, { unique: true });
//module.exports = Mongoose.model('feature', FeatureSchema);

//Needed when embeding feature data in the asset/tracker model
module.exports = {
    Feature
};