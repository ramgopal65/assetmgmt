const Express = require('express');
const Router = Express.Router();
const RequestAuthInterceptor = require('../interceptors/req-auth');
const ResponseSendInterceptor = require('../../interceptors/res-send')
const Constants = require('../constant/constant');
const TestimonialController = require('./controllers/testimonial');

//Create one testimonial post
Router.put(
    '/',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initiliazeTestimonialEndpoints(req, Constants.ASSETMGMT.APP_ACTION.ACTION.TESTIMONIAL.CREATE.API_NAME, Constants.ASSETMGMT.APP_ACTION.ACTION.TESTIMONIAL.CREATE.CALLER_LOCATION)
        next();
    },
    RequestAuthInterceptor.authenticateCaller,
    RequestAuthInterceptor.authorizeCallerForTestimonial,
    TestimonialController.createOne,
    ResponseSendInterceptor.sendResponse
);

//Get all testimonials
Router.post(
    '/search',
    Express.json(),
    (req, res, next) => {
        RequestAuthInterceptor.initiliazeTestimonialEndpoints(req, Constants.ASSETMGMT.APP_ACTION.ACTION.TESTIMONIAL.SEARCH.API_NAME, Constants.ASSETMGMT.APP_ACTION.ACTION.TESTIMONIAL.SEARCH.CALLER_LOCATION)
        next();
    },
    TestimonialController.search,
    ResponseSendInterceptor.sendResponse
);

//Get one testimonial by id
Router.get(
    '/:postId',
    (req, res, next) => {
        RequestAuthInterceptor.initiliazeTestimonialEndpoints(req, Constants.ASSETMGMT.APP_ACTION.ACTION.TESTIMONIAL.READ.API_NAME, Constants.ASSETMGMT.APP_ACTION.ACTION.TESTIMONIAL.READ.CALLER_LOCATION)
        next();
    },
    TestimonialController.getOneTestimonialById,
    ResponseSendInterceptor.sendResponse
);

module.exports = Router;