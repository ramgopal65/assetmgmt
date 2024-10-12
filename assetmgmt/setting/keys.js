const CommonConstants = require('../../common/constant/constant');


module.exports = {
    ASSETMGMT: {
        CODE: 'assetmgmt',
        NAME: 'AssetMgmt',
        DATABASE: {
            CONNECT: {
                URL_READ_ONLY: 'assetmgmt.database.connect.url.read_only',
                URL_READ_WRITE: 'assetmgmt.database.connect.url.read_write'
            }
        },
        POST: {
            CODE: 'post',
            NAME: 'Post',
            GAME_CLIP: {
                CODE: 'game_clip',
                NAME: 'Game_Clip',
                MIN_NUM_FILES: {
                    CODE: 'min_mun_files',
                    NAME: 'Minimum_Number_Of_Files',
                }
            },
            REVIEW_CREDIT_COUNT: 'assetmgmt.post.review.credit_count',
            REVIEW_LIMIT_WINDOW_DURATION: 'assetmgmt.post.review.limit.window_duration_sec',
            REVIEW_LIMIT_COUNT: 'assetmgmt.post.review.limit.count',
            LENGTH: 'common.otp.length',
            TYPE: 'common.otp.type',
            RETRY_COUNT: 'common.otp.retry_count',
            EXPIRY_DURATION_SECONDS: 'common.otp.expiry_duration_sec',
            REGISTRATION: {
                LENGTH: 'common.otp.registration.length',
                TYPE: 'common.otp.registration.type',
                RETRY_COUNT: 'common.otp.registration.retry_count',
                EXPIRY_DURATION_SECONDS: 'common.otp.registration.expiry_duration_sec'
            },
        }
    }
};