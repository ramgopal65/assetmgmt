module.exports = {
    createOne: createOne,
    getOneTestimonialById: getOneTestimonialById,
    search: search
}

//Imports
const TestimonialModel = require('../models/testimonial');
const To = require('../../../common/to/to');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');
const CommonValidator = require('../../../common/validate/validator');
const RejectData = require('../../../common/response/reject-data');
const ResolveData = require('../../../common/response/resolve-data');
const Mongoose = require('mongoose');

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
};

async function createOne(testimonial) {
    //Initialize
    let error, result, rejectObject, resolveObject;
    try {
        [error, result] = await To(TestimonialModel(testimonial).save());
        if (error) {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.TESTIMONIAL.CREATE_ONE.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        } else {
            resolveObject = new ResolveData(
                CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                Constants.ASSETMGMT.TESTIMONIAL.CREATE_ONE.SUCCESS,
                null
            );
            resolveObject.setData(result);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (error) {
        return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.TESTIMONIAL.CREATE_ONE.ERROR));
    }
}

async function getOneTestimonialById(postId) {
    try {
        // Initialize
        let error, result;
        var resolveObject = new ResolveData(
            CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
            Constants.ASSETMGMT.TESTIMONIAL.GET_ONE_BY_ID.SUCCESS,
            null
        );

        // Get
        [error, result] = await To(TestimonialModel.findById(postId).populate("author"));
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.TESTIMONIAL.GET_ONE_BY_ID.ERROR));
        }

        // Response
        if (result && (postId == result._id)) {
            let strippedResult = {};
            strippedResult = {
                _id: result._id,
                testimonialContent: result.testimonialContent,
                author: result.author.profileData.name.firstName + ' ' + result.author.profileData.name?.middleName + ' ' + result.author.profileData.name?.lastName,
                authorRole: result.author.role,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt
            }
            resolveObject.setData(strippedResult);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.TESTIMONIAL.GET_ONE_BY_ID.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.TESTIMONIAL.GET_ONE_BY_ID.ERROR));
    }
}

async function search(searchData) {
    // Initialize
    let dbQuery = {};
    let error, result;
    let sort, select;
    let skip, limit;
    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.TESTIMONIAL.SEARCH.SUCCESS,
        null
    );

    try {
        //#region setdbquery 
        if (searchData.condition._id) {
            dbQuery._id = searchData.condition._id;
        }
        //#endregion setdbquery

        sort = searchData.sort;
        select = searchData.select;
        skip = searchData.skip;
        limit = searchData.limit;

        // Search
        [error, result] = await To(TestimonialModel.find(dbQuery).select(select).sort(sort).skip(skip).limit(limit).populate('author').exec());
        if (error) {
            return Promise.reject(handleMongooseError(error, Constants.ASSETMGMT.TESTIMONIAL.SEARCH.ERROR));
        }

        // Result
        if (result) {
            if (!CommonValidator.isNonEmptyArray(result)) {
                resolveObject.appendMessage(Constants.ASSETMGMT.TESTIMONIAL.SEARCH.SUCCESS_NO_DATA);
            }
            let resultObject = result.map((element) => {
                let strippedResult = {};
                strippedResult = {
                    _id: element._id,
                    testimonialContent: element.testimonialContent,
                    author: element.author.profileData.name.firstName + ' ' + element.author.profileData.name?.middleName + ' ' + element.author.profileData.name?.lastName,
                    authorRole: element.author.role,
                    createdAt: element.createdAt,
                    updatedAt: element.updatedAt
                }
                return strippedResult;
            });

            resolveObject.setData(resultObject);
            return Promise.resolve(resolveObject.jsonObject());
        } else {
            var rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
                Constants.ASSETMGMT.TESTIMONIAL.SEARCH.ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        return Promise.reject(handleMongooseError(e, Constants.ASSETMGMT.TESTIMONIAL.SEARCH.ERROR));
    }
}