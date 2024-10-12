module.exports = {
    createOne: createOne,
    getOneById: getOneById,
    getAll: getAll,
    getAllCount: getAllCount,
    search: search,
    searchCount: searchCount,
    usageReport: usageReport,
    usageCount: usageCount,
    updateOneById: updateOneById,
    deleteOneById: deleteOneById,
};

const Mongoose = require('mongoose');

const ConvertToDotNotation = require('dot-object');
const To = require('../../../common/to/to');
const CommonValidator = require('../../../common/validate/validator');
const ResolveData = require('../../../common/response/resolve-data');
const RejectData = require('../../../common/response/reject-data');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const PostModel = require('../models/post');

function handleMongooseError(e, message) {
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.UNKNOWN.CODE,
        message,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        e);

    if (e instanceof Mongoose.mongo.MongoError) {
        if (e.code == CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_PROVIDED_KEY_ALREADY_IN_USE.MONGO_CODE) {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_PROVIDED_KEY_ALREADY_IN_USE);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
        } else if ((e.code == CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_CURSOR_NOT_FOUND.MONGO_CODE) || (e != null && JSON.stringify(e).includes('Cursor not found'))) {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_CURSOR_NOT_FOUND);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
        } else if (e.name == 'CastError') {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_MONGO_CAST);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
        } else {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
            rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_UNKNOWN_MONGO);
            rejectObject.appendMessage(e.message);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN);
            rejectObject.setDetails(e);
        }
    } else if (e instanceof Mongoose.Error.ValidationError) {
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
        rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_VALIDATION);
        rejectObject.appendMessage(e.message);
        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
    } else if (e.name == 'CastError') {
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
        rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_CAST);
        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
    } else {
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
        rejectObject.appendMessage(CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_UNKNOWN);
        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN);
    }
    return rejectObject.jsonObject();
}

/**
 * Create one user
 * @param {*} post 
 */
async function createOne(post) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.POST.CREATE_ONE.SUCCESS,
            null
        );

        // Create
        [error, result] = await To(PostModel(post).save());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.POST.CREATE_ONE.ERROR));
        }
        if (CommonValidator.isNonEmptyObject(result) && CommonValidator.isValidMongoObjectId(result._id)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.POST.CREATE_ONE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.POST.CREATE_ONE.ERROR));
    }
}

/**
 * Get one user by id
 * @param {*} postId string
* @param {*} flags json
 */
async function getOneById(postId, flags) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.POST.GET_ONE_BY_ID.SUCCESS,
            null
        );

        // Get
        [error, result] = await To(PostModel.findById(postId).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR));
        }

        // Response
        if (result && (postId == result._id)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR));
    }
}

/**
 * Get all settings
 * @param {*} params 
 * @param {*} query 
 */
async function getAll(params, query) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.POST.GET_ALL.SUCCESS,
            null
        );

        // Get all
        [error, result] = await To(PostModel.find().sort(params.sort).select(params.select).skip(query.skip).limit(query.limit).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.POST.GET_ALL.ERROR));
        }
        // Response
        if (result) {
            if (!CommonValidator.isNonEmptyArray(result)) {
                resolveObject.appendMessage(Constants.ASSETMGMT.POST.GET_ALL.SUCCESS_NO_DATA);
            }
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.POST.GET_ALL.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }

    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.POST.GET_ALL.ERROR));
    }
}

//TODO: fetch count and items parallely
/**
 * Get all settings count
 */
async function getAllCount() {
    try {
        // Initialize
        let error, count;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.POST.GET_ALL.SUCCESS,
            null
        );

        // Get all
        [error, count] = await To(PostModel.estimatedDocumentCount().exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.POST.GET_ALL_COUNT.ERROR));
        }
        // Response
        //count = 0 is success; build it to avoid failures for truth checks
        if ((count != null) && (count >= 0)) {
            resolveObject.setData({ count: count });
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.POST.GET_ALL_COUNT.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.POST.GET_ALL_COUNT.ERROR));
    }
}


/**
 * Search
 * @param {*} searchData 
 */
async function search(searchData) {
    // Initialize
    let dbQuery = {};
    let error, result;
    let sort, select;
    let skip, limit;
    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.POST.SEARCH.SUCCESS,
        null
    );

    try {
        //#region setdbquery 
        //TODO: make these regex based match
        if (searchData.condition._id) {
            dbQuery._id = searchData.condition._id;
        }
        if (searchData.condition.posters) {
            dbQuery.poster = { $in: searchData.condition.posters };
        }
        if (searchData.condition.type) {
            dbQuery.type = searchData.condition.type;
        }
        if (searchData.condition.state) {
            dbQuery.state = searchData.condition.state;
        }
        if (searchData.condition.fav) {
            dbQuery.fav = searchData.condition.fav;
        }
        if (searchData.condition.createdAt && searchData.condition.createdAt.start && searchData.condition.createdAt.end) {
            let startDate = new Date(searchData.condition.createdAt.start);
            let endDate = new Date(searchData.condition.createdAt.end);
            dbQuery.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }
        if (searchData.condition.reviewRequestTime && searchData.condition.reviewRequestTime.start && searchData.condition.reviewRequestTime.end) {
            dbQuery.reviewRequestTime = {
                $gte: searchData.condition.reviewRequestTime.start,
                $lte: searchData.condition.reviewRequestTime.end
            };
        }
        if (searchData.condition.reviewCompleteTime && searchData.condition.reviewCompleteTime.start && searchData.condition.reviewCompleteTime.end) {
            dbQuery.reviewCompleteTime = {
                $gte: searchData.condition.reviewCompleteTime.start,
                $lte: searchData.condition.reviewCompleteTime.end
            };
        }
        //#endregion setdbquery

        sort = searchData.sort;
        select = searchData.select;
        skip = searchData.skip;
        limit = searchData.limit;

        // Search
        [error, result] = await To(PostModel.find(dbQuery).select(select).sort(sort).skip(skip).limit(limit).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.POST.SEARCH.ERROR));
        }

        // Result
        if (result) {
            if (!CommonValidator.isNonEmptyArray(result)) {
                resolveObject.appendMessage(Constants.ASSETMGMT.POST.SEARCH.SUCCESS_NO_DATA);
            }
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.POST.SEARCH.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.POST.SEARCH.ERROR));
    }
}
/**
 * Search count
 * @param {*} searchData 
 */
async function searchCount(searchData) {
    // Initialize
    let dbQuery = {};
    let error, count;
    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.POST.SEARCH_COUNT.SUCCESS,
        null
    );

    try {
        //#region setdbquery 
        //TODO: make these regex based match
        if (searchData.condition._id) {
            dbQuery._id = searchData.condition._id;
        }
        if (searchData.condition.posters) {
            dbQuery.poster = { $in: searchData.condition.posters };
        }
        if (searchData.condition.type) {
            dbQuery.type = searchData.condition.type;
        }
        if (searchData.condition.state) {
            dbQuery.state = searchData.condition.state;
        }
        if (searchData.condition.fav) {
            dbQuery.fav = searchData.condition.fav;
        }
        if (searchData.condition.createdAt && searchData.condition.createdAt.start && searchData.condition.createdAt.end) {
            let startDate = new Date(searchData.condition.createdAt.start);
            let endDate = new Date(searchData.condition.createdAt.end);
            dbQuery.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }
        if (searchData.condition.reviewRequestTime && searchData.condition.reviewRequestTime.start && searchData.condition.reviewRequestTime.end) {
            dbQuery.reviewRequestTime = {
                $gte: searchData.condition.reviewRequestTime.start,
                $lte: searchData.condition.reviewRequestTime.end
            };
        }
        if (searchData.condition.reviewCompleteTime && searchData.condition.reviewCompleteTime.start && searchData.condition.reviewCompleteTime.end) {
            dbQuery.reviewCompleteTime = {
                $gte: searchData.condition.reviewCompleteTime.start,
                $lte: searchData.condition.reviewCompleteTime.end
            };
        }
        //#endregion setdbquery

        // Search count
        [error, count] = await To(PostModel.find(dbQuery).countDocuments().exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.POST.SEARCH_COUNT.ERROR));
        }
        if ((count != null) && (count >= 0)) {
            resolveObject.setData({ count: count });
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.POST.SEARCH_COUNT.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
        // Result

    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.POST.SEARCH_COUNT.ERROR));
    }
}


/**
 * Search
 * @param {*} searchData 
 */
async function usageReport(searchData) {
    // Initialize
    let dbQuery = {};
    let error, result;
    let sort, select;
    let skip, limit;
    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.POST.USAGE_REPORT.SUCCESS,
        null
    );

    try {
        //#region setdbquery 
        //TODO: make these regex based match
        if (searchData.condition._id) {
            dbQuery._id = searchData.condition._id;
        }
        if (searchData.condition.posters) {
            dbQuery.poster = { $in: searchData.condition.posters };
        }
        if (searchData.condition.type) {
            dbQuery.type = searchData.condition.type;
        }
        if (searchData.condition.state) {
            dbQuery.state = searchData.condition.state;
        }
        if (searchData.condition.fav) {
            dbQuery.fav = searchData.condition.fav;
        }
        //#endregion setdbquery

        dbQuery.state = { '$in': ['review_requested', 'reviewed'] };

        sort = searchData.sort;
        select = searchData.select;
        skip = searchData.skip;
        limit = searchData.limit;

        // Search
        [error, result] = await To(PostModel.aggregate([{ $match: dbQuery },
            { $project: { 'createdAt': 1, 'state': 1, 'reviewRequestTime': 1, 'reviewCompleteTime': 1 } }])
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec());

        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.POST.SEARCH.ERROR));
        }

        // Result
        if (result) {
            if (!CommonValidator.isNonEmptyArray(result)) {
                resolveObject.appendMessage(Constants.ASSETMGMT.POST.SEARCH.SUCCESS_NO_DATA);
            }
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.POST.SEARCH.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.POST.SEARCH.ERROR));
    }
}

/**
 * Search
 * @param {*} searchData 
 */
async function usageCount(searchData) {
    // Initialize
    let dbQuery = {};
    let error, result;
    let sort, select;
    let skip, limit;
    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.POST.USAGE_COUNT.SUCCESS,
        null
    );

    try {
        //#region setdbquery 
        //TODO: make these regex based match
        if (searchData.condition._id) {
            dbQuery._id = searchData.condition._id;
        }
        if (searchData.condition.posters) {
            dbQuery.poster = { $in: searchData.condition.posters };
        }
        if (searchData.condition.type) {
            dbQuery.type = searchData.condition.type;
        }
        if (searchData.condition.state) {
            dbQuery.state = searchData.condition.state;
        }
        if (searchData.condition.fav) {
            dbQuery.fav = searchData.condition.fav;
        }
        //#endregion setdbquery

        dbQuery.state = { '$in': ['review_requested', 'reviewed'] };

        // Search
        [error, result] = await To(PostModel.aggregate([{ $match: dbQuery }, { $group: { _id: '$state', count: { $sum: 1 } } }]).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.POST.SEARCH.ERROR));
        }

        // Result
        if (result) {
            if (!CommonValidator.isNonEmptyArray(result)) {
                resolveObject.appendMessage(Constants.ASSETMGMT.POST.SEARCH.SUCCESS_NO_DATA);
            }
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.POST.USAGE_COUNT.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.POST.SEARCH.ERROR));
    }
}


/**
* Update one user by id
* @param {*} userId string
* @param {*} user json object 
* @param {*} flags json
*/
async function updateOneById(postId, post, gameAdd, gameRemove, cameraAdd, cameraRemove, flags) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.POST.UPDATE_ONE_BY_ID.SUCCESS,
            null
        );

        // Assign
        let updateObj = {};
        if (post) {
            updateObj.$set = post;
        }
        if (gameAdd) {
            updateObj.$push = { game: gameAdd };
        }
        if (gameRemove) {
            updateObj.$pull = { game: gameRemove };
        }
        if (cameraAdd) {
            updateObj.$push = { 'session.allowedCameras': cameraAdd };
        }
        if (cameraRemove) {
            updateObj.$pull = { 'session.allowedCameras': cameraRemove };
        }

        //updateObj = ConvertToDotNotation.dot(post);
        //console.log(updateObj);
        // Update
        [error, result] = await To(PostModel.findByIdAndUpdate(postId, updateObj, { new: true, runValidators: true }).exec());
        // Response
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.POST.UPDATE_ONE_BY_ID.ERROR));
        }
        if (result && (JSON.stringify(result._id) == JSON.stringify(postId))) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.POST.UPDATE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.POST.UPDATE_ONE_BY_ID.ERROR));
    }
}

/**
* Delete one user by id
* @param {*} userId 
*/
async function deleteOneById(userId) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.POST.DELETE_ONE_BY_ID.SUCCESS,
            null
        );

        // Delete
        [error, result] = await To(PostModel.findByIdAndRemove(userId).exec());

        // Response
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.POST.DELETE_ONE_BY_ID.ERROR));
        }

        if (result && (result._id.equals(userId))) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.POST.DELETE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.POST.DELETE_ONE_BY_ID.ERROR));
    }
}