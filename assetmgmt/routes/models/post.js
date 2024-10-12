var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
const Constants = require('../../constant/constant');
const CommonModelFragments = require('./fragments');

const Game = new Schema({
    path: {
        type: String,
        required: true,
    },
    tnPath: {
        type: String,
        required: true,
    },
    cameraName: {
        type: String
    }
});

const Session = new Schema({
    token: {
        type: CommonModelFragments.JWTToken,
    },
    allowedCameras: {
        type: [String],
    },
});

const Review = new Schema({
    path: {
        type: String,
        required: true
    }
});

var PostSchema = new Schema({
    poster: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: Constants.ASSETMGMT.POST.TYPES.map(type => type.CODE)
    },
    game: {
        type: [Game]
    },
    session: {
        type: Session
    },
    name: {
        type: String
    },
    state: {
        type: String,
        required: true,
        enum: Constants.ASSETMGMT.POST.STATES
    },
    fav: {
        type: Boolean,
        required: true,
        default: false
    },
    reviewIndex: {
        type: Object,
        trim: true
    },
    review: {
        type: Review
    },
    reviewRequestTime: {
        type: Number
    },
    reviewCompleteTime: {
        type: Number
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, { timestamps: true });

Schema.Types.String.checkRequired(v => v != null);

// Indexes
PostSchema.index({ poster: 1, 'game.path': 1 }, {
    unique: true, partialFilterExpression: {
        'game.path': { $exists: true }
    }
});
module.exports = Mongoose.model('post', PostSchema);