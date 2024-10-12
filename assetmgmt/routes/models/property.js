const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');

//One element of data
const Property = new Schema({
    propName: {
        type: String,
        required: true,
        trim: true
        //TODO - can we identify mandatory fields, value limits for properties?
    },
    propValueType: {
        type: String,
        required: true,
        trim: true,
        validate: [
            {
                validator: function (valueType) {
                    if (valueType == Constants.ASSETMGMT.APP_INTERACTION_SUPPORTED_DATA_TYPES.LISTOFJSON) {
                        if (this.propJsonObjectType) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return true;
                    }
                },
                message: props => `${props.path} has value : ${props.value}. 8there should be propJsonObjectType`
            },
            {
                validator: function (valueType) {
                    if (valueType != Constants.ASSETMGMT.APP_INTERACTION_SUPPORTED_DATA_TYPES.LISTOFJSON) {
                        if (this.propJsonObjectType) {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                },
                message: props => `${props.path} has value : ${props.value}. there should not be propJsonObjectType`
            },
        ],
    },// string/int/float/boolean/list_of_previous/json/list_of_json
    propJsonObjectType: {
        type: JSON,
        trim: true
        //mandatory if propValueType is list of jsons; for others this field must not be available
    },
    propDescription: {
        type: String,
        trim: true
    }
}, { timestamps: false });

module.exports = {
    Property
};