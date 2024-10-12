const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const CommonConstants = require('../../../common/constant/constant');

const UserTokenBlacklistSchema = new Schema({
    token: {
        type: String,
        trim: true
    },
    expiry: {
        type: Date
    }
});

// Indexes
UserTokenBlacklistSchema.index({ token: 1 }, { unique: true });
UserTokenBlacklistSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });
module.exports = Mongoose.model('usertokenblacklist', UserTokenBlacklistSchema);