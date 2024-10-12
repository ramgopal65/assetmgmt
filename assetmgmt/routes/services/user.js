module.exports = {
    startTransactionSession: startTransactionSession,
    commitTransaction: commitTransaction,
    abortTransaction: abortTransaction,
    createOne: createOne,
    createSuperadmin: createSuperadmin,
    createSingleton: createSingleton,
    getOneById: getOneById,
    getOneByIdentifier: getOneByIdentifier,
    search: search,
    searchCount: searchCount,
    updateOneById: updateOneById,
    addOneAssociateOfOneUserById: addOneAssociateOfOneUserById,
    deleteOneAssociateOfOneUserById: deleteOneAssociateOfOneUserById,
    deleteOneById: deleteOneById,
    deleteMultipleById: deleteMultipleById,
    updateProfilePic: updateProfilePic
};

const Mongoose = require('mongoose');

const ConvertToDotNotation = require('dot-object');
const To = require('../../../common/to/to');
const CommonValidator = require('../../../common/validate/validator');
const ResolveData = require('../../../common/response/resolve-data');
const RejectData = require('../../../common/response/reject-data');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const UserModel = require('../models/user');
const Config = require('../../config/config');

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
 * start trascaction session
 */
async function startTransactionSession() {
    let session = await Config.DB.DB.startSession();
    await session.startTransaction();
    return session;
}

/**
 * commit trascaction
 */
async function commitTransaction(transactionSession) {
    await transactionSession.commitTransaction();
    await transactionSession.endSession();
}

/**
 * abort trascaction
 */
async function abortTransaction(transactionSession) {
    await transactionSession.abortTransaction();
    await transactionSession.endSession();
}


/**
 * Create one user
 * @param {*} user 
 */
async function createOne( user, session) {

    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.USER.CREATE_ONE.SUCCESS,
            null
        );

        // Create
        if (session) {
            [error, result] = await To(UserModel(user).save({session}));
        } else {
            [error, result] = await To(UserModel(user).save());
        }
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.CREATE_ONE.ERROR));
        }
        if (CommonValidator.isNonEmptyObject(result) && CommonValidator.isValidMongoObjectId(result._id)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.CREATE_ONE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.USER.CREATE_ONE.ERROR));
    }
}

/**
* createSuperadmin
*updateSchema - for initial provisioning, set schema to 'free' mode
(remove reference to createdBy, updatedBy)
*and create default superadmin
*then add back reference to createdBy, updatedBy
*/
async function createSuperadmin(user) {
    let error, result, modifiedSchema, originalSchema, superadmin;
    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.USER.CREATE_SUPER_ADMIN.SUCCESS,
        null
    );

    try {
        modifiedSchema = await UserModel.schema.remove(['createdBy', 'updatedBy']);

        [error, result] = await To(UserModel(user).save());
        if (CommonValidator.isNonEmptyObject(result) && CommonValidator.isValidMongoObjectId(result._id)) {
            resolveObject.setData(result);

            originalSchema = await UserModel.schema.add({
                createdBy: {
                    type: Mongoose.Schema.Types.ObjectId,
                    ref: 'user',
                    //required: true    //TODO - How to handle making this mandatory
                },
                updatedBy: {
                    type: Mongoose.Schema.Types.ObjectId,
                    ref: 'user',
                    //required: true    //TODO - How to handle making this mandatory
                },
            });

            let updateObj = {};
            updateObj.createdBy = result._id;
            updateObj.updatedBy = result._id;
            [error, result] = await To(UserModel.findByIdAndUpdate(result._id, updateObj, { new: true, runValidators: true }).exec());

            return Promise.resolve(resolveObject.jsonObject());
        } else {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.CREATE_SUPER_ADMIN.ERROR));
        }

    } catch (e) {
        return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.CREATE_SUPER_ADMIN.ERROR));
    }
}

async function createSingleton(user) {
    let error, result;
    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.USER.CREATE_SINGLETON_ROLE.SUCCESS,
        null
    );

    try {
        [error, result] = await To(UserModel(user).save());
        if (CommonValidator.isNonEmptyObject(result) && CommonValidator.isValidMongoObjectId(result._id)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.CREATE_SINGLETON_ROLE.ERROR));
        }

    } catch (e) {
        return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.CREATE_SINGLETON_ROLE.ERROR));
    }
}

/**
 * Get user - by provided   .role
 * @param {*} user json
* @param {*} flags json
 */
async function getByRole(role, flags) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.USER.GET_ONE_BY_ROLE.SUCCESS,
            null
        );

        // Get
        [error, result] = await To(UserModel.findOne({ 'role': role}).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.GET_ONE_BY_ROLE.ERROR));
        }

        // Response
        if (result) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.GET_ONE_BY_ROLE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.USER.GET_ONE_BY_ROLE.ERROR));
    }
}


/**
 * Get one user - by provided user.identifier
 * @param {*} user json
* @param {*} flags json
 */
async function getOneByIdentifier(user, flags) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.USER.GET_ONE_BY_IDENTIFIER.SUCCESS,
            null
        );

        // Get
        [error, result] = await To(UserModel.findOne({ 'identifier.type': user.identifier.type, 'identifier.id': user.identifier.id }).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.GET_ONE_BY_IDENTIFIER.ERROR));
        }

        // Response
        if (result) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.GET_ONE_BY_IDENTIFIER.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.USER.GET_ONE.ERROR));
    }
}

/**
 * Get one user by id
 * @param {*} userId string
* @param {*} flags json
 */
async function getOneById(userId, flags) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.USER.GET_ONE_BY_ID.SUCCESS,
            null
        );

        // Get
        [error, result] = await To(UserModel.findById(userId).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.GET_ONE_BY_ID.ERROR));
        }

        // Response
        if (result && (userId == result._id)) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.GET_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.USER.GET_ONE_BY_ID.ERROR));
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
        Constants.ASSETMGMT.USER.SEARCH.SUCCESS,
        null
    );

    try {
        //#region setdbquery 
        //TODO: make these regex based match
        if (searchData.condition._id) {
            dbQuery._id = searchData.condition._id;
        }
        if (Array.isArray(searchData.condition.roles)) {
            dbQuery.role = { $in: searchData.condition.roles };
        } else if (searchData.condition.role) {
            dbQuery.role = searchData.condition.role;
        }
        if (searchData.condition.name) {
            dbQuery.name = searchData.condition.name;
        }
        if (searchData.condition.phone) {
            dbQuery.phone = searchData.condition.phone;
        }
        if (searchData.condition.email) {
            dbQuery.email = searchData.condition.email;
        }
        //#endregion setdbquery

        sort = searchData.sort;
        select = searchData.select;
        skip = searchData.skip;
        limit = searchData.limit;

        // Search
        [error, result] = await To(UserModel.find(dbQuery).select(select).sort(sort).skip(skip).limit(limit).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.BOOTSTRAP.SETTINGS.SEARCH.ERROR));
        }

        // Result
        if (result) {
            if (!CommonValidator.isNonEmptyArray(result)) {
                resolveObject.appendMessage(Constants.ASSETMGMT.USER.SEARCH.SUCCESS_NO_DATA);
            }
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.SEARCH.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.USER.SEARCH.ERROR));
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
        Constants.ASSETMGMT.USER.SEARCH_COUNT.SUCCESS,
        null
    );

    try {
        //#region setdbquery 
        //TODO: make these regex based match
        if (searchData.condition._id) {
            dbQuery._id = searchData.condition._id;
        }
        if (Array.isArray(searchData.condition.roles)) {
            dbQuery.role = { $in: searchData.condition.roles };
        } else if (searchData.condition.role) {
            dbQuery.role = searchData.condition.role;
        }
        if (searchData.condition.name) {
            dbQuery.name = searchData.condition.name;
        }
        if (searchData.condition.phone) {
            dbQuery.phone = searchData.condition.phone;
        }
        if (searchData.condition.email) {
            dbQuery.email = searchData.condition.email;
        }        //#endregion setdbquery

        // Search count
        [error, count] = await To(UserModel.find(dbQuery).countDocuments().exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.SEARCH_COUNT.ERROR));
        }
        if ((count != null) && (count >= 0)) {
            resolveObject.setData({ count: count });
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.SEARCH_COUNT.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
        // Result

    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.USER.SEARCH_COUNT.ERROR));
    }
}

/**
* Update one user by id
* @param {*} userId string
* @param {*} user json object 
* @param {*} flags json
*/
async function updateOneById(userId, user, flags, session) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.SUCCESS,
            null
        );

        // Assign
        let updateObj = {};

        //////////////////////////TODO - remove below hack - 0123
        //Hack to overcome the update of array in mongoose
        //We will assume that the array has to be updated
        let tempArray, tempArray1;
        let updateAreasOfImprovement = false;
        let updateReviewRequestedAt = false;
        if (user &&
            user.profileData &&
            user.profileData.gamingProfile &&
            user.profileData.gamingProfile.areasOfImprovement &&
            Array.isArray(user.profileData.gamingProfile.areasOfImprovement)) {
            updateAreasOfImprovement = true;
            tempArray = user.profileData.gamingProfile.areasOfImprovement;
            delete user.profileData.gamingProfile.areasOfImprovement;
        }
        if (user &&
            user.profileData &&
            user.profileData.membershipProfile &&
            user.profileData.membershipProfile.reviewRequestedAt &&
            Array.isArray(user.profileData.membershipProfile.reviewRequestedAt)) {
            updateReviewRequestedAt = true;
            tempArray1 = user.profileData.membershipProfile.reviewRequestedAt;
            delete user.profileData.membershipProfile.reviewRequestedAt;
        }
        //////////////////////////TODO - remove above hack - 0123
        updateObj = ConvertToDotNotation.dot(user);
        //////////////////////////TODO - remove below hack - 0123
        //Hack to overcome the update of array in mongoose
        //We will assume that the array has to be updated
        if (updateAreasOfImprovement) {
            updateObj['profileData.gamingProfile.areasOfImprovement'] = tempArray;
        }
        if (updateReviewRequestedAt) {
            updateObj['profileData.membershipProfile.reviewRequestedAt'] = tempArray1;
        }
        //////////////////////////TODO - remove above hack - 0123

        // Update
        if (session) {
            [error, result] = await To(UserModel.findByIdAndUpdate(userId, updateObj, { new: true, runValidators: true, session: session }).exec());

        } else {
            [error, result] = await To(UserModel.findByIdAndUpdate(userId, updateObj, { new: true, runValidators: true }).exec());
        }
        // Response
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR));
        }
        if (result && (JSON.stringify(result._id) == JSON.stringify(userId))) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR));
    }
}

/**
* Update associate list in one user by id
* @param {*} userId string
* @param {*} user json object 
* @param {*} flags json
*/
async function addOneAssociateOfOneUserById(userId, associateId, flags, session) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.SUCCESS,
            null
        );

        // Update
        if (session) {
            [error, result] = await To(UserModel.findByIdAndUpdate(userId, { $push: { 'roleAssociation.associates': associateId } } , { new: true, runValidators: true, session: session }).exec());

        } else {
            [error, result] = await To(UserModel.findByIdAndUpdate(userId, { $push: { 'roleAssociation.associates': associateId } }, { new: true, runValidators: true }).exec());
        }
        // Response
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR));
        }
        if (result && (JSON.stringify(result._id) == JSON.stringify(userId))) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR_ADDING_ASSOCIATION,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR_ADDING_ASSOCIATION));
    }
}


/**
* Update associate list in one user by id
* @param {*} userId string
* @param {*} user json object 
* @param {*} flags json
*/
async function deleteOneAssociateOfOneUserById(userId, associateId, flags, session) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.SUCCESS,
            null
        );

        // Update
        if (session) {
            [error, result] = await To(UserModel.findByIdAndUpdate(userId, { $pull: { 'roleAssociation.associates': associateId } }, { new: true, runValidators: true, session: session }).exec());

        } else {
            [error, result] = await To(UserModel.findByIdAndUpdate(userId, { $pull: { 'roleAssociation.associates': associateId } }, { new: true, runValidators: true }).exec());
        }
        // Response
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR));
        }
        if (result && (JSON.stringify(result._id) == JSON.stringify(userId))) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR_DELETING_ASSOCIATION,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR_DELETING_ASSOCIATION));
    }
}
/**
* Delete one user by id
* @param {*} userId 
*/
async function deleteOneById(userId, session) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.USER.DELETE_ONE_BY_ID.SUCCESS,
            null
        );

        // Delete
        if (session) {
            [error, result] = await To(UserModel.findByIdAndRemove(userId, { session: session }).exec());
        } else {
            [error, result] = await To(UserModel.findByIdAndRemove(userId).exec());
        }

        // Response
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.DELETE_ONE_BY_ID.ERROR));
        }

        if (result && (result._id.equals(userId))) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.DELETE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.USER.DELETE_ONE_BY_ID.ERROR));
    }
}

/**
 * Delete multiple users by id
 * @param {*} userIds 
 */
async function deleteMultipleById(userIds) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.USER.DELETE_MULTIPLE_BY_ID.SUCCESS,
            null
        );

        // Update
        [error, result] = await To(UserModel.deleteMany({ _id: { $in: userIds } }).exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.DELETE_MULTIPLE_BY_ID.ERROR));
        }
        if (result && (result.deletedCount == userIds.length)) {
            // Response
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.DELETE_MULTIPLE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.USER.DELETE_MULTIPLE_BY_ID.ERROR));
    }
}

async function updateProfilePic(userId, user, flags){
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.SUCCESS,
            null
        );

        // Assign
        let updateObj = {};
        updateObj = ConvertToDotNotation.dot(user);

        // Update
        [error, result] = await To(UserModel.findByIdAndUpdate(userId, updateObj, { new: true }).exec());
        // Response
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR));
        }
        if (result && (JSON.stringify(result._id) == JSON.stringify(userId))) {
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.USER.UPDATE_ONE_BY_ID.ERROR));
    }
}