module.exports = {
    provision: provision,
    //provisionMissingFeaturesByReference: provisionMissingFeaturesByReference, //For including features by reference in models
    provisionMissingTrackerModels: provisionMissingTrackerModels, //For embedding features in models
    provisionMissingAssetModels: provisionMissingAssetModels, //For embedding features in models
};

const Config = require('../config/config');
const Constants = require('../constant/constant');

const RejectData = require('../../common/response/reject-data');
const ResolveData = require('../../common/response/resolve-data');
const CommonConstants = require('../../common/constant/constant');
const To = require('../../common/to/to');
const UserHelper = require('../routes/helpers/user');
const TrackerModelHelper = require('../routes/helpers/trackermodel');
const AssetModelHelper = require('../routes/helpers/assetmodel');
//const DefaultFeatureJson = require('../data/default-asset-model_reference');  //For including features by reference in models
//const DefaultTrackerModelJson = require('../data/default-tracker-model-reference');  //For including features by reference in models
//const DefaultAssetModelJson = require('../data/default-asset-model-reference');  //For including features by reference in models
const DefaultTrackerModelJson = require('../data/default-tracker-model');  //For embedding feature in models
const DefaultAssetModelJson = require('../data/default-asset-model');  //For embedding feature in models
const DefaultUserRoleJson = require('../data/default-user-roles');  //For creating default roles
const SettingsMap = require('../../common/wrappers/bootstrap/settings-map');
const SettingsKeysCommon = require('../../common/setting/keys');
const CommonValidator = require('../../common/validate/validator');

let saEmail = {};
saEmail.email = Config.SUPERADMIN.EMAIL;
let saIdentifier = {};
saIdentifier.id = saEmail.email;
saIdentifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
let saName = JSON.parse(Config.SUPERADMIN.NAME);
let state = {};
state.state = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.NEVER_LOGGED_IN.CODE;
let superAdmin = {
    identifier: saIdentifier,
    email: saEmail,
    profileData: {
        name: saName,
        dob: '01-01-2000',
        gender: 'male'
    },
    password: Config.SUPERADMIN.PASSWORD,
    state: state,
    role: Constants.ASSETMGMT.APP_USER_ROLE_NAMES.SUPERADMIN,
    roleAssociation: {
        type: Constants.ASSETMGMT.APP_USER_ROLE_ASSOCIATION.NONE
    }
};

let reviewerEmail = {};
reviewerEmail.email = Config.REVIEWER.EMAIL;
let reviewerIdentifier = {};
reviewerIdentifier.id = reviewerEmail.email;
reviewerIdentifier.type = CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL;
let reviewerName = JSON.parse(Config.REVIEWER.NAME);

let reviewerRole = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE.filter(function (el) {
    return (el.CUSTOM_ROLE && el.SINGLETON);
})[0];

let reviewer = {
    identifier: reviewerIdentifier,
    email: reviewerEmail,
    profileData: {
        name: reviewerName,
        dob: '01-01-2000',
        gender: 'male'
    },
    password: Config.REVIEWER.PASSWORD,
    state: state,
    role: reviewerRole.CODE,
    roleAssociation: {
        type: Constants.ASSETMGMT.APP_USER_ROLE_ASSOCIATION.NONE
    }
};
let provisionUser = null;

/**
 * provision missing data
 */
async function provision() {
    let error, result;

    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.EXPECTATION_FAILED.CODE,
        '',
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null);

    let resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK,
        Constants.ASSETMGMT.GENERIC.PROVISION_SUCCESS,
        null
    );

    try {
        console.log(Constants.ASSETMGMT.PROVISION.START);
        error = result = null;
        // Provision SA
        [error, result] = await To(provisionMissingSingletonRoles());
        if (error) {
            return Promise.reject(error);
        }

        error = result = null;
        // Provision missing features
        //Provisioning of Features not needed when features are embedded in models
        //[error, result] = await To(provisionMissingFeaturesByReference());
        //if (CommonValidator.isSuccessResponse(result)) {
        //    if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
        //        console.log(Constants.ASSETMGMT.PROVISION.FEATURE.MISSING.SUCCESS);
        //    }
        //} else {
        //    return Promise.reject(error);
        //}

        error = result = null;
        // Provision missing asset models
        [error, result] = await To(provisionMissingAssetModels());
        if (CommonValidator.isSuccessResponse(result)) {
            if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                console.log(Constants.ASSETMGMT.PROVISION.ASSET_MODEL.MISSING.SUCCESS);
            }
        } else {
            return Promise.reject(error);
        }

        // Provision missing TRACKER models
        [error, result] = await To(provisionMissingTrackerModels());
        if (CommonValidator.isSuccessResponse(result)) {
            if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                console.log(Constants.ASSETMGMT.PROVISION.TRACKER_MODEL.MISSING.SUCCESS);
            }
        } else {
            return Promise.reject(error);
        }

        // Provision missing roles
        [error, result] = await To(provisionMissingRoles());
        if (CommonValidator.isSuccessResponse(result)) {
            console.log(Constants.ASSETMGMT.PROVISION.ROLE.MISSING.SUCCESS);
        } else {
            return Promise.reject(error);
        }
        console.log(Constants.ASSETMGMT.PROVISION.COMPLETE);
        return Promise.resolve(resolveObject.jsonObject());

    } catch (e) {
        rejectObject.setMessage(Constants.ASSETMGMT.PROVISION.ERROR);
        rejectObject.appendMessage(e.message);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}

///**
// * Provision missing tracker features
// */
//async function provisionMissingFeaturesByReference() {
//    // Initialize
//    let error, allResult, result;
//    let missingFeatures = [];
//    var rejectObject = new RejectData(
//        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
//        Constants.ASSETMGMT.PROVISION.FEATURE.MISSING.ERROR,
//        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
//        null
//    );

//    var resolveObject = new ResolveData(
//        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
//        '',
//        null
//    );
//    try {
//        let sort = {code:1};
//        let select = '';
//        let params = { sort: sort, select: select };

//        let skip, limit;
//        if (CommonValidator.isIntegerAndPositive(SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.SKIP.DEFAULT))) {
//            skip = SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.SKIP.DEFAULT);
//        } else {
//            skip = CommonConstants.COMMON.APP_DB.FETCH_ALL.SKIP.DEFAULT;
//        }
//        if (CommonValidator.isIntegerAndPositive(SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.LIMIT.DEFAULT))) {
//            limit = SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.LIMIT.DEFAULT);
//        } else {
//            limit = CommonConstants.COMMON.APP_DB.FETCH_ALL.LIMIT.DEFAULT;
//        }
//        let query = { skip: skip, limit: limit };

//        let countError, countResult;
//        let allFeatures = [];
//        [countError, countResult] = await To(FeatureHelper.getAllCount(params, query));
//        if (CommonValidator.isSuccessResponse(countResult)) {
//            let count = parseInt(countResult.data.count);
//            let got = 0;

//            for (; got < count; got += limit, skip += limit) {

//                let fetchError, fetchResult;
//                query = { skip: skip, limit: limit };

//                // Get the list of all existing device features
//                [fetchError, fetchResult] = await To(FeatureHelper.getAll(params, query));
//                if (fetchError) {
//                    return Promise.reject(fetchError);
//                }
//                allFeatures = allFeatures.concat(fetchResult.data);
//            }
//        } else {
//            return Promise.reject(countError);
//        }

//        // Prepare the list of all missing device features
//        if (CommonValidator.isNonEmptyArray(DefaultFeatureJson.all)) {
//            let isExists = false;

//            DefaultFeatureJson.all.forEach(s => {
//                isExists = false;

//                allFeatures.every(el => {
//                    if (el.code == s.code) {
//                        isExists = true;
//                        return false;
//                    } else {
//                        return true;
//                    }
//                });
//                if (!isExists) {
//                    missingFeatures.push(s);
//                }
//            });
//            console.log(Constants.ASSETMGMT.PROVISION.FEATURE.MISSING.NUM_TO_PROVISION + missingFeatures.length);
//        }

//        if (CommonValidator.isNonEmptyArray(missingFeatures)) {
//            error = result = null;
//            // Provision missing device features
//            [error, result] = await To(FeatureHelper.createMultiple(provisionUser, missingFeatures, null, null));
//            if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
//                let resolveObj = new ResolveData(
//                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
//                    Constants.ASSETMGMT.PROVISION.FEATURE.MISSING.SUCCESS,
//                    result.data
//                );
//                return Promise.resolve(resolveObj.jsonObject());
//;           } else {
//                rejectObject.appendMessage(error.message);
//                rejectObject.setDetails(error);
//                return Promise.reject(rejectObject.jsonObject());
//            }

//        } else {
//            resolveObject.setMessage(Constants.ASSETMGMT.PROVISION.FEATURE.MISSING.NOTHING_TO_PROVISION);
//            return Promise.resolve(resolveObject.jsonObject());
//        }
//    } catch (e) {
//        rejectObject.appendMessage(Constants.ASSETMGMT.PROVISION.FEATURE.MISSING.ERROR);
//        rejectObject.setDetails(e);
//        return Promise.reject(rejectObject.jsonObject());
//    }
//}

///**
// * Provision missing tracker models
// */
//async function provisionMissingTrackerModelsByReference() {
//    // Initialize
//    let error, allResult, result;
//    let missingTrackerModels = [];
//    var rejectObject = new RejectData(
//        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
//        Constants.ASSETMGMT.PROVISION.TRACKER_MODEL.MISSING.ERROR,
//        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
//        null
//    );

//    var resolveObject = new ResolveData(
//        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
//        '',
//        null
//    );
//    try {
//        let sort = { code: 1 };
//        let select = '';
//        let params = { sort: sort, select: select };

//        let skip, limit;
//        if (CommonValidator.isIntegerAndPositive(SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.SKIP.DEFAULT))) {
//            skip = SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.SKIP.DEFAULT);
//        } else {
//            skip = CommonConstants.COMMON.APP_DB.FETCH_ALL.SKIP.DEFAULT;
//        }
//        if (CommonValidator.isIntegerAndPositive(SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.LIMIT.DEFAULT))) {
//            limit = SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.LIMIT.DEFAULT);
//        } else {
//            limit = CommonConstants.COMMON.APP_DB.FETCH_ALL.LIMIT.DEFAULT;
//        }
//        let query = { skip: skip, limit: limit };

//        let countError, countResult;
//        let allTrackerModels = [];
//        [countError, countResult] = await To(TrackerModelHelper.getAllCount(params, query));
//        if (CommonValidator.isSuccessResponse(countResult)) {
//            let count = parseInt(countResult.data.count);
//            let got = 0;

//            for (; got < count; got += limit, skip += limit) {

//                let fetchError, fetchResult;
//                query = { skip: skip, limit: limit };

//                // Get the list of all existing device features
//                [fetchError, fetchResult] = await To(TrackerModelHelper.getAll(params, query));
//                if (fetchError) {
//                    return Promise.reject(fetchError);
//                }
//                allTrackerModels = allTrackerModels.concat(fetchResult.data);
//            }
//        } else {
//            return Promise.reject(countError);
//        }

//        // Prepare the list of all missing device features
//        if (CommonValidator.isNonEmptyArray(DefaultTrackerModelJson.all)) {
//            let isExists = false;

//            DefaultTrackerModelJson.all.forEach(s => {
//                isExists = false;

//                allTrackerModels.every(el => {
//                    if (el.code == s.code) {
//                        isExists = true;
//                        return false;
//                    } else {
//                        return true;
//                    }
//                });
//                if (!isExists) {
//                    missingTrackerModels.push(s);
//                }
//            });
//            console.log(Constants.ASSETMGMT.PROVISION.TRACKER_MODEL.MISSING.NUM_TO_PROVISION + missingTrackerModels.length);
//        }

//        if (CommonValidator.isNonEmptyArray(missingTrackerModels)) {
//            error = result = null;
//            // Provision missing device features
//            [error, result] = await To(TrackerModelHelper.createMultiple(provisionUser, missingTrackerModels, null, null));
//            if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
//                let resolveObj = new ResolveData(
//                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
//                    Constants.ASSETMGMT.PROVISION.TRACKER_MODEL.MISSING.SUCCESS,
//                    result.data
//                );
//                return Promise.resolve(resolveObj.jsonObject());
//                ;
//            } else {
//                rejectObject.appendMessage(error.message);
//                rejectObject.setDetails(error);
//                return Promise.reject(rejectObject.jsonObject());
//            }

//        } else {
//            resolveObject.setMessage(Constants.ASSETMGMT.PROVISION.TRACKER_MODEL.MISSING.NOTHING_TO_PROVISION);
//            return Promise.resolve(resolveObject.jsonObject());
//        }
//    } catch (e) {
//        rejectObject.appendMessage(Constants.ASSETMGMT.PROVISION.TRACKER_MODEL.MISSING.ERROR);
//        rejectObject.setDetails(e);
//        return Promise.reject(rejectObject.jsonObject());
//    }
//}

/**
 * Provision suoeradmin
 */
async function provisionMissingSingletonRoles() {
    let error, result;
    try {
        [error, result] = await To(provisionMissingSuperadmin());
        if (error) {
            return Promise.reject(error);
        } else {
            error = result = null;
            [error, result] = await To(provisionMissingReviewer());
            if (error) {
                return Promise.reject(error);
            } else {
                return Promise.resolve(result);
            }
        }
    } catch (e) {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.PROVISION.SINGLETON_ROLE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e
        );
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
 * Provision suoeradmin
 */
async function provisionMissingSuperadmin() {
    // Initialize
    let error, result;
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.PROVISION.SUPER_ADMIN.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        '',
        null
    );
    try {
        let searchCondition = {};
        searchCondition.condition = { role: Constants.ASSETMGMT.APP_USER_ROLE_NAMES.SUPERADMIN };
        let countError, countResult;
        [countError, countResult] = await To(UserHelper.searchCount(searchCondition));
        if (CommonValidator.isSuccessResponse(countResult)) {
            let count = parseInt(countResult.data.count);
            if (0 == count) {
                //Create the superadmin
                [error, result] = await To(UserHelper.createSuperadmin(superAdmin, null));
                if (CommonValidator.isSuccessResponse(result)) {
                    provisionUser = result.data;
                    resolveObject.setMessage(Constants.ASSETMGMT.PROVISION.SUPER_ADMIN.SUCCESS);
                    resolveObject.setData(result.data);
                    console.log(Constants.ASSETMGMT.PROVISION.SUPER_ADMIN.SUCCESS);
                    return Promise.resolve(resolveObject.jsonObject());
                } else {
                    rejectObject.setMessage(Constants.ASSETMGMT.PROVISION.SUPER_ADMIN.ERROR);
                    rejectObject.appendMessage(error.message);
                    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                    rejectObject.setDetails(error);
                    return Promise.reject(rejectObject.jsonObject());
                }
            } else if (1 == count) {
                //superadmin is already available. 
                resolveObject.setMessage(Constants.ASSETMGMT.PROVISION.SUPER_ADMIN.ALREADY_AVAILABLE);

                error = result = null;
                [error, result] = await To(UserHelper.search(searchCondition));
                if (CommonValidator.isSuccessResponseAndNonEmptyDataArray(result) && (result.data.length == 1)) {
                    provisionUser = result.data[0];
                    resolveObject.setData(result.data[0]);
                    console.log(Constants.ASSETMGMT.PROVISION.SUPER_ADMIN.ALREADY_AVAILABLE);
                    return Promise.resolve(resolveObject.jsonObject());
                } else {
                    rejectObject.setMessage(Constants.ASSETMGMT.PROVISION.SUPER_ADMIN.ERROR);
                    rejectObject.appendMessage(error.message);
                    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                    rejectObject.setDetails(error);
                    return Promise.reject(rejectObject.jsonObject());
                }
            } else {
                //error out
                console.log(Constants.ASSETMGMT.PROVISION.SUPER_ADMIN.ERROR_TOO_MANY);
                rejectObject.setMessage(Constants.ASSETMGMT.PROVISION.SUPER_ADMIN.ERROR_TOO_MANY);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            rejectObject.appendMessage(Constants.ASSETMGMT.PROVISION.SUPER_ADMIN.ERROR);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        rejectObject.appendMessage(Constants.ASSETMGMT.PROVISION.SUPER_ADMIN.ERROR);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}
/**
 * Provision reviewer
 */
async function provisionMissingReviewer() {
    // Initialize
    let error, result;
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.PROVISION.SINGLETON_ROLE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        '',
        null
    );
    try {
        let searchCondition = {};

        let reviewerRole = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE.filter(function (el) {
            return (el.CUSTOM_ROLE && el.SINGLETON);
        })[0];

        searchCondition.condition = { role: reviewerRole.CODE };
        let countError, countResult;
        [countError, countResult] = await To(UserHelper.searchCount(searchCondition));
        if (CommonValidator.isSuccessResponse(countResult)) {
            let count = parseInt(countResult.data.count);
            if (0 == count) {
                //Create the singleton
                [error, result] = await To(UserHelper.createSingleton(provisionUser._id, reviewer, null));
                if (CommonValidator.isSuccessResponse(result)) {
                    resolveObject.setMessage(Constants.ASSETMGMT.PROVISION.SINGLETON_ROLE.SUCCESS);
                    resolveObject.appendMessage(reviewerRole.CODE);
                    resolveObject.setData(result.data);
                    console.log(Constants.ASSETMGMT.PROVISION.SINGLETON_ROLE.SUCCESS + '. ' + reviewerRole.CODE);
                    return Promise.resolve(resolveObject.jsonObject());
                } else {
                    rejectObject.setMessage(Constants.ASSETMGMT.PROVISION.SINGLETON_ROLE.ERROR);
                    resolveObject.appendMessage(reviewerRole.CODE);
                    rejectObject.appendMessage(error.message);
                    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                    rejectObject.setDetails(error);
                    return Promise.reject(rejectObject.jsonObject());
                }
            } else if (1 == count) {
                //superadmin is already available. 
                resolveObject.setMessage(Constants.ASSETMGMT.PROVISION.SINGLETON_ROLE.ALREADY_AVAILABLE);

                error = result = null;
                [error, result] = await To(UserHelper.search(searchCondition));
                if (CommonValidator.isSuccessResponseAndNonEmptyDataArray(result) && (result.data.length == 1)) {
                    resolveObject.appendMessage(reviewerRole.CODE);
                    resolveObject.setData(result.data[0]);
                    console.log(Constants.ASSETMGMT.PROVISION.SINGLETON_ROLE.ALREADY_AVAILABLE + '. ' + reviewerRole.CODE);
                    return Promise.resolve(resolveObject.jsonObject());
                } else {
                    rejectObject.setMessage(Constants.ASSETMGMT.PROVISION.SINGLETON_ROLE.ERROR);
                    resolveObject.appendMessage(reviewerRole.CODE);
                    rejectObject.appendMessage(error.message);
                    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                    rejectObject.setDetails(error);
                    return Promise.reject(rejectObject.jsonObject());
                }
            } else {
                //error out
                console.log(Constants.ASSETMGMT.PROVISION.SUPER_ADMIN.ERROR_TOO_MANY + '. ' + reviewerRole.CODE);
                rejectObject.setMessage(Constants.ASSETMGMT.PROVISION.SINGLETON_ROLE.ERROR_TOO_MANY);
                resolveObject.appendMessage(reviewerRole.CODE);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            rejectObject.appendMessage(Constants.ASSETMGMT.PROVISION.SUPER_ADMIN.ERROR);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        rejectObject.appendMessage(Constants.ASSETMGMT.PROVISION.SINGLETON_ROLE.ERROR);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
 * Provision missing asste models
 */
async function provisionMissingAssetModels() {
    // Initialize
    let error, result;
    let missingAssetModels = [];
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.PROVISION.ASSET_MODEL.MISSING.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        '',
        null
    );
    try {
        let sort = { code: 1 };
        let select = '';
        let params = { sort: sort, select: select };

        let skip, limit;
        if (CommonValidator.isIntegerAndPositive(SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.SKIP.DEFAULT))) {
            skip = SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.SKIP.DEFAULT);
        } else {
            skip = CommonConstants.COMMON.APP_DB.FETCH_ALL.SKIP.DEFAULT;
        }
        if (CommonValidator.isIntegerAndPositive(SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.LIMIT.DEFAULT))) {
            limit = SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.LIMIT.DEFAULT);
        } else {
            limit = CommonConstants.COMMON.APP_DB.FETCH_ALL.LIMIT.DEFAULT;
        }
        let query = { skip: skip, limit: limit };

        let countError, countResult;
        let allTrackerModels = [];
        [countError, countResult] = await To(AssetModelHelper.getAllCount(params, query));
        if (CommonValidator.isSuccessResponse(countResult)) {
            let count = parseInt(countResult.data.count);
            let got = 0;

            for (; got < count; got += limit, skip += limit) {

                let fetchError, fetchResult;
                query = { skip: skip, limit: limit };

                // Get the list of all existing assetmodels
                [fetchError, fetchResult] = await To(AssetModelHelper.getAll(params, query));
                if (fetchError) {
                    return Promise.reject(fetchError);
                }
                allTrackerModels = allTrackerModels.concat(fetchResult.data);
            }
        } else {
            return Promise.reject(countError);
        }

        // Prepare the list of all missing device assetmodels
        if (CommonValidator.isNonEmptyArray(DefaultAssetModelJson.all)) {
            let isExists = false;

            DefaultAssetModelJson.all.forEach(s => {
                isExists = false;

                allTrackerModels.every(el => {
                    if (el.code == s.code) {
                        isExists = true;
                        return false;
                    } else {
                        return true;
                    }
                });
                if (!isExists) {
                    missingAssetModels.push(s);
                }
            });
            console.log(Constants.ASSETMGMT.PROVISION.ASSET_MODEL.MISSING.NUM_TO_PROVISION + missingAssetModels.length);
        }

        if (CommonValidator.isNonEmptyArray(missingAssetModels)) {
            error = result = null;
            // Provision missing device assetmodels
            [error, result] = await To(AssetModelHelper.createMultiple(provisionUser._id, missingAssetModels, null, null));
            if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                let resolveObj = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.ASSETMGMT.PROVISION.ASSET_MODEL.MISSING.SUCCESS,
                    result.data
                );
                return Promise.resolve(resolveObj.jsonObject());
            } else {
                rejectObject.appendMessage(error.message);
                rejectObject.setDetails(error);
                return Promise.reject(rejectObject.jsonObject());
            }

        } else {
            resolveObject.setMessage(Constants.ASSETMGMT.PROVISION.ASSET_MODEL.MISSING.NOTHING_TO_PROVISION);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        rejectObject.appendMessage(Constants.ASSETMGMT.PROVISION.ASSET_MODEL.MISSING.ERROR);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* Provision missing tracker models
*/
async function provisionMissingTrackerModels() {
    // Initialize
    let error, result;
    let missingTrackerModels = [];
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.PROVISION.TRACKER_MODEL.MISSING.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        '',
        null
    );
    try {
        let sort = { code: 1 };
        let select = '';
        let params = { sort: sort, select: select };

        let skip, limit;
        if (CommonValidator.isIntegerAndPositive(SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.SKIP.DEFAULT))) {
            skip = SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.SKIP.DEFAULT);
        } else {
            skip = CommonConstants.COMMON.APP_DB.FETCH_ALL.SKIP.DEFAULT;
        }
        if (CommonValidator.isIntegerAndPositive(SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.LIMIT.DEFAULT))) {
            limit = SettingsMap.get(SettingsKeysCommon.COMMON.DATABASE.FETCH_ALL.LIMIT.DEFAULT);
        } else {
            limit = CommonConstants.COMMON.APP_DB.FETCH_ALL.LIMIT.DEFAULT;
        }
        let query = { skip: skip, limit: limit };

        let countError, countResult;
        let allTrackerModels = [];
        [countError, countResult] = await To(TrackerModelHelper.getAllCount(params, query));
        if (CommonValidator.isSuccessResponse(countResult)) {
            let count = parseInt(countResult.data.count);
            let got = 0;

            for (; got < count; got += limit, skip += limit) {

                let fetchError, fetchResult;
                query = { skip: skip, limit: limit };

                // Get the list of all existing device features
                [fetchError, fetchResult] = await To(TrackerModelHelper.getAll(params, query));
                if (fetchError) {
                    return Promise.reject(fetchError);
                }
                allTrackerModels = allTrackerModels.concat(fetchResult.data);
            }
        } else {
            return Promise.reject(countError);
        }

        // Prepare the list of all missing device features
        if (CommonValidator.isNonEmptyArray(DefaultTrackerModelJson.all)) {
            let isExists = false;

            DefaultTrackerModelJson.all.forEach(s => {
                isExists = false;

                allTrackerModels.every(el => {
                    if (el.code == s.code) {
                        isExists = true;
                        return false;
                    } else {
                        return true;
                    }
                });
                if (!isExists) {
                    missingTrackerModels.push(s);
                }
            });
            console.log(Constants.ASSETMGMT.PROVISION.TRACKER_MODEL.MISSING.NUM_TO_PROVISION + missingTrackerModels.length);
        }

        if (CommonValidator.isNonEmptyArray(missingTrackerModels)) {
            error = result = null;
            // Provision missing trackermodels
            [error, result] = await To(TrackerModelHelper.createMultiple(provisionUser._id, missingTrackerModels, null, null));
            if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                let resolveObj = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.ASSETMGMT.PROVISION.TRACKER_MODEL.MISSING.SUCCESS,
                    result.data
                );
                return Promise.resolve(resolveObj.jsonObject());
                
            } else {
                rejectObject.appendMessage(error.message);
                rejectObject.setDetails(error);
                return Promise.reject(rejectObject.jsonObject());
            }

        } else {
            resolveObject.setMessage(Constants.ASSETMGMT.PROVISION.TRACKER_MODEL.MISSING.NOTHING_TO_PROVISION);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        rejectObject.appendMessage(Constants.ASSETMGMT.PROVISION.TRACKER_MODEL.MISSING.ERROR);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* Provision missing roles
*/
async function provisionMissingRoles() {
    // Initialize
    let error, result, admin, entRoot, entOwner, entSub;
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.PROVISION.ROLE.MISSING.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        '',
        null
    );
    try {
        let adminIdentifier = {
            type: CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL,
            id: DefaultUserRoleJson.DEFAULT_ADMIN.email.email
        };
        let adminUser = {};
        adminUser.identifier = adminIdentifier;
        [error, admin] = await To(UserHelper.getOneByIdentifier(adminUser));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(admin)) {
            //nothing
        } else {
            error = admin = null;
            [error, admin] = await To(UserHelper.createOne(provisionUser, DefaultUserRoleJson.DEFAULT_ADMIN));
            if (CommonValidator.isSuccessResponseAndNonEmptyData(admin)) {
                //Nothing
            } else {
                rejectObject.appendMessage(DefaultUserRoleJson.DEFAULT_ADMIN.role);
                return Promise.reject(rejectObject.jsonObject());
            }
        }

        let rootIdentifier = {
            type: CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL,
            id: DefaultUserRoleJson.DEFAULT_ENTERPRISE_ROOT_OWNER.email.email
        };
        let entRootOwner = {};
        entRootOwner.identifier = rootIdentifier;
        [error, entRoot] = await To(UserHelper.getOneByIdentifier(entRootOwner));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(entRoot)) {
            //nothing
        } else {
            error = entRoot = null;
            [error, entRoot] = await To(UserHelper.createOne(admin.data, DefaultUserRoleJson.DEFAULT_ENTERPRISE_ROOT_OWNER));
            if (CommonValidator.isSuccessResponseAndNonEmptyData(entRoot)) {
                //Nothing
            } else {
                rejectObject.appendMessage(DefaultUserRoleJson.DEFAULT_ENTERPRISE_ROOT_OWNER.role);
                return Promise.reject(rejectObject.jsonObject());
            }
        }

        let ownerIdentifier = {
            type: CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL,
            id: DefaultUserRoleJson.DEFAULT_ENTERPRISE_OWNER.email.email
        };
        let entOwner = {};
        entOwner.identifier = ownerIdentifier;
        [error, entOwner] = await To(UserHelper.getOneByIdentifier(entOwner));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(entOwner)) {
            //nothing
        } else {
            error = entOwner = null;
            [error, entOwner] = await To(UserHelper.createOne(entRoot.data, DefaultUserRoleJson.DEFAULT_ENTERPRISE_OWNER));
            if (CommonValidator.isSuccessResponseAndNonEmptyData(entOwner)) {
                //Nothing
            } else {
                rejectObject.appendMessage(DefaultUserRoleJson.DEFAULT_ENTERPRISE_OWNER.role);
                return Promise.reject(rejectObject.jsonObject());
            }
        }

        let subIdentifier = {
            type: CommonConstants.COMMON.APP_OBJECT.GENERIC.IDENTIFIER_TYPE.EMAIL,
            id: DefaultUserRoleJson.DEFAULT_ENTERPRISE_SUB_OWNER.email.email
        };
        let subOwner = {};
        subOwner.identifier = subIdentifier;
        [error, entSub] = await To(UserHelper.getOneByIdentifier(subOwner));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(entSub)) {
            //nothing
        } else {
            error = entSub = null;
            [error, entSub] = await To(UserHelper.createOne(entOwner.data, DefaultUserRoleJson.DEFAULT_ENTERPRISE_SUB_OWNER));
            if (CommonValidator.isSuccessResponseAndNonEmptyData(entSub)) {
                //Nothing
            } else {
                rejectObject.appendMessage(DefaultUserRoleJson.DEFAULT_ENTERPRISE_OWNER.role);
                return Promise.reject(rejectObject.jsonObject());
            }
        }
        return Promise.resolve(resolveObject.jsonObject());

    } catch (e) {
        rejectObject.appendMessage(e.message);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}