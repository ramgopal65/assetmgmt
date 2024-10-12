module.exports = {
    createOne: createOne,
    getOneTestimonialById: getOneTestimonialById,
    search: search
}

//Imports
const TestimonialServices = require('../services/testimonial');
const To = require('../../../common/to/to');
const RejectData = require('../../../common/response/reject-data');
const ResolveData = require('../../../common/response/resolve-data');
const CommonConstants = require('../../../common/constant/constant');
const Constants = require('../../constant/constant');

async function createOne(testimonial, caller){
    //Initiate
    let error, result;
    let rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE,
        Constants.ASSETMGMT.TESTIMONIAL.CREATE_ONE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    let resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.TESTIMONIAL.CREATE_ONE.SUCCESS,
        null
    );
    try {
        testimonial.author = caller._id;
        [error, result] = await To(TestimonialServices.createOne(testimonial));
        if (error) {
            rejectObject.setDetails(error);
            rejectObject.appendMessage(error.message);
            return Promise.reject(rejectObject.jsonObject());
        } else {
            resolveObject.setData(result.data);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (error) {
        rejectObject.setDetails(error);
        rejectObject.appendMessage(error.message);
        return Promise.reject(rejectObject.jsonObject());
    }

}

async function getOneTestimonialById(postId){
    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.TESTIMONIAL.GET_ONE_BY_ID.SUCCESS,
        null
    );
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.TESTIMONIAL.GET_ONE_BY_ID.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    try {
        // Initialize
        let error, result;

        // get one by id
        [error, result] = await To(TestimonialServices.getOneTestimonialById(postId));
        if (error) {
            return Promise.reject(error);
        }
        if (result) {
            resolveObject.setData(result.data);
            return Promise.resolve(resolveObject.jsonObject());
        }
    } catch (e) {
        rejectObject.appendMessage(e.message);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}

async function search(searchData) {
    // Initialize
    let error, result;

    try {
        // Search
        [error, result] = await To(TestimonialServices.search(searchData));
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.TESTIMONIAL.SEARCH.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejObject.appendMessage(e.message);
        return Promise.reject(rejObject.jsonObject());
    }
}