const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const Properties = require('./property');

//Interaction supported
//eg. For location feature there are 2 interactions:
//1. server sending the settings to asset/tracker
//2. asset/tracker sending its location(per the settings params)
const Interaction = new Schema({
    code: {
        type: String,
        required: true,
        trim: true
    },
    supportedPayloadVersions: {
        type: [Number],
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    condition: {
        type: String,
        required: true,
        trim: true
    },
    origin: {
        type: String,
        required: true,
        enum: [
            Constants.ASSETMGMT.APP_PLAYER.SERVER.CODE,
            Constants.ASSETMGMT.APP_PLAYER.ASSET.CODE,
            Constants.ASSETMGMT.APP_PLAYER.TRACKER.CODE,
            Constants.ASSETMGMT.APP_PLAYER.ASSET_OR_TRACKER.CODE
        ],
        trim: true
    },
    destination: {
        type: String,
        required: true,
        enum: [
            Constants.ASSETMGMT.APP_PLAYER.SERVER.CODE,
            Constants.ASSETMGMT.APP_PLAYER.ASSET.CODE,
            Constants.ASSETMGMT.APP_PLAYER.TRACKER.CODE,
            Constants.ASSETMGMT.APP_PLAYER.ASSET_OR_TRACKER.CODE
        ],
        trim: true
    },
    data: {
        type: [Properties.Property],
        required: true,
        validate: {
            validator: function (data) {
                return data.length > 0;
            },
            message: props => `${props.path} has value : ${props.value}. there should be at least one data per interaction`
        }
    }
});

module.exports = {
    Interaction
};