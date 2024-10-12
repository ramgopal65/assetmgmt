/* eslint-disable indent */



const CommonValidator = require('../../common/validate/validator');
const CommonConstants = require('../../common/constant/constant');
const RejectData = require('../../common/response/reject-data');
const ResolveData = require('../../common/response/resolve-data');


const SUBJECT_IN_REQ = 'subjectInReq';
const OBJECT = 'object';
const CONDITION = 'condition';
const VALUE = 'value';

const CALLER_LOCATION_IN_REQ = {
    AUTHORIZATION_TOKEN: 'authorization_token',
    REQ_PARAMS_ID: 'req.params._id',
    REQ_BODY_IDENTIFIER: 'req.body.phone or req.body.email',
    UNKNOWN: 'unknown',
};

const SUBJECT_LOCATION_IN_REQ = {
    REQ_PARAMS_ID: 'req.params._id',
    REQ_BODY_IDENTIFIER: 'req.body.phone or req.body.email',
    UNKNOWN: 'unknown',
};

const POST_LOCATION_IN_REQ = {
    REQ_PARAMS_ID: 'req.params.postId',
    UNKNOWN: 'unknown',
};


const CALLER_USER_SUBJECT_USER_RELATION = {
    SAME: 'caller and subject are same user',
    OTHER: 'caller and subject are different users',
    UNKNOWN: 'unknown'
};

const CALLER_USER_SUBJECT_POST_RELATION = {
    SAME_USER_POST: 'subject is the post of caller',
    ASSOCIATE_USER_POST: 'subject is the post of associate',
    UNKNOWN: 'unknown'
};


const AUTHORIZATION_SUBJECT_IN_REQ = {
    CALLER_IS_SUBJECT: 'caller is subject',
    EXISTING_SUBJECT_ID_IN_PARAM: 'existing subjectId is in param',
    SUBJECT_TO_CREATE_IN_BODY: 'subject to create is in body',
    UNKNOWN_SUBJECT: 'subject is unknown',
};

const AUTHORIZATION_OBJECT = {
    SUBJECT: {
        ROLE: 'SUBJECT.ROLE'
    }
};

const AUTHORIZATION_CONDITION = {
    EQUALS: '===',
    IN: 'in'
};

async function checkAuthorization(subject, authorization) {
    console.log('checking authorization');
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE,
        CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_INSUFFICIENT_AUTHORIZATION,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        CommonConstants.COMMON.APP_ERROR.SUCCESS,
        null);

    try {
        if (authorization && authorization.pendingAuthorization) {
            console.log('found pendingAuthorization');
            if (CommonValidator.isNonEmptyObject(authorization.pendingAuthorization)) {
                console.log('pendingAuthorization is non empty');
                let objectToCheck;
                switch (authorization.pendingAuthorization[OBJECT]) {
                    case AUTHORIZATION_OBJECT.SUBJECT.ROLE:
                        objectToCheck = subject.role;
                        break;
                    default:
                        break;
                }

                switch (authorization.pendingAuthorization[CONDITION]) {
                    case AUTHORIZATION_CONDITION.EQUALS:
                        if (objectToCheck === authorization.pendingAuthorization[VALUE]) {
                            console.log('pendingAuthorization checked for equal condition - authorization is successful');
                            return Promise.resolve(resolveObject.jsonObject());
                        } else {
                            console.log('pendingAuthorization checked for equal condition - authorization failed');
                            return Promise.reject(rejectObject.jsonObject());
                        }
                        break;
                    case AUTHORIZATION_CONDITION.IN:
                        if (CommonValidator.isVaildAndNonEmptyArray(authorization.pendingAuthorization[VALUE])) {
                            if (authorization.pendingAuthorization[VALUE].includes(objectToCheck)) {
                                console.log('pendingAuthorization checked for in condition - authorization is successful');
                                return Promise.resolve(resolveObject.jsonObject());
                            } else {
                                console.log('pendingAuthorization checked for in condition - authorization failed');
                                return Promise.reject(rejectObject.jsonObject());
                            }
                        } else {
                            rejectObject = new RejectData(
                                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                                null);
                            console.log('pendingAuthorization value is empty - authorization failed');
                            return Promise.reject(rejectObject.jsonObject());
                        }
                        break;
                    default:
                        rejectObject = new RejectData(
                            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                            CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                            null);
                        console.log('pendingAuthorization unknown condition - authorization failed');
                        return Promise.reject(rejectObject.jsonObject());
                        break;
                }
            } else {
                //authorization condition is empty. consider it authorized
                console.log('pendingAuthorization is empty - authorization is successful');
                return Promise.resolve(resolveObject.jsonObject());
            }
        } else {
            rejectObject = new RejectData(
                CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
                CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
                CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
                null);
            console.log('not found pendingAuthorization - authorization failed');
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.AUTHORIZATION_ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        console.log('unknown error - authorization failed');
        return Promise.reject(rejectObject.jsonObject());
    }
}


module.exports = {
    CALLER_LOCATION_IN_REQ,
    SUBJECT_LOCATION_IN_REQ,
    CALLER_USER_SUBJECT_USER_RELATION,
    POST_LOCATION_IN_REQ,
    CALLER_USER_SUBJECT_POST_RELATION
};
