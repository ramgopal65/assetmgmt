var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;
const Constants = require('../../../constant/constant');



Constants.ASSETMGMT.APP_JWT.AUDIENCE.USERS = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE.map(role => role.CODE);

const CustomConstantsBadminton = {
    AREAS_OF_IMPROVEMENMT: [
        'Match Strategy',
        'Stroke Technique',
        'Footwork',
        'Others'
    ],
    EXPERIENCE_LEVELS: [
        'Beginner',
        'Intermediate',
        'Experienced'
    ]
};

const BadmintonGamingProfile= new Schema({
    exp: {
        type: String,
        enum: CustomConstantsBadminton.EXPERIENCE_LEVELS,
        trim: true
    },
    goal: {
        type: String,
        maxlength: 256,
        trim: true
    },
    injurySummary: {
        type: String,
        maxlength: 256,
        trim: true
    },
    coachName: {
        type: String,
        maxlength: 32,
        trim: true
    },
    areasOfImprovement: {
        type: [String],
        trim: true,
        validate: {
            validator: function (areasOfImprovement) {
                if (!Array.isArray(areasOfImprovement)) {
                    return false;
                } else {
                    let bRet = true;
                    areasOfImprovement.forEach((areaOfImprovement) => {
                        if (!(CustomConstantsBadminton.AREAS_OF_IMPROVEMENMT.indexOf(areaOfImprovement) > -1)) {
                            bRet = false;
                        }
                    });
                    return bRet;
                }
            }
        }
    },
    areasOfImprovementOthers: {
        type: String,
        maxlength: 32,
        trim: true,
    }
});

const BadmintonMembershipProfile = new Schema({
    remainingReviews: {
        type: Number,
        min: 0,
        max: 12,
        default: 12
    },
    reviewRequestedAt: {
        type: [Number]
    }
});
