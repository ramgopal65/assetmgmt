const Request = require('supertest');
var AssetMgmtServer;
let isAlreadyRunning = true;
require('dotenv').config();

//TODO: move to vaults in cloud from ENV for authentication keys
const ENV = process.env;

const delay = ms => new Promise(res => setTimeout(res, ms));
const port = ENV.ASSETMGMT_ASSETMGMT_PORT;
const AssetMgmtBaseRoute = 'http://localhost:' + port;
const UserBaseRoute = '/assetmgmt/user';
const HealthBaseRoute = '/assetmgmt/health';


const CommonConstants = require('../../common/constant/constant');
const Constants = require('../constant/constant');


const CommonMongoKeyAlreadyExistingError = CommonConstants.COMMON.APP_ERROR.MONGO_ERROR.ERROR_PROVIDED_KEY_ALREADY_IN_USE.SUBCODE;
const ReqValidationError = CommonConstants.COMMON.APP_ERROR.REQUEST_VALIDATION_ERROR.REQUEST_FIELD_MISSING_OR_INVALID;
const AuthenticationError = CommonConstants.COMMON.APP_ERROR.AUTH_ERROR;
const SubjectError = CommonConstants.COMMON.APP_ERROR.SUBJECT_ERROR;
const MongoError = CommonConstants.COMMON.APP_ERROR.MONGO_ERROR;
const WrongPasswordError = Constants.ASSETMGMT.USER.LOGIN.ERROR_INCORRECT_PASSWORD;
const WrongPasswordLockedError = Constants.ASSETMGMT.USER.LOGIN.ERROR_INCORRECT_PASSWORD_LOCKED;
const UserOtpError = Constants.ASSETMGMT.USER.OTP;
const UserRegisterError = Constants.ASSETMGMT.USER.REGISTER;
const UserLoginError = Constants.ASSETMGMT.USER.LOGIN;
const CommonUnauthorizedErrorTokenNotProvided = CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.TOKEN_NOT_PROVIDED;
const CommonUnauthorizedErrorInvalidToken = CommonConstants.COMMON.APP_ERROR.AUTH_ERROR.INVALID_TOKEN;

//Http status
const HTTP_OK = CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE;
const HTTP_BAD_REQUEST = CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE;
const HTTP_UNAUTHORIZED = CommonConstants.COMMON.APP_HTTP.STATUS.UNAUTHORIZED.CODE;
const HTTP_CONFLICT = CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE;


//User status
const UserStatusRegistering = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.REGISTERING.CODE;
const UserStatusActiveNeverLoggedIn = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.NEVER_LOGGED_IN.CODE;
const UserStatusActiveLoggedIn = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_IN.CODE;
const UserStatusActiveLoggedOut = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.ACTIVE.LOGGED_OUT.CODE;
const UserStatusLocked = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.CODE;

//Remaining attempts
const ZERO = 0;
const ONE = 1;
const TWO = 2;
const THREE = 3;

String.prototype.replaceAt = function (index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
};


const path = require('path');
const fs = require('fs');
//To delete any existing .csv file related with these test cases
const projectDirectory = process.cwd();
const csvFileName = path.join(projectDirectory, 'output-user.csv');
beforeAll(() => {
    if (fs.existsSync(csvFileName)) {
        fs.unlinkSync(csvFileName);
    }
});


function compareJsonArrays(a1, a2) {
    if (a1.length != a2.length) {
        return false;
    }

    for (var i = 0; i < a1.length; i++) {
        var objA1 = a1[i];
        var found = false;
        for (var j = 0; j < a2.length; j++) {
            var objA2 = a2[j];

            if (compareJsonObject(objA1, objA2)) {
                found = true;
                break;
            }
        }
        if (!found) {
            return false;
        }
    }
    return true;
}

function compareJsonObject(obj, sparse) {
    if (!Object.keys(sparse).every(key => Object.prototype.hasOwnProperty.bind(obj, key))) {
        return false;
    }
    return Object.keys(sparse).every(function (key) {
        if (typeof obj[key] == 'object') {
            return compareJsonObject(obj[key], sparse[key]);
        } else {
            return (obj[key] == sparse[key]);
        }
    });
}


let tSNo = 0;
let sTSNo = 0;
//To get the output.csv file
let headerWritten = false;
function printReqResToCSV(res, sNo, testDetails, testCondition, expectedResult, actualResult, status) {
    const req = JSON.parse(JSON.stringify(res)).req;
    const requestString = JSON.stringify(req, null, 2).replace(/"/g, '""');
    const responseString = JSON.stringify(res.body, null, 2).replace(/"/g, '""');

    //console.log('request : ');
    //console.log(requestString);
    //console.log('response : ');
    //console.log(responseString);

    if (typeof expectedResult === 'object') {
        expectedResult = JSON.stringify(expectedResult).replace(/"/g, '""');
    }
    if (typeof actualResult === 'object') {
        actualResult = JSON.stringify(actualResult).replace(/"/g, '""');
    }
    const csvRow = [sNo, testDetails, requestString, responseString, testCondition, expectedResult, actualResult, status];
    if (!headerWritten) {
        const header = ['SNo', 'Test Description', 'Request Body', 'Response Body', 'Test Condition', 'Expected Result', 'Actual Result', 'Status'];
        const csvContent = [header, csvRow].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        fs.appendFileSync(csvFileName, csvContent + '\n');
        headerWritten = true;
    } else {
        const csvContent = csvRow.map(cell => `"${cell}"`).join(',');
        fs.appendFileSync(csvFileName, csvContent + '\n');
    }
}

beforeAll(async () => {
    try {
        tSNo = 0;
        sTSNo = 0;
        let response = await Request(AssetMgmtBaseRoute).get(HealthBaseRoute);
        if (response.body.code == 200 && (response.body.message = 'healthy')) {
            isAlreadyRunning = true;
            console.log('server already running');
            AssetMgmtServer = null;
        } else {
            isAlreadyRunning = false;
            console.log('starting server now');
            AssetMgmtServer = await require('../bin/assetmgmt');
            //TODO: how to wait for the server tobe up here?
            await delay(15000);
        }
    } catch (e) {
        console.log(e);
        isAlreadyRunning = false;
        console.log(e + ' - starting server now');
        AssetMgmtServer = await require('../bin/assetmgmt');
        //TODO: how to wait for the server tobe up here?
        await delay(15000);
    }
}, 30000);

afterAll(async () => {
    if (!isAlreadyRunning) {
        AssetMgmtServer.close();
    }
});

/*
describe('GET ' + HealthBaseRoute, () => {
    it(' >>> should return success 200', async () => {
        const response = await Request(AssetMgmtBaseRoute).get(HealthBaseRoute);
        const responseBody = response._body;
        const testDetails = expect.getState().currentTestName;
        const responseBody = response._body;
        const testDetails = expect.getState().currentTestName;
        let sNo = '' + tSNo + '.' + sTSNo;
        // eslint-disable-next-line no-useless-catch
        try {
            expect(responseBody.code).toBe(200);
        } catch (error) {
            throw (error);
        }
    });
});
*/

////////////////////////////
//req_i_b = request body that should result in failure
//req_v_b =  request body that should result in success
//res_i_b - failure response body
//res_v_b - success response body
////////////////////////////

const reqRegisterGenericData = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration',
    }
};

///////////////////////////////////////////////////////////////////////////////////
//**********************************/otp*****************************************//
async function failedOtpReqValidationError(sNo, testDetails, reqBody) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/otp').send(reqBody);
    const expectedSubCode = ReqValidationError.SUBCODE;
    testDetails += 'error code 400; subCode ' + expectedSubCode + '(req validation error)';
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_BAD_REQUEST);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }
    return resBody;
}

async function failedOtpAccountLocked(sNo, testDetails, reqBody) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/otp').send(reqBody);
    const expectedSubCode = UserOtpError.ERROR_TOO_MANY_ATTEMPTS_LOCKED.SUBCODE;
    testDetails += 'error code 400; subCode ' + expectedSubCode + '(too many attempts, account is locked)';
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_BAD_REQUEST);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }
    return resBody;
}

async function successfulOtp(sNo, testDetails, reqBody, expectedRemainingAttempts) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/otp').send(reqBody);
    testDetails += 'success code ' + HTTP_OK + '; remainingAttempts ' + THREE + '; status ' + UserStatusRegistering;
    const resBody = response._body;

    try {
        expect(resBody.code).toBe(HTTP_OK);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_OK, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_OK, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.data.otpToken.remainingAttempts).toBe(expectedRemainingAttempts);
        printReqResToCSV(response, sNo, testDetails, 'data.otpToken.remainingAttempts', expectedRemainingAttempts, resBody.data.otpToken.remainingAttempts, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'data.otpToken.remainingAttempts', expectedRemainingAttempts, resBody.data.otpToken.remainingAttempts, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.data.state.state).toBe(UserStatusRegistering);
        printReqResToCSV(response, sNo, testDetails, 'data.state.state', UserStatusRegistering, resBody.data.state.state, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'data.state.state', UserStatusRegistering, resBody.data.state.state, 'Failed');
        throw (error);
    }
    return resBody;
}

async function failedOtpNotRegisteringState(sNo, testDetails, reqBody) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/otp').send(reqBody);
    const expectedSubCode = UserOtpError.ERROR_USER_NOT_REGISTERING_STATE.SUBCODE;
    testDetails += 'error code 400; subCode ' + expectedSubCode + '(account not in registering status)';
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_BAD_REQUEST);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }
    return resBody;
}
async function failedOtpAlreadyExistingKey(sNo, testDetails, reqBody) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/otp').send(reqBody);
    const expectedSubCode = CommonMongoKeyAlreadyExistingError;
    testDetails += 'error code 400; subCode ' + expectedSubCode + '(provided phone or email is already in use)';
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_BAD_REQUEST);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }
    return resBody;
}
async function failedOtpErrorInGeneration(sNo, testDetails, reqBody) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/otp').send(reqBody);
    const expectedSubCode = UserOtpError.ERROR_GEN.SUBCODE;
    testDetails += 'error code 400; subCode ' + expectedSubCode + '(error in generating Otp)';
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_BAD_REQUEST);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }
    return resBody;
}
//******************************************************************************//

const req_i_b_Otp_Empty = {
};

describe('POST ' + UserBaseRoute + '/otp with neither phone nor email', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedOtpReqValidationError(sNo, testDetails, req_i_b_Otp_Empty);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const req_i_b_Otp_WrongPhoneDataCc = {
    phone: {
        cc1: '+91',
        number: '8765432101'
    },
    type: 'registration'
};

describe('POST ' + UserBaseRoute + '/otp with wrong phone', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedOtpReqValidationError(sNo, testDetails, req_i_b_Otp_WrongPhoneDataCc);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const req_i_b_Otp_InvalidPhone = {
    phone: {
        cc: '+91',
        number: '87'
    },
    type: 'registration'
};

describe('POST ' + UserBaseRoute + '/otp with invalid phone number', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedOtpReqValidationError(sNo, testDetails, req_i_b_Otp_InvalidPhone);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const req_i_b_Otp_InvalidEmail = {
    email: 'abc',
    type: 'registration'
};

describe('POST ' + UserBaseRoute + '/otp with invalid email', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedOtpReqValidationError(sNo, testDetails, req_i_b_Otp_InvalidEmail);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const req_i_b_Otp_NoType = {
    phone: {
        cc: '+91',
        number: '8765432101'
    },
};

describe('POST ' + UserBaseRoute + '/otp with no req.body.type', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedOtpReqValidationError(sNo, testDetails, req_i_b_Otp_NoType);
    });
});

//////////////////////////////////////////////////////////////////////////////////
//*******************************/register**************************************//
async function failedRegisterAuthenticationError(sNo, testDetails, reqBody, _id) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/register/' + _id).send(reqBody);
    const expectedSubCode = AuthenticationError.AUTHENTICATION_ERROR.SUBCODE;
    testDetails += 'error code 409; subCode ' + expectedSubCode + '(req validation error)';
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_BAD_REQUEST);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }
    return resBody;
}
async function failedRegisterReqValidationError(sNo, testDetails, reqBody, _id) {


    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/register/' + _id).send(reqBody);
    const expectedSubCode = ReqValidationError.SUBCODE;
    testDetails += 'error code 400; subCode ' + expectedSubCode + '(req validation error)';
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_BAD_REQUEST);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }
    return resBody;
}
async function failedRegisterUserIdNotFound(sNo, testDetails, reqBody, _id) {

    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/register/' + _id).send(reqBody);
    const expectedSubCode = AuthenticationError.USER_NOT_FOUND.SUBCODE;
    testDetails += 'error code 401; subCode ' + expectedSubCode + '(user Id not found)';
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_UNAUTHORIZED);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }
    return resBody;
}

async function failedRegisterUserNotRegisteringState(sNo, testDetails, reqBody, _id) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/register/' + _id).send(reqBody);
    const expectedSubCode = UserRegisterError.ERROR_USER_NOT_REGISTERING_STATE.SUBCODE;
    testDetails += 'error code 400; subCode ' + expectedSubCode + '(user is not in registering state)';
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_BAD_REQUEST);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }
    return resBody;
}

async function failedRegisterAttemptModifyingId(sNo, testDetails, reqBody, _id) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/register/' + _id).send(reqBody);
    var expectedSubCode;
    if (reqBody.phone) {
        expectedSubCode = UserRegisterError.ERROR_PHONE_USED_AS_ID.SUBCODE;
        testDetails += 'error code 400; subCode ' + expectedSubCode + '(phone cannot be updated as it is in use as id)';
    } else if (reqBody.email) {
        expectedSubCode = UserRegisterError.ERROR_EMAIL_USED_AS_ID.SUBCODE;
        testDetails += 'error code 400; subCode ' + expectedSubCode + '(email cannot be updated as it is in use as id)';
    }

    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_BAD_REQUEST);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }
    return resBody;
}

async function failedRegisterAlreadyExistingKey(sNo, testDetails, reqBody, _id) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/register/' + _id).send(reqBody);
    var expectedSubCode;
    expectedSubCode = CommonMongoKeyAlreadyExistingError;

    testDetails += 'error code 400; subCode ' + expectedSubCode + '(provided phone or email already existing)';
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_BAD_REQUEST);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }
    return resBody;
}

async function failedRegisterWrongOtp(sNo, testDetails, reqBody, _id, remainingAttempts) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/register/' + _id).send(reqBody);
    var expectedSubCode;
    if (remainingAttempts == TWO) {
        expectedSubCode = UserRegisterError.ERROR_INCORRECT_OTP.SUBCODE;
        testDetails += 'error code 400; subCode ' + expectedSubCode + '(incorrect otp)';
    } else if (remainingAttempts == ONE) {
        expectedSubCode = UserRegisterError.ERROR_INCORRECT_OTP.SUBCODE;
        testDetails += 'error code 400; subCode ' + expectedSubCode + '(incorrect otp)';
    } else if (remainingAttempts == ZERO) {
        expectedSubCode = UserRegisterError.ERROR_INCORRECT_OTP_LOCKED.SUBCODE;
        testDetails += 'error code 400; subCode ' + expectedSubCode + '(incorrect otp, account locked)';
    }

    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_BAD_REQUEST);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.data.remainingAttempts).toBe(remainingAttempts);
        printReqResToCSV(response, sNo, testDetails, 'data.remainingAttempts', remainingAttempts, resBody.data.remainingAttempts, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'data.remainingAttempts', remainingAttempts, resBody.data.remainingAttempts, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }
    return resBody;
}
async function failedRegisterWrongProfileDataNotFoundError(sNo, testDetails, reqBody, _id) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/register/' + _id).send(reqBody);
    //const expectedSubCode = ReqValidationError.SUBCODE;
    const expectedSubCode = MongoError.ERROR_VALIDATION.SUBCODE;
    testDetails += 'error code 400; subCode ' + expectedSubCode + '(req validation error)';
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_BAD_REQUEST);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }
    return resBody;
}

async function failedRegisterWrongProfileDataError(sNo, testDetails, reqBody, _id) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/register/' + _id).send(reqBody);
    const expectedSubCode = MongoError.ERROR_VALIDATION.SUBCODE;
    testDetails += 'error code 400; subCode ' + expectedSubCode + '(req validation error)';
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_BAD_REQUEST);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }
    return resBody;
}

async function successfulRegisterPhoneBased(sNo, testDetails, reqBody, _id, identifierId) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/register/' + _id).send(reqBody);
    testDetails += 'success code 200; phone identifier; status ' + UserStatusActiveNeverLoggedIn;
    const resBody = response._body;

    try {
        expect(resBody.code).toBe(200);
        printReqResToCSV(response, sNo, testDetails, 'code', 200, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', 200, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.data.identifier.id).toBe(identifierId);
        printReqResToCSV(response, sNo, testDetails, 'data.identifier.id', identifierId, resBody.data.identifier.id, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'data.identifier.id', identifierId, resBody.data.identifier.id, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.data.identifier.type).toBe('phone');
        printReqResToCSV(response, sNo, testDetails, 'data.identifier.type', 'phone', resBody.data.identifier.type, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'data.identifier.type', 'phone', resBody.data.identifier.type, 'Failed');
        throw (error);
    }
    if (reqBody.email) {
        try {
            expect(resBody.data.email.email).toBe(reqBody.email);
            printReqResToCSV(response, sNo, testDetails, 'data.email.email', reqBody.email, resBody.data.email.email, 'Passed');
        } catch (error) {
            printReqResToCSV(response, sNo, testDetails, 'data.email.email', reqBody.email, resBody.data.email.email, 'Failed');
            throw (error);
        }
    }
    try {
        expect(resBody.data.state.state).toBe(UserStatusActiveNeverLoggedIn);
        printReqResToCSV(response, sNo, testDetails, 'data.state.state', UserStatusActiveNeverLoggedIn, resBody.data.state.state, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'data.state.state', UserStatusActiveNeverLoggedIn, resBody.data.state.state, 'Failed');
        throw (error);
    }
    return resBody;
}

async function successfulRegisterEmailBased(sNo, testDetails, reqBody, _id, identifierId) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/register/' + _id).send(reqBody);
    testDetails += 'success code 200; email identifier; status ' + UserStatusActiveNeverLoggedIn;
    const resBody = response._body;

    try {
        expect(resBody.code).toBe(200);
        printReqResToCSV(response, sNo, testDetails, 'code', 200, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', 200, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.data.identifier.id).toBe(identifierId);
        printReqResToCSV(response, sNo, testDetails, 'data.identifier.id', identifierId, resBody.data.identifier.id, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'data.identifier.id', identifierId, resBody.data.identifier.id, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.data.identifier.type).toBe('email');
        printReqResToCSV(response, sNo, testDetails, 'data.identifier.type', 'email', resBody.data.identifier.type, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'data.identifier.type', 'email', resBody.data.identifier.type, 'Failed');
        throw (error);
    }
    if (reqBody.phone) {
        try {
            expect(compareJsonObject(resBody.data.phone, reqBody.phone)).toBe(true);
            printReqResToCSV(response, sNo, testDetails, 'data.data.phone', reqBody.phone, resBody.data.phone, 'Passed');
        } catch (error) {
            printReqResToCSV(response, sNo, testDetails, 'data.data.phone', reqBody.phone, resBody.data.phone, 'Failed');
            throw (error);
        }
    }
    try {
        expect(resBody.data.state.state).toBe(UserStatusActiveNeverLoggedIn);
        printReqResToCSV(response, sNo, testDetails, 'data.state.state', UserStatusActiveNeverLoggedIn, resBody.data.state.state, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'data.state.state', UserStatusActiveNeverLoggedIn, resBody.data.state.state, 'Failed');
        throw (error);
    }
    return resBody;
}

//******************************************************************************//

const reqOtpPhone001 = {
    phone: {
        cc: '+91',
        number: '8765432001'
    },
    type: 'registration'
};

let resOtpPhone001 = {};

const reqRegisterPhone001 = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    otpToken: {
        type: 'registration',
    }
};

describe('POST ' + UserBaseRoute + '/register with wrong _id', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpPhone001 = await successfulOtp(sNo, testDetails, reqOtpPhone001, THREE);
    });
    it(' >>> (/register with wrong _id)', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        reqRegisterPhone001.otpToken = {};
        reqRegisterPhone001.otpToken.otp = resOtpPhone001.data.otpToken.otp;
        await failedRegisterAuthenticationError(sNo, testDetails, reqRegisterPhone001, 'hello');
    });
});

//////////////////////////////////////////////////////////////////////////////////
const reqRegisterPhoneWrongId = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration',
    }
};

describe('POST ' + UserBaseRoute + '/register with non existing _id', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        reqRegisterPhoneWrongId.otpToken.otp = resOtpPhone001.data.otpToken.otp;
        await failedRegisterUserIdNotFound(sNo, testDetails, reqRegisterPhoneWrongId, '659e68fd11fbdaec09175886');
    });
});

//////////////////////////////////////////////////////////////////////////////////
const reqRegisterPhoneNoOtp = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    phone: {
        cc: '+91',
        number: '8765432101',
    },
    otpToken: {
        type: 'registration'
    }
};

describe('POST ' + UserBaseRoute + '/register with no otp', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedRegisterReqValidationError(sNo, testDetails, reqRegisterPhoneNoOtp, resOtpPhone001.data._id);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const reqRegisterPhoneNoPassword = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    otpToken: {
        type: 'registration'
    }
};

//describe('POST ' + UserBaseRoute + '/register with no password or otp', () => {
//    beforeAll(async () => {
//        tSNo += 1;
//        sTSNo = 0;
//    });
//    it(' >>> ', async () => {
//        sTSNo = sTSNo + 1;
//        let sNo = '' + tSNo + '.' + sTSNo;
//        const testDetails = expect.getState().currentTestName;

//        reqRegisterPhoneNoPassword.otpToken.otp = resOtpPhone001.data.otpToken.otp;
//        await failedRegisterReqValidationError(sNo, testDetails, reqRegisterPhoneNoPassword, resOtpPhone001.data._id);
//    });

//});

//////////////////////////////////////////////////////////////////////////////////
const reqRegisterPhoneEmptyPassword = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    password: '',
    otpToken: {
        type: 'registration'
    }
};

//describe('POST ' + UserBaseRoute + '/register with blank password', () => {
//    beforeAll(async () => {
//        tSNo += 1;
//        sTSNo = 0;
//    });
//    it(' >>> ', async () => {
//        sTSNo = sTSNo + 1;
//        let sNo = '' + tSNo + '.' + sTSNo;
//        const testDetails = expect.getState().currentTestName;

//        reqRegisterPhoneEmptyPassword.otpToken.otp = resOtpPhone001.data.otpToken.otp;
//        await failedRegisterReqValidationError(sNo, testDetails, reqRegisterPhoneEmptyPassword, resOtpPhone001.data._id);
//    });
//});

//////////////////////////////////////////////////////////////////////////////////
const reqOtpPhone002 = {
    phone: {
        cc: '+91',
        number: '8765432002'
    },
    type: 'registration'
};

let resOtpPhone002 = {};

describe('POST ' + UserBaseRoute + '/otp with valid phone - repeatedly to exhaust the attempts', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (first attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpPhone002 = await successfulOtp(sNo, testDetails, reqOtpPhone002, THREE);
    });
    it(' >>> (second attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpPhone002 = await successfulOtp(sNo, testDetails, reqOtpPhone002, TWO);
    });
    it(' >>> (third attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpPhone002 = await successfulOtp(sNo, testDetails, reqOtpPhone002, ONE);
    });
    it(' >>> (fourth attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedOtpAccountLocked(sNo, testDetails, reqOtpPhone002);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const reqOtpEmail002 = {
    email: 'test.user002@borqs.io',
    type: 'registration'
};

let resOtpEmail002 = {};

describe('POST ' + UserBaseRoute + '/otp with valid email - repeatedly to exhaust the attempts', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (first attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpEmail002 = await successfulOtp(sNo, testDetails, reqOtpEmail002, THREE);
    });
    it(' >>> (second attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpEmail002 = await successfulOtp(sNo, testDetails, reqOtpEmail002, TWO);
    });
    it(' >>> (third attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpEmail002 = await successfulOtp(sNo, testDetails, reqOtpEmail002, ONE);
    });
    it(' >>> (fourth attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedOtpAccountLocked(sNo, testDetails, reqOtpEmail002);
    });
});

//////////////////////////////////////////////////////////////////////////////////

const reqRegisterLockedPhoneUser = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    otpToken: {
        type: 'registration',
    },
    password: 'Borqs@1234',
};

describe('POST ' + UserBaseRoute + '/register for phone based user in locked state', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        reqRegisterLockedPhoneUser.otpToken.otp = resOtpPhone002.data.otpToken.otp;
        await failedRegisterUserNotRegisteringState(sNo, testDetails, reqRegisterLockedPhoneUser, resOtpPhone002.data._id);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const reqRegisterLockedEmailUser = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    otpToken: {
        type: 'registration',
    },
    password: 'Borqs@1234',
};

describe('POST ' + UserBaseRoute + '/register for email based user in locked state', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        reqRegisterLockedEmailUser.otpToken.otp = resOtpEmail002.data.otpToken.otp;
        await failedRegisterUserNotRegisteringState(sNo, testDetails, reqRegisterLockedEmailUser, resOtpEmail002.data._id);
    });
});

//////////////////////////////////////////////////////////////////////////////////

const reqOtpPhone003 = {
    phone: {
        cc: '+91',
        number: '8765432003'
    },
    type: 'registration'
};

let resOtpPhone003 = {};

const reqRegisterPhone003 = {
    phone: {
        cc: '+91',
        number: '8765432200'
    },
    password: 'Borqs@1234',
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    otpToken: {
        type: 'registration',
    }
};

describe('POST ' + UserBaseRoute + '/register attempting to modify phone - for phone based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>>  (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpPhone003 = await successfulOtp(sNo, testDetails, reqOtpPhone003, THREE);
    });
    it(' >>> (/register attempting to modify phone)', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        reqRegisterPhone003.otpToken.otp = resOtpPhone003.data.otpToken.otp;
        await failedRegisterAttemptModifyingId(sNo, testDetails, reqRegisterPhone003, resOtpPhone003.data._id);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const reqOtpEmail003 = {
    email: 'test.user003@borqs.io',
    type: 'registration'
};

let resOtpEmail003 = {};

const reqRegisterEmail003 = {
    email: 'test.user000@borqs.io',
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration'
    }
};

describe('POST ' + UserBaseRoute + '/register attempting to modify email - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpEmail003 = await successfulOtp(sNo, testDetails, reqOtpEmail003, THREE);
    });
    it(' >>> (/register attempting to modify email)', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        reqRegisterEmail003.otpToken.otp = resOtpEmail003.data.otpToken.otp;
        await failedRegisterAttemptModifyingId(sNo, testDetails, reqRegisterEmail003, resOtpEmail003.data._id);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const reqOtpPhone0031 = {
    phone: {
        cc: '+91',
        number: '87654320031'
    },
    type: 'registration'
};

let resOtpPhone0031 = {};

const incorrectProfileDataNotFound = {
    name: {
        middleName: 'Middle',
        lastName: 'Last'
    },
    dob: '01-01-20000',
    gender: 'Male1'
};

const incorrectProfileData = {
    name: {
        firstName: 'First',
        middleName: 'Middle',
        lastName: 'Last'
    },
    dob: '01-01-20000',
    gender: 'Male1'
};

const correctProfileData = {
    name: {
        firstName: 'First',
        middleName: 'Middle',
        lastName: 'Last'
    },
    dob: '01-01-2000',
    gender: 'Male'
};


const reqRegisterPhone0031 = {
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration',
    }
};

describe('POST ' + UserBaseRoute + '/register with incorrect profile data - for phone based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>>  (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpPhone0031 = await successfulOtp(sNo, testDetails, reqOtpPhone0031, THREE);
    });
    it(' >>> (/register with incorrect profile data)', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        reqRegisterPhone0031.otpToken.otp = resOtpPhone0031.data.otpToken.otp;
        reqRegisterPhone0031.profileData = incorrectProfileDataNotFound;
        await failedRegisterWrongProfileDataNotFoundError(sNo, testDetails, reqRegisterPhone0031, resOtpPhone0031.data._id);
    });
});

describe('POST ' + UserBaseRoute + '/register with correct profile data - for phone based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>>  (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpPhone0031 = await successfulOtp(sNo, testDetails, reqOtpPhone0031, TWO);
    });
    it(' >>> (/register with correct profile data)', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        reqRegisterPhone0031.otpToken.otp = resOtpPhone0031.data.otpToken.otp;
        reqRegisterPhone0031.profileData = correctProfileData;
        await successfulRegisterPhoneBased(sNo, testDetails, reqRegisterPhone0031, resOtpPhone0031.data._id, resOtpPhone0031.data.phone.cc + resOtpPhone0031.data.phone.number);
    });
});


//////////////////////////////////////////////////////////////////////////////////
const reqOtpEmail0031 = {
    email: 'test.user0031@borqs.io',
    type: 'registration'
};

let resOtpEmail0031 = {};

const reqRegisterEmail0031 = {
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration'
    }
};

describe('POST ' + UserBaseRoute + '/register with incorrect profile data - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpEmail0031 = await successfulOtp(sNo, testDetails, reqOtpEmail0031, THREE);
    });
    it(' >>> (/register with incorrect profile data)', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        reqRegisterEmail0031.otpToken.otp = resOtpEmail0031.data.otpToken.otp;
        reqRegisterEmail0031.profileData = incorrectProfileData;
        await failedRegisterWrongProfileDataError(sNo, testDetails, reqRegisterEmail0031, resOtpEmail0031.data._id);
    });
});

describe('POST ' + UserBaseRoute + '/register with corect profile data - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpEmail0031 = await successfulOtp(sNo, testDetails, reqOtpEmail0031, TWO);
    });
    it(' >>> (/register with correct profile data)', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        reqRegisterEmail0031.otpToken.otp = resOtpEmail0031.data.otpToken.otp;
        reqRegisterEmail0031.profileData = correctProfileData;

        await successfulRegisterEmailBased(sNo, testDetails, reqRegisterEmail0031, resOtpEmail0031.data._id, resOtpEmail0031.data.email.email);
    });
});

//////////////////////////////////////////////////////////////////////////////////




const reqOtpPhone004 = {
    phone: {
        cc: '+91',
        number: '8765432004'
    },
    type: 'registration'
};

let resOtpPhone004 = {};

describe('POST ' + UserBaseRoute + '/register with wrong otp repeatedly to exhaust the attempts - for phone based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpPhone004 = await successfulOtp(sNo, testDetails, reqOtpPhone004, THREE);
    });
    it(' >>> (first attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterGenericData;
        reqRegisterGeneric.otpToken.otp = resOtpPhone004.data.otpToken.otp + 1;
        await failedRegisterWrongOtp(sNo, testDetails, reqRegisterGeneric, resOtpPhone004.data._id, TWO);
    });
    it(' >>> (second attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterGenericData;
        reqRegisterGeneric.otpToken.otp = resOtpPhone004.data.otpToken.otp + 1;
        await failedRegisterWrongOtp(sNo, testDetails, reqRegisterGeneric, resOtpPhone004.data._id, ONE);
    });
    it(' >>> (third attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterGenericData;
        reqRegisterGeneric.otpToken.otp = resOtpPhone004.data.otpToken.otp + 1;
        await failedRegisterWrongOtp(sNo, testDetails, reqRegisterGeneric, resOtpPhone004.data._id, ZERO);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const reqOtpEmail004 = {
    email: 'test.user004@borqs.io',
    type: 'registration'
};

let resOtpEmail004 = {};

describe('POST ' + UserBaseRoute + '/register with wrong otp repeatedly to exhaust the attempts - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpEmail004 = await successfulOtp(sNo, testDetails, reqOtpEmail004, THREE);
    });
    it(' >>> (first attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterGenericData;
        reqRegisterGeneric.otpToken.otp = resOtpEmail004.data.otpToken.otp + 1;
        await failedRegisterWrongOtp(sNo, testDetails, reqRegisterGeneric, resOtpEmail004.data._id, TWO);
    });
    it(' >>> (second attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterGenericData;
        reqRegisterGeneric.otpToken.otp = resOtpEmail004.data.otpToken.otp + 1;
        await failedRegisterWrongOtp(sNo, testDetails, reqRegisterGeneric, resOtpEmail004.data._id, ONE);
    });
    it(' >>> (third attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterGenericData;
        reqRegisterGeneric.otpToken.otp = resOtpEmail004.data.otpToken.otp + 1;
        await failedRegisterWrongOtp(sNo, testDetails, reqRegisterGeneric, resOtpEmail004.data._id, ZERO);
    });
});

//////////////////////////////////////////////////////////////////////////////////

const reqOtpPhone005 = {
    phone: {
        cc: '+91',
        number: '8765432005'
    },
    type: 'registration'
};

let resOtpPhone005 = {};

const reqRegisterPhone005 = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration',
    }
};

let resRegisterPhone005 = {};

describe('POST ' + UserBaseRoute + '/register by adding email, in first attempt - for phone based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpPhone005 = await successfulOtp(sNo, testDetails, reqOtpPhone005, THREE);
    });
    it(' >>> (/register by adding email)', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterPhone005;
        reqRegisterGeneric.otpToken.otp = resOtpPhone005.data.otpToken.otp;
        reqRegisterGeneric.email = 'test.phone.user005@borqs.io';
        resRegisterPhone005 = await successfulRegisterPhoneBased(sNo, testDetails, reqRegisterGeneric, resOtpPhone005.data._id, reqOtpPhone005.phone.cc + reqOtpPhone005.phone.number);
    });
});



//////////////////////////////////////////////////////////////////////////////////


const reqOtpEmail005 = {
    email: 'test.user005@borqs.io',
    type: 'registration'
};

let resOtpEmail005 = {};

const reqRegisterEmail005 = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration',
    }
};

let resRegisterEmail005 = {};

describe('POST ' + UserBaseRoute + '/register by adding phone in first attempt - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpEmail005 = await successfulOtp(sNo, testDetails, reqOtpEmail005, THREE);
    });
    it(' >>> (/register by adding email)', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterEmail005;
        reqRegisterGeneric.otpToken.otp = resOtpEmail005.data.otpToken.otp;
        reqRegisterGeneric.phone = { cc: '+91', number: '8765433300' };
        resRegisterEmail005 = await successfulRegisterEmailBased(sNo, testDetails, reqRegisterGeneric, resOtpEmail005.data._id, reqOtpEmail005.email);
    });
});

//////////////////////////////////////////////////////////////////////////////////

describe('POST ' + UserBaseRoute + '/otp with existing id phone in active state - for phone user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedOtpNotRegisteringState(sNo, testDetails, reqOtpPhone005);
    });
});

//////////////////////////////////////////////////////////////////////////////////
describe('POST ' + UserBaseRoute + '/otp with existing non-id email in active state - for phone user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqBody = {
            email: resRegisterPhone005.data.email.email,
            type: 'registration'
        };
        await failedOtpAlreadyExistingKey(sNo, testDetails, reqBody);
    });
});

//////////////////////////////////////////////////////////////////////////////////
describe('POST ' + UserBaseRoute + '/otp with existing id email in active state - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedOtpNotRegisteringState (sNo, testDetails, reqOtpEmail005);
    });
});

//////////////////////////////////////////////////////////////////////////////////
describe('POST ' + UserBaseRoute + '/otp with existing non-id phone in active state - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqBody = {
            phone: {
                cc: resRegisterEmail005.data.phone.cc,
                number: resRegisterEmail005.data.phone.number
            },
            type: 'registration'
        };
        await failedOtpAlreadyExistingKey(sNo, testDetails, reqBody);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const reqOtpPhone006 = {
    phone: {
        cc: '+91',
        number: '8765432006'
    },
    type: 'registration'
};

let resOtpPhone006 = {};

const reqRegisterPhone006 = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration',
    }
};

describe('POST ' + UserBaseRoute + '/register in second attempt - for phone based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpPhone006 = await successfulOtp(sNo, testDetails, reqOtpPhone006, THREE);
    });
    it(' >>> (first attempt with wrong otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterPhone006;
        reqRegisterGeneric.otpToken.otp = resOtpPhone006.data.otpToken.otp + '1';
        await failedRegisterWrongOtp(sNo, testDetails, reqRegisterGeneric, resOtpPhone006.data._id, TWO);
    });
    it(' >>> (second attempt with right otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterPhone006;
        reqRegisterGeneric.otpToken.otp = resOtpPhone006.data.otpToken.otp;
        resRegisterPhone005 = await successfulRegisterPhoneBased(sNo, testDetails, reqRegisterGeneric, resOtpPhone006.data._id, reqOtpPhone006.phone.cc + reqOtpPhone006.phone.number);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const reqOtpEmail006 = {
    email: 'test.user006@borqs.io',
    type: 'registration'
};

let resOtpEmail006 = {};

const reqRegisterEmail006 = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    phone: {
        cc: '+91',
        number: '8765432141'
    },
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration',
    }
};

describe('POST ' + UserBaseRoute + '/register in second attempt - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpEmail006 = await successfulOtp(sNo, testDetails, reqOtpEmail006, THREE);
    });
    it(' >>> (first attempt with wrong otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterEmail006;
        reqRegisterGeneric.otpToken.otp = resOtpEmail006.data.otpToken.otp + '1';
        await failedRegisterWrongOtp(sNo, testDetails, reqRegisterGeneric, resOtpEmail006.data._id, TWO);
    });
    it(' >>> (second attempt with right otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterEmail006;
        reqRegisterGeneric.otpToken.otp = resOtpEmail006.data.otpToken.otp;
        await successfulRegisterEmailBased(sNo, testDetails, reqRegisterGeneric, resOtpEmail006.data._id, reqOtpEmail006.email);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const reqOtpPhone007 = {
    phone: {
        cc: '+91',
        number: '8765432007'
    },
    type: 'registration'
};

let resOtpPhone007 = {};

const reqRegisterPhone007 = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration',
    }
};

describe('POST ' + UserBaseRoute + '/register with right otp in third attempt - for phone based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpPhone007 = await successfulOtp(sNo, testDetails, reqOtpPhone007, THREE);
    });
    it(' >>> (first attempt with wrong otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterPhone007;
        reqRegisterGeneric.otpToken.otp = resOtpPhone007.data.otpToken.otp + '1';
        await failedRegisterWrongOtp(sNo, testDetails, reqRegisterGeneric, resOtpPhone007.data._id, TWO);
    });
    it(' >>> (second attempt with wrong otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterPhone007;
        reqRegisterGeneric.otpToken.otp = resOtpPhone007.data.otpToken.otp + '1';
        await failedRegisterWrongOtp(sNo, testDetails, reqRegisterGeneric, resOtpPhone007.data._id, ONE);
    });
    it(' >>> (third attempt with right otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterPhone007;
        reqRegisterGeneric.otpToken.otp = resOtpPhone007.data.otpToken.otp;
        resRegisterPhone005 = await successfulRegisterPhoneBased(sNo, testDetails, reqRegisterGeneric, resOtpPhone007.data._id, reqOtpPhone007.phone.cc + reqOtpPhone007.phone.number);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const reqOtpEmail007 = {
    email: 'test.user007@borqs.io',
    type: 'registration'
};

let resOtpEmail007 = {};

const reqRegisterEmail007 = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration',
    }
};


describe('POST ' + UserBaseRoute + '/register with right otp in third attempt - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpEmail007 = await successfulOtp(sNo, testDetails, reqOtpEmail007, THREE);
    });
    it(' >>> (first attempt with wrong otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterEmail007;
        reqRegisterGeneric.otpToken.otp = resOtpEmail007.data.otpToken.otp + '1';
        await failedRegisterWrongOtp(sNo, testDetails, reqRegisterGeneric, resOtpEmail007.data._id, TWO);
    });
    it(' >>> (second attempt with wrong otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterEmail007;
        reqRegisterGeneric.otpToken.otp = resOtpEmail007.data.otpToken.otp + '1';
        await failedRegisterWrongOtp(sNo, testDetails, reqRegisterGeneric, resOtpEmail007.data._id, ONE);
    });
    it(' >>> (third attempt with right otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterEmail007;
        reqRegisterGeneric.otpToken.otp = resOtpEmail007.data.otpToken.otp;
        await successfulRegisterEmailBased(sNo, testDetails, reqRegisterGeneric, resOtpEmail007.data._id, resOtpEmail007.data.email.email);
    });
});

//////////////////////////////////////////////////////////////////////////////////

const reqOtpPhone008 = {
    phone: {
        cc: '+91',
        number: '8765432008'
    },
    type: 'registration'
};

let resOtpPhone008 = {};

const reqRegisterPhone008 = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration',
    }
};

describe('POST ' + UserBaseRoute + '/register with invalid email - for phone based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpPhone008 = await successfulOtp(sNo, testDetails, reqOtpPhone008, THREE);
    });
    it(' >>> (/register with invalid email) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterPhone008;
        reqRegisterGeneric.otpToken.otp = resOtpPhone008.data.otpToken.otp;
        reqRegisterGeneric.email = 'abc';
        await failedRegisterReqValidationError(sNo, testDetails, reqRegisterGeneric, resOtpPhone008.data._id);
    });
});

//////////////////////////////////////////////////////////////////////////////////

describe('POST ' + UserBaseRoute + '/register with valid email - for phone based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpPhone008 = await successfulOtp(sNo, testDetails, reqOtpPhone008, TWO);
    });
    it(' >>> (/register with valid email) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterPhone008;
        reqRegisterGeneric.otpToken.otp = resOtpPhone008.data.otpToken.otp;
        reqRegisterGeneric.email = 'abc@xyz.com';
        await successfulRegisterPhoneBased(sNo, testDetails, reqRegisterGeneric, resOtpPhone008.data._id, resOtpPhone008.data.phone.cc + resOtpPhone008.data.phone.number);
    });
});

//////////////////////////////////////////////////////////////////////////////////

const reqOtpEmail008 = {
    email: 'test.user008@borqs.io',
    type: 'registration'
};

let resOtpEmail008 = {};

const reqRegisterEmail008 = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration',
    }
};

describe('POST ' + UserBaseRoute + '/register with invalid phone - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpEmail008 = await successfulOtp(sNo, testDetails, reqOtpEmail008, THREE);
    });
    it(' >>> (/register with invalid phone) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterEmail008;
        reqRegisterGeneric.otpToken.otp = resOtpEmail008.data.otpToken.otp;
        reqRegisterGeneric.phone = {cc: '+91', number: '876543210999999'};
        await failedRegisterReqValidationError(sNo, testDetails, reqRegisterGeneric, resOtpEmail008.data._id);
    });
});

//////////////////////////////////////////////////////////////////////////////////
describe('POST ' + UserBaseRoute + '/register with valid phone - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpEmail008 = await successfulOtp(sNo, testDetails, reqOtpEmail008, TWO);
    });
    it(' >>> (/register with valid phone) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterEmail008;
        reqRegisterGeneric.otpToken.otp = resOtpEmail008.data.otpToken.otp;
        delete reqRegisterGeneric.email;
        reqRegisterGeneric.phone = { cc: '+91', number: '6655443322' };
        await successfulRegisterEmailBased(sNo, testDetails, reqRegisterGeneric, resOtpEmail008.data._id, resOtpEmail008.data.email.email);
    });
});

//////////////////////////////////////////////////////////////////////////////////

const reqOtpPhone009 = {
    phone: {
        cc: '+91',
        number: '8765432009'
    },
    type: 'registration'
};

let resOtpPhone009 = {};

const reqRegisterPhone009 = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration',
    }
};

describe('POST ' + UserBaseRoute + '/register with non-id email already used in id - for phone based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpPhone009 = await successfulOtp(sNo, testDetails, reqOtpPhone009, THREE);
    });
    it(' >>> (/register with non-id email already used in id) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterPhone009;
        reqRegisterGeneric.otpToken.otp = resOtpPhone009.data.otpToken.otp;
        reqRegisterGeneric.email = reqOtpEmail005.email;
        await failedRegisterAlreadyExistingKey(sNo, testDetails, reqRegisterGeneric, resOtpPhone009.data._id);
    });
});

//////////////////////////////////////////////////////////////////////////////////

const reqOtpEmail009 = {
    email: 'test.user009@borqs.io',
    type: 'registration'
};

let resOtpEmail009 = {};

const reqRegisterEmail009 = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration',
    }
};


describe('POST ' + UserBaseRoute + '/register with non-id phone already used in id - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpEmail009 = await successfulOtp(sNo, testDetails, reqOtpEmail009, THREE);
    });
    it(' >>> (/register with non-id phone already used in id) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        let reqRegisterGeneric = reqRegisterEmail009;
        reqRegisterGeneric.otpToken.otp = resOtpEmail009.data.otpToken.otp;
        reqRegisterGeneric.phone = reqOtpPhone005.phone;
        await failedRegisterAlreadyExistingKey(sNo, testDetails, reqRegisterGeneric, resOtpEmail009.data._id);
    });
});
//////////////////////////////////////////////////////////////////////////////////
//******************************/login******************************************//
async function failedLoginReqValidationError(sNo, testDetails, reqBody) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/login').send(reqBody);
    const expectedSubCode = ReqValidationError.SUBCODE;
    testDetails += 'error code 400; subCode ' + expectedSubCode + '(req validation error)';
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_BAD_REQUEST);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.code, 'Failed');
        throw (error);
    }
    return resBody;
}

async function failedLoginReqAuthError(sNo, testDetails, reqBody) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/login').send(reqBody);
    const expectedSubCode = ReqValidationError.SUBCODE;
    testDetails += 'error code 400; subCode ' + expectedSubCode + '(req validation error)';
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_UNAUTHORIZED);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.code, 'Failed');
        throw (error);
    }
    return resBody;
}

async function failedLoginWrongPasswordError(sNo, testDetails, reqBody, remainingAttempts) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/login').send(reqBody);
    var expectedSubCode;

    if (remainingAttempts == TWO) {
        expectedSubCode = WrongPasswordError.SUBCODE;
        testDetails += 'error code 400; subCode ' + expectedSubCode + '(incorrect password); remaining attempts ' + remainingAttempts;
    } else if (remainingAttempts == ONE) {
        expectedSubCode = WrongPasswordError.SUBCODE;
        testDetails += 'error code 400; subCode ' + expectedSubCode + '(incorrect password); remaining attempts ' + remainingAttempts;
    } else if (remainingAttempts == ZERO) {
        expectedSubCode = WrongPasswordLockedError.SUBCODE;
        testDetails += 'error code 400; subCode ' + expectedSubCode + '(incorrect password, account locked); remaining attempts ' + remainingAttempts;
    }
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_BAD_REQUEST);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_BAD_REQUEST, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.data.remainingAttempts).toBe(remainingAttempts);
        printReqResToCSV(response, sNo, testDetails, 'data.remainingAttempts', remainingAttempts, resBody.data.remainingAttempts, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'data.remainingAttempts', remainingAttempts, resBody.data.remainingAttempts, 'Failed');
        throw (error);
    }
    if (remainingAttempts == ZERO) {
        const expectedStatus = Constants.ASSETMGMT.APP_PLAYER.USER.STATE.LOCKED.CODE;
        try {
            expect(resBody.data.state.state).toBe(expectedStatus);
            printReqResToCSV(response, sNo, testDetails, 'data.state.state', expectedStatus, resBody.data.state.state, 'Passed');
        } catch (error) {
            printReqResToCSV(response, sNo, testDetails, 'data.state.state', expectedStatus, resBody.data.state.state, 'Failed');
            throw (error);
        }
    }
    return resBody;
}

async function successfulLogin(sNo, testDetails, reqBody, previousToken) {
    if(!previousToken){
        previousToken = {};
        previousToken.token = {};
        previousToken.expiry = 0;
    }
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/login').send(reqBody);
    testDetails += 'success code ' + HTTP_OK + '; remainingAttempts ' + THREE + '; status ' + UserStatusActiveLoggedIn +'; new token generated; expiry date grater than presious expiry date';
    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_OK);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_OK, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_OK, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.data.activityDetails.remainingAttempts).toBe(THREE);
        printReqResToCSV(response, sNo, testDetails, 'data.remainingAttempts', THREE, resBody.data.activityDetails.remainingAttempts, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'data.remainingAttempts', THREE, resBody.data.activityDetails.remainingAttempts, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.data.state.state).toBe(UserStatusActiveLoggedIn);
        printReqResToCSV(response, sNo, testDetails, 'data.state.state', UserStatusActiveLoggedIn, resBody.data.state.state, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'data.state.state', UserStatusActiveLoggedIn, resBody.data.state.state, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.data.token.token == previousToken.token).toBe(false);
        printReqResToCSV(response, sNo, testDetails, 'resBody.data.token.token == previousToken.token', resBody.data.token.token == previousToken.token, false, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'resBody.data.token.token == previousToken.token', resBody.data.token.token == previousToken.token, false, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.data.token.expiry > previousToken.expiry).toBe(true);
        printReqResToCSV(response, sNo, testDetails, 'resBody.data.token.expiry > previousToken.expiry', resBody.data.token.expiry > previousToken.expiry, true, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'resBody.data.token.expiry > previousToken.expiry', resBody.data.token.expiry > previousToken.expiry, true, 'Failed');
        throw (error);
    }
    return resBody;
}

//******************************************************************************//
//////////////////////////////////////////////////////////////////////////////////

const reqLoginNoPhoneNoEmail = {
    password: reqRegisterPhone005.password
};

describe('POST ' + UserBaseRoute + '/login with no phone or email', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginReqAuthError(sNo, testDetails, reqLoginNoPhoneNoEmail);
    });
});

//////////////////////////////////////////////////////////////////////////////////

const reqLoginInvalidPhone = {
    phone: {
        cc: '+91',
        number: '876543211999999'
    },
    password: reqRegisterPhone005.password
};

describe('POST ' + UserBaseRoute + '/login with invalid phone', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginReqAuthError(sNo, testDetails, reqLoginInvalidPhone);
    });
});

//////////////////////////////////////////////////////////////////////////////////

const reqLoginInvalidEmail = {
    email: 'test.user03Atborqs.io',
    password: reqRegisterEmail005.password,
};

describe('POST ' + UserBaseRoute + '/login with invalid email', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginReqAuthError(sNo, testDetails, reqLoginInvalidEmail);
    });
});

//////////////////////////////////////////////////////////////////////////////////

const reqLoginPhoneNoPassword = {
    phone: reqOtpPhone005.phone,
};

describe('POST ' + UserBaseRoute + '/login with no password - for phone based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginReqValidationError(sNo, testDetails, reqLoginPhoneNoPassword);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const reqLoginEmailNoPassword = {
    email: reqOtpEmail005.email,
};

describe('POST ' + UserBaseRoute + '/login with no password - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginReqValidationError(sNo, testDetails, reqLoginEmailNoPassword);
    });
});

//////////////////////////////////////////////////////////////////////////////////

const reqLoginPhoneWrongPassword = {
    phone: reqOtpPhone005.phone,
    password: reqRegisterPhone005.password + 'a'
};

describe('POST ' + UserBaseRoute + '/login with wrong password thrice - for phone based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> (first attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginWrongPasswordError(sNo, testDetails, reqLoginPhoneWrongPassword, TWO);
    });
    it(' >>> (second attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginWrongPasswordError(sNo, testDetails, reqLoginPhoneWrongPassword, ONE);
    });
    it(' >>> (third attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginWrongPasswordError(sNo, testDetails, reqLoginPhoneWrongPassword, ZERO);
    });

});
//////////////////////////////////////////////////////////////////////////////////
const reqLoginEmailWrongPassword = {
    email: reqOtpEmail005.email,
    password: reqRegisterEmail005.password + 'a'
};

describe('POST ' + UserBaseRoute + '/login with wrong password thrice - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> (first attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginWrongPasswordError(sNo, testDetails, reqLoginEmailWrongPassword, TWO);
    });
    it(' >>> (second attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginWrongPasswordError(sNo, testDetails, reqLoginEmailWrongPassword, ONE);
    });
    it(' >>> (third attempt) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginWrongPasswordError(sNo, testDetails, reqLoginEmailWrongPassword, ZERO);
    });

});

//////////////////////////////////////////////////////////////////////////////////

const reqLoginPhone006 = {
    phone: reqOtpPhone006.phone,
    password: reqRegisterPhone006.password + 'a',
};

let resLoginPhone006 = {};

describe('POST ' + UserBaseRoute + '/login with correct password in third attempt - for phone based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (first attempt with wrong password) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginWrongPasswordError(sNo, testDetails, reqLoginPhone006, TWO);
    });
    it(' >>> (second attempt with wrong password) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginWrongPasswordError(sNo, testDetails, reqLoginPhone006, ONE);
    });

    it(' >>> (third attempt with right password) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        reqLoginPhone006.password = reqRegisterPhone006.password;

        resLoginPhone006 = await successfulLogin(sNo, testDetails, reqLoginPhone006, null);
    });
    it(' >>> (check sso token for success) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginPhone006.data.token.token, resLoginPhone006.data._id);
    });

});

////////////////////////////////////////////////////////////////////////////////////
const reqLoginEmail006 = {
    email: reqOtpEmail006.email,
    password: reqRegisterEmail006.password + 'a'
};

let resLoginEmail006 = {};

describe('POST ' + UserBaseRoute + '/login with correct password in third attempt - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> (first attempt with wrong password) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginWrongPasswordError(sNo, testDetails, reqLoginEmail006, TWO);
    });
    it(' >>> (second attempt with wrong password) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginWrongPasswordError(sNo, testDetails, reqLoginEmail006, ONE);
    });

    it(' >>> (third attempt with right password) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        reqLoginEmail006.password = reqRegisterEmail006.password;

        resLoginEmail006 = await successfulLogin(sNo, testDetails, reqLoginEmail006, null);
    });
    it(' >>> (check sso token for success) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginEmail006.data.token.token, resLoginEmail006.data._id);
    });
});

//////////////////////////////////////////////////////////////////////////////////
const reqLoginPhone007 = {
    phone: reqOtpPhone007.phone,
    password: reqRegisterPhone007.password + 'a',
};

let resLoginPhone007 = {};

describe('POST ' + UserBaseRoute + '/login with correct password in second attempt - for phone based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> (first attempt with wrong password) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginWrongPasswordError(sNo, testDetails, reqLoginPhone007, TWO);
    });
    it(' >>> (second attempt with right password) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        reqLoginPhone007.password = reqRegisterPhone007.password;

        resLoginPhone007 = await successfulLogin(sNo, testDetails, reqLoginPhone007, null);
    });
    it(' >>> (check sso token for success) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginPhone007.data.token.token, resLoginPhone007.data._id);
    });
});

//////////////////////////////////////////////////////////////////////////////////

const reqLoginEmail007 = {
    email: reqOtpEmail007.email,
    password: reqRegisterEmail007.password + 'a'
};
let resLoginEmail007 = {};

describe('POST ' + UserBaseRoute + '/login with correct password in second attempt - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> (first attempt with wrong password) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLoginWrongPasswordError(sNo, testDetails, reqLoginEmail007, TWO);
    });
    it(' >>> (second attempt with right password) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        reqLoginEmail007.password = reqRegisterPhone007.password;

        resLoginEmail007 = await successfulLogin(sNo, testDetails, reqLoginEmail007, null);
    });
    it(' >>> (check sso token for success) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginEmail007.data.token.token, resLoginEmail007.data._id);
    });
});

////////////////////////////////////////////////////////////////////////////////

const reqLoginPhone008 = {
    phone: reqOtpPhone008.phone,
    password: reqRegisterPhone008.password,
};

let resLoginPhone008 = {};

describe('POST ' + UserBaseRoute + '/login with correct password in first attempt - for phone based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resLoginPhone008 = await successfulLogin(sNo, testDetails, reqLoginPhone008, null);
    });
    it(' >>> (check sso token for success) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginPhone008.data.token.token, resLoginPhone008.data._id);
    });
});

//////////////////////////////////////////////////////////////////////////////////

const reqLoginEmail008 = {
    email: reqOtpEmail008.email,
    password: reqRegisterEmail008.password,
};

let resLoginEmail008 = {};

describe('POST ' + UserBaseRoute + '/login with correct password in first attempt - for email based user', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resLoginEmail008 = await successfulLogin(sNo, testDetails, reqLoginEmail008, null);
    });
    it(' >>> (check sso token for success) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginEmail008.data.token.token, resLoginEmail008.data._id);
    });
});

////////////////////////////////////////////////////////////////////////////////////

describe('POST ' + UserBaseRoute + '/login back to back 5 times - new sso token to be generated, old token should stop working', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    let oldToken;

    it(' >>> first login ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        oldToken = resLoginEmail008.data.token;
        resLoginEmail008 = await successfulLogin(sNo, testDetails, reqLoginEmail008, null);
    });
    it(' >>> first login - check new sso token for success - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginEmail008.data.token.token, resLoginEmail008.data._id);
    });
    it(' >>> first login - check old sso token for failure - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, oldToken);
    });

    it(' >>> second login ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        oldToken = resLoginEmail008.data.token;
        resLoginEmail008 = await successfulLogin(sNo, testDetails, reqLoginEmail008, null);
    });
    it(' >>> second login - check new sso token for success - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginEmail008.data.token.token, resLoginEmail008.data._id);
    });
    it(' >>> second login - check old sso token for failure - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, oldToken.token);
    });

    it(' >>> third login ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        oldToken = resLoginEmail008.data.token;
        resLoginEmail008 = await successfulLogin(sNo, testDetails, reqLoginEmail008, null);
    });
    it(' >>> third login - check new sso token for success - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginEmail008.data.token.token, resLoginEmail008.data._id);
    });
    it(' >>> third login - check old sso token for failure - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, oldToken.token);
    });

    it(' >>> fourth login ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        oldToken = resLoginEmail008.data.token;
        resLoginEmail008 = await successfulLogin(sNo, testDetails, reqLoginEmail008, null);
    });
    it(' >>> fourth login - check new sso token for success - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginEmail008.data.token.token, resLoginEmail008.data._id);
    });
    it(' >>> fourth login - check old sso token for failure - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, oldToken.token);
    });

    it(' >>> fifth login ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        oldToken = resLoginEmail008.data.token;
        resLoginEmail008 = await successfulLogin(sNo, testDetails, reqLoginEmail008, null);
    });
    it(' >>> fifth login - check new sso token for success - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginEmail008.data.token.token, resLoginEmail008.data._id);
    });
    it(' >>> fifth login - check old sso token for failure - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, oldToken.token);
    });
});


////////////////////////////////////////////////////////////////////////////////////
//*********************************/logout****************************************//

async function failedLogoutNoToken(sNo, testDetails) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/logout').send().set('Authorization', 'Bearer ');
    var expectedSubCode = CommonUnauthorizedErrorTokenNotProvided.SUBCODE;
    testDetails += 'success code ' + HTTP_UNAUTHORIZED + '; subCode ' + expectedSubCode;

    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_UNAUTHORIZED);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }

    return resBody;
}

async function failedLogoutInvalidToken(sNo, testDetails, token) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/logout').send().set('Authorization', 'Bearer ' + token);
    var expectedSubCode = CommonUnauthorizedErrorInvalidToken.SUBCODE;
    testDetails += 'success code ' + HTTP_UNAUTHORIZED + '; subCode ' + expectedSubCode;

    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_UNAUTHORIZED);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }

    return resBody;
}

async function failedLogoutInvalidBearerTag(sNo, testDetails, token) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/logout').send().set('Authorization', 'Bearera ' + token);
    var expectedSubCode = CommonUnauthorizedErrorTokenNotProvided.SUBCODE;
    testDetails += 'success code ' + HTTP_UNAUTHORIZED + '; subCode ' + expectedSubCode;

    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_UNAUTHORIZED);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }

    return resBody;
}

async function successfulLogout(sNo, testDetails, token) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/logout').send().set('Authorization', 'Bearer ' + token);
    testDetails += 'success code ' + HTTP_OK + ';';

    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_OK);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_OK, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_OK, resBody.code, 'Failed');
        throw (error);
    }
    return resBody;
}

//********************************************************************************//
////////////////////////////////////////////////////////////////////////////////////

describe('POST ' + UserBaseRoute + '/logout with no token', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedLogoutNoToken(sNo, testDetails);
    });
});

////////////////////////////////////////////////////////////////////////////////////

var Token = '';
var InvalidToken = '';

describe('POST ' + UserBaseRoute + '/logout with invalid token', () => {
    beforeAll(async () => {
        tSNo += 1;
        Token = resLoginEmail008.data.token.token;
        InvalidToken = Token.replaceAt(5, 'g').replaceAt(6, 'A');
    });

    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedLogoutInvalidToken(sNo, testDetails, InvalidToken);
    });
});

////////////////////////////////////////////////////////////////////////////////////

describe('POST ' + UserBaseRoute + '/logout with invalid bearer tag', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedLogoutInvalidBearerTag(sNo, testDetails, resLoginEmail008.data.token.token);
    });
});

////////////////////////////////////////////////////////////////////////////////////

const BootstrapDomainPort = ENV.ASSETMGMT_BOOTSTRAP_URL + ':' + ENV.ASSETMGMT_BOOTSTRAP_PORT;
const BootstrapLoginRoute = '/bootstrap/application/login';

const ApplicationLoginPayload = { code: 'assetmgmt' };
let ApplicationToken;

describe('POST ' + UserBaseRoute + '/logout with application token', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;

        const response = await Request(BootstrapDomainPort).post(BootstrapLoginRoute).send(ApplicationLoginPayload);
        ApplicationToken = response.body.data.token;
    });

    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedLogoutInvalidToken(sNo, testDetails, ApplicationToken);

    });
});

////////////////////////////////////////////////////////////////////////////////////

//const AdminDomainPort = ENV.ASSETMGMT_ADMIN_URL + ':' + ENV.ASSETMGMT_ADMIN_PORT;
//const AdminLoginRoute = '/admin/user/login';

//const AdminLoginPayload = {
//    name: 'Default Superadmin',
//    username: ENV.ASSETMGMT_DEFAULT_SA,
//    password: ENV.ASSETMGMT_DEFAULT_SA_P
//};

//let AdminToken;

//describe('POST ' + UserBaseRoute + '/logout with admin token', () => {
//    beforeAll(async () => {
//        tSNo += 1;
//        sTSNo = 0;

//        const response = await Request(AdminDomainPort).post(AdminLoginRoute).send(AdminLoginPayload);
//        AdminToken = response.body.data.token;
//    });

//    it(' >>> ', async () => {
//        sTSNo = sTSNo + 1;
//        let sNo = '' + tSNo + '.' + sTSNo;
//        const testDetails = expect.getState().currentTestName;

//        await failedLogoutInvalidToken(sNo, testDetails, AdminToken);

//    });
//});

////////////////////////////////////////////////////////////////////////////////////

describe('POST ' + UserBaseRoute + '/logout with valid token', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulLogout(sNo, testDetails, resLoginEmail008.data.token.token);
    });
    it(' >>> (check logged out sso token for failure) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, resLoginEmail008.data.token.token);
    });
});

////////////////////////////////////////////////////////////////////////////////////

describe('POST ' + UserBaseRoute + '/logout with blacklisted user token', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedLogoutInvalidToken(sNo, testDetails, resLoginEmail008.data.token.token);

    });
});

////////////////////////////////////////////////////////////////////////////////////
//TBD
//describe('POST ' + UserBaseRoute + '/logout with expired token', () => {
//    beforeAll(async () => {
//        tSNo += 1;
//        sTSNo = 0;
//    });

//    it(' >>> ', async () => {
//        sTSNo = sTSNo + 1;
//        let sNo = '' + tSNo + '.' + sTSNo;
//        const testDetails = expect.getState().currentTestName;

//        await failedLogoutInvalidToken(sNo, testDetails, resLoginEmail008.data.token.token);

//    });
//});

////////////////////////////////////////////////////////////////////////////////////

describe('POST ' + UserBaseRoute + '/login and /logout for 5 times', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> first login ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resLoginEmail008 = await successfulLogin(sNo, testDetails, reqLoginEmail008, null);
    });
    it(' >>> first login - check sso for success', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginEmail008.data.token.token, resLoginEmail008.data._id);
    });
    it(' >>> first logout ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulLogout(sNo, testDetails, resLoginEmail008.data.token.token);
    });
    it(' >>> first logout - check sso for failure', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, resLoginEmail008.data.token.token);
    });

    it(' >>> second login ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resLoginEmail008 = await successfulLogin(sNo, testDetails, reqLoginEmail008, null);
    });
    it(' >>> second login - check sso for success', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginEmail008.data.token.token, resLoginEmail008.data._id);
    });
    it(' >>> second logout ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulLogout(sNo, testDetails, resLoginEmail008.data.token.token);
    });
    it(' >>>  second logout - check sso for failure', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, resLoginEmail008.data.token.token);
    });

    it(' >>> third login ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resLoginEmail008 = await successfulLogin(sNo, testDetails, reqLoginEmail008, null);
    });
    it(' >>> third login - check sso for success', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginEmail008.data.token.token, resLoginEmail008.data._id);
    });
    it(' >>> third logout ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulLogout(sNo, testDetails, resLoginEmail008.data.token.token);
    });
    it(' >>> third logout - check sso for failure', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, resLoginEmail008.data.token.token);
    });

    it(' >>> fourth login ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resLoginEmail008 = await successfulLogin(sNo, testDetails, reqLoginEmail008, null);
    });
    it(' >>> fourth login - check sso for success', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginEmail008.data.token.token, resLoginEmail008.data._id);
    });
    it(' >>> fourth logout ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulLogout(sNo, testDetails, resLoginEmail008.data.token.token);
    });
    it(' >>> fourth logout - check sso for failure', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, resLoginEmail008.data.token.token);
    });

    it(' >>> fifth login ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resLoginEmail008 = await successfulLogin(sNo, testDetails, reqLoginEmail008, null);
    });
    it(' >>> fifth login - check sso for success', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resLoginEmail008.data.token.token, resLoginEmail008.data._id);
    });
    it(' >>> fifth logout ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulLogout(sNo, testDetails, resLoginEmail008.data.token.token);
    });
    it(' >>> fifth logout - check sso for failure', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, resLoginEmail008.data.token.token);
    });

});


////////////////////////////////////////////////////////////////////////////////////


//*********************************/token/refresh'****************************************//
async function failedRefreshNoToken(sNo, testDetails) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/token/refresh').send().set('Authorization', 'Bearer ');
    var expectedSubCode = CommonUnauthorizedErrorTokenNotProvided.SUBCODE;
    testDetails += 'success code ' + HTTP_UNAUTHORIZED + '; subCode ' + expectedSubCode;

    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_UNAUTHORIZED);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }

    return resBody;
}

async function failedRefreshInvalidToken(sNo, testDetails, token) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/token/refresh').send().set('Authorization', 'Bearer ' + token);
    var expectedSubCode = CommonUnauthorizedErrorInvalidToken.SUBCODE;
    testDetails += 'success code ' + HTTP_UNAUTHORIZED + '; subCode ' + expectedSubCode;

    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_UNAUTHORIZED);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }

    return resBody;
}

async function failedRefreshInvalidBearerTag(sNo, testDetails, token) {
    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/token/refresh').send().set('Authorization', 'Bearera ' + token);
    var expectedSubCode = CommonUnauthorizedErrorTokenNotProvided.SUBCODE;
    testDetails += 'success code ' + HTTP_UNAUTHORIZED + '; subCode ' + expectedSubCode;

    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_UNAUTHORIZED);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.subCode).toBe(expectedSubCode);
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'subCode', expectedSubCode, resBody.subCode, 'Failed');
        throw (error);
    }

    return resBody;
}

async function successfulRefresh(sNo, testDetails, previousToken) {

    const response = await Request(AssetMgmtBaseRoute).post(UserBaseRoute + '/token/refresh').send().set('Authorization', 'Bearer ' + previousToken.token);
    testDetails += 'success code ' + HTTP_OK + '; token different from earlier; expiry time greater than earlier';

    const resBody = response._body;

    try {
        expect(resBody.code).toBe(HTTP_OK);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_OK, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_OK, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.data.activityDetails.remainingAttempts).toBe(THREE);
        printReqResToCSV(response, sNo, testDetails, 'data.remainingAttempts', THREE, resBody.data.activityDetails.remainingAttempts, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'data.remainingAttempts', THREE, resBody.data.activityDetails.remainingAttempts, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.data.state.state).toBe(UserStatusActiveLoggedIn);
        printReqResToCSV(response, sNo, testDetails, 'data.state.state', UserStatusActiveLoggedIn, resBody.data.state.state, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'data.state.state', UserStatusActiveLoggedIn, resBody.data.state.state, 'Failed');
        throw (error);
    }
    try {
        expect(previousToken.token == resBody.data.token.token).toBe(false);
        printReqResToCSV(response, sNo, testDetails, '(previousToken.token == resBody.data.token.token)', false, (previousToken.token == resBody.data.token.token), 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, '(previousToken.token == resBody.data.token.token)', false, (previousToken.token == resBody.data.token.token), 'Failed');
        throw (error);
    }
    try {
        expect(previousToken.expiry < resBody.data.token.expiry).toBe(true);
        printReqResToCSV(response, sNo, testDetails, '(previousToken.expiry < resBody.data.token.expiry)', true, (previousToken.expiry < resBody.data.token.expiry), 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, '(previousToken.expiry < resBody.data.token.expiry)', true, (previousToken.expiry < resBody.data.token.expiry), 'Failed');
        throw (error);
    }
    return resBody;
}
//********************************************************************************//
////////////////////////////////////////////////////////////////////////////////////

describe('POST ' + UserBaseRoute + '/refresh/token with no token', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedRefreshNoToken(sNo, testDetails);
    });
});

////////////////////////////////////////////////////////////////////////////////////

describe('POST ' + UserBaseRoute + '/refresh/token with invalid token', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedRefreshInvalidToken(sNo, testDetails, InvalidToken);
    });
});

////////////////////////////////////////////////////////////////////////////////////

describe('POST ' + UserBaseRoute + '/refresh/token with invalid bearer tag', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedRefreshInvalidBearerTag(sNo, testDetails, resLoginEmail008.data.token.token);
    });
});

////////////////////////////////////////////////////////////////////////////////////

describe('POST ' + UserBaseRoute + '/refresh/token with application token', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;
        await failedRefreshInvalidToken(sNo, testDetails, ApplicationToken);

    });
});

////////////////////////////////////////////////////////////////////////////////////

//describe('POST ' + UserBaseRoute + '/refresh/token with admin token', () => {
//    beforeAll(async () => {
//        tSNo += 1;
//        sTSNo = 0;

//    });

//    it(' >>> ', async () => {
//        sTSNo = sTSNo + 1;
//        let sNo = '' + tSNo + '.' + sTSNo;
//        const testDetails = expect.getState().currentTestName;

//        await failedRefreshInvalidToken(sNo, testDetails, AdminToken);

//    });
//});

////////////////////////////////////////////////////////////////////////////////////

const reqOtpEmail010 = {
    email: 'test.user010@borqs.io',
    type: 'registration'
};

let resOtpEmail010 = {};

let reqRegisterEmail010 = {
    profileData: {
        name: {
            firstName: 'First',
            middleName: 'Middle',
            lastName: 'Last'
        }
    },
    password: 'Borqs@1234',
    otpToken: {
        type: 'registration',
    }
};

let resRegisterEmail010 = {};

const reqLoginEmail010 = {
    email: reqOtpEmail010.email,
    password: reqRegisterEmail010.password
};

let resLoginEmail010 = {};

describe('POST ' + UserBaseRoute + '/token/refresh with valid token', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> (prep genetate otp) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resOtpEmail010 = await successfulOtp(sNo, testDetails, reqOtpEmail010, THREE);
    });
    it(' >>> (prep register) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        reqRegisterEmail010.otpToken.otp = resOtpEmail010.data.otpToken.otp;
        resRegisterEmail010 = await successfulRegisterEmailBased(sNo, testDetails, reqRegisterEmail010, resOtpEmail010.data._id, resOtpEmail010.data.email.email);
    });
    it(' >>> (prep login) - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resLoginEmail010 = await successfulLogin(sNo, testDetails, reqLoginEmail010, null);
    });
    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        resRefreshEmail010 = await successfulRefresh(sNo, testDetails, resLoginEmail010.data.token);
    });
});

////////////////////////////////////////////////////////////////////////////////////
let resRefreshEmail010 = {};
describe('POST ' + UserBaseRoute + '/token/refresh repeatedly for 5 times, current token should stop working and new token should work', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    let oldToken;
    it(' >>> first attempt - refresh ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        oldToken = resRefreshEmail010.data.token;
        resRefreshEmail010 = await successfulRefresh(sNo, testDetails, oldToken);
    });
    it(' >>> first attempt - check new sso token for success - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resRefreshEmail010.data.token.token, resRefreshEmail010.data._id);
    });
    it(' >>> first attempt - check old sso token for failure - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, oldToken.token);
    });

    it(' >>> second attempt - refresh ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        oldToken = resRefreshEmail010.data.token;
        resRefreshEmail010 = await successfulRefresh(sNo, testDetails, oldToken);
    });
    it(' >>> second attempt - check new sso token for success - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resRefreshEmail010.data.token.token, resRefreshEmail010.data._id);
    });
    it(' >>> second attempt - check old sso token for failure - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, oldToken.token);
    });

    it(' >>> third attempt - refresh ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        oldToken = resRefreshEmail010.data.token;
        resRefreshEmail010 = await successfulRefresh(sNo, testDetails, oldToken);
    });
    it(' >>> third attempt - check new sso token for success - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resRefreshEmail010.data.token.token, resRefreshEmail010.data._id);
    });
    it(' >>> third attempt - check old sso token for failure - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, oldToken.token);
    });

    it(' >>> fourth attempt - refresh ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        oldToken = resRefreshEmail010.data.token;
        resRefreshEmail010 = await successfulRefresh(sNo, testDetails, oldToken);
    });
    it(' >>> fourth attempt - check new sso token for success - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resRefreshEmail010.data.token.token, resRefreshEmail010.data._id);
    });
    it(' >>> fourth attempt - check old sso token for failure - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, oldToken.token);
    });

    it(' >>> fifth attempt - refresh ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        oldToken = resRefreshEmail010.data.token;
        resRefreshEmail010 = await successfulRefresh(sNo, testDetails, oldToken);
    });
    it(' >>> fifth attempt - check new sso token for success - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await successfulSsoToken(sNo, testDetails, resRefreshEmail010.data.token.token, resRefreshEmail010.data._id);
    });
    it(' >>> fifth attempt - check old sso token for failure - ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedSsoToken(sNo, testDetails, oldToken.token);
    });
});

////////////////////////////////////////////////////////////////////////////////////
/*
describe('POST ' + UserBaseRoute + '/refresh/token with blacklisted user token', () => {
    beforeAll(async () => {
        tSNo += 1;
        sTSNo = 0;
    });

    it(' >>> ', async () => {
        sTSNo = sTSNo + 1;
        let sNo = '' + tSNo + '.' + sTSNo;
        const testDetails = expect.getState().currentTestName;

        await failedLogoutInvalidToken(sNo, testDetails, resLoginEmail008.data.token.token);

    });
});
*/
////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


//*****************************/get(use token)************************************//

async function successfulSsoToken(sNo, testDetails, token, userId) {
    const response = await Request(AssetMgmtBaseRoute).get(UserBaseRoute + '/').send().set('Authorization', 'Bearer ' + token);
    testDetails += 'success code ' + HTTP_OK + ';';

    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_OK);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_OK, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_OK, resBody.code, 'Failed');
        throw (error);
    }
    try {
        expect(resBody.data._id.equals(userId)).toBe(true);
        printReqResToCSV(response, sNo, testDetails, 'resBody.data._id == userId', resBody.data._id == userId, true, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'resBody.data._id == userId', resBody.data._id == userId, true, 'Failed');
        throw (error);
    }
    return resBody;
}

async function failedSsoToken(sNo, testDetails, token) {
    const response = await Request(AssetMgmtBaseRoute).get(UserBaseRoute + '/').send().set('Authorization', 'Bearer ' + token);
    testDetails += 'error code ' + HTTP_UNAUTHORIZED + ';';

    const resBody = response._body;
    try {
        expect(resBody.code).toBe(HTTP_UNAUTHORIZED);
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Passed');
    } catch (error) {
        printReqResToCSV(response, sNo, testDetails, 'code', HTTP_UNAUTHORIZED, resBody.code, 'Failed');
        throw (error);
    }
    return resBody;
}

//*********************************/logout****************************************//

////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////


//Security tests - to be moved out to a different file

let reqSuperadminLogin = {
    name: ENV.ASSETMGMT_SA_NAME,
    email: ENV.ASSETMGMT_SA_EMAIL,
    password: ENV.ASSETMGMT_SA_PWD
};

//let resSuperadminLogin;
//describe('POST ' + UserBaseRoute + '/login superadmin', () => {
//    beforeAll(async () => {
//        tSNo += 1;
//        sTSNo = 0;
//    });
//    it(' >>> ', async () => {
//        sTSNo = sTSNo + 1;
//        let sNo = '' + tSNo + '.' + sTSNo;
//        const testDetails = expect.getState().currentTestName;

//        resSuperadminLogin = await successfulLogin(sNo, testDetails, reqSuperadminLogin, null);
//        console.dir(resSuperadminLogin);
//    });
//});
