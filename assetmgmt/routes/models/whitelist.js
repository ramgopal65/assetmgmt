const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CommonModelFragments = require('./fragments');

const WhitelistSchema = new Schema({
    playerIdentifier: {
        type: CommonModelFragments.PersonIdentifier,
        required: true
    },
    coachIdentifier: {
        type: CommonModelFragments.PersonIdentifier,
        required: true
    },
    hierarchyCode: {
        type: String,
        required: true
    }
}, { timestamps: true });

WhitelistSchema.index({ 'playerIdentifier.type': 1, 'playerIdentifier.id': 1 }, { unique: true });
WhitelistSchema.index({ 'coachIdentifier.type': 1, 'coachIdentifier.id': 1 }, { unique: false });

module.exports = mongoose.model('Whitelist', WhitelistSchema);
