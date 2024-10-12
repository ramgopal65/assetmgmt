const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const FeatureModel = require('./feature');
const Properties = require('./property');

//const Settings = new Schema({
//    ver: {
//        type: String,
//        validate: {
//            validator: function (ver) {
//                if (!ver) {
//                    return false;
//                }
//            },
//            message: props => `${props.path} has value : ${props.value}. ver is mandatory`
//        }
//    },
//    settings: {
//        type: [Property.Property],
//        validate: {
//            validator: function (settings) {
//                if ((settings.length < CommonConstants.COMMON.APP_MODEL.SETTINGS.MIN_SIZE) || (settings.length > CommonConstants.COMMON.APP_MODEL.SETTINGS.MAX_SIZE)) {
//                    return false;
//                }
//            },
//            message: props => `${props.path} has value : ${props.value}. too few or too many settings`
//        }
//    }
//});

const BaseModel = new Schema({
    props: {
        type: [Properties.Property],
        validate: {
            validator: function (props) {
                if ((props.length < Constants.ASSETMGMT.APP_MODEL.PROPERTIES.MIN_SIZE) || (props.length > Constants.ASSETMGMT.APP_MODEL.PROPERTIES.MAX_SIZE)) {
                    return false;
                }
            },
            message: props => `${props.path} has value : ${props.value}. too few or too many props`
        }
    },
    features: {
        //type: [Schema.Types.String], //For including features by reference in models
        //ref: 'feature',  //For including features by reference in models
        type: [FeatureModel.Feature], //For embedding features in models
        required: true,
        validate: [
            {
                validator: function (features) {
                    return features.length > 0;
                },
                message: props => `${props.path} has value : ${props.value}. there should be at least one supported feature per model`
            },
            {
                validator: function (features) {
                    if ((features.length < Constants.ASSETMGMT.APP_MODEL.FEATURES.MIN_SIZE) || (features.length > Constants.ASSETMGMT.APP_MODEL.FEATURES.MAX_SIZE)) {
                        return false;
                    }
                },
                message: props => `${props.path} has value : ${props.value}. too few or too many features`
            },
            //{
            //    validator: function (features) {
            //        return features.every(checkCodeLength);
            //        function checkCodeLength(code) {
            //            if (!((code.length >= CommonConstants.COMMON.APP_OBJECT.GENERIC.CODE.MIN_LENGTH) && (code.length <= CommonConstants.COMMON.APP_OBJECT.GENERIC.CODE.MAX_LENGTH))) {
            //                return false;
            //            } else {
            //                return true;
            //            }
            //        }
            //    },
            //    message: props => `${props.path} has value : ${props.value}. length of one of the supported feature codes is not within range`
            //},
        //    //Below validator is needed only when feature is added by refereence in model
        //    //Not needed when feature is embeddin in model
        //    {
        //        validator: async function (features) {
        //            return await checkCode(features);
        //            async function checkCode(features) {
        //                let query = {};
        //                let result = {};
        //                for (let i = 0; i < features.length; i++) {
        //                    query.code = features.at(i);
        //                    result = await FeatureModel.findOne(query);
        //                    if (!result) {
        //                        console.log('invalid feature code - ' + query.code);
        //                        return false;
        //                    }
        //                }
        //                return true;
        //            }
        //        },
        //        //TODO - return the invalid code along with the message
        //        message: props => `${props.path} has value : ${props.value}. one of them is an invalid feature code`
        //    }
        ]        
    }
});
module.exports = {
    BaseModel
};
