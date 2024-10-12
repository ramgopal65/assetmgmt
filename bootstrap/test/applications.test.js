const Request = require('supertest');
const fs = require('fs');
const path = require('path');
const portfinder = require('portfinder');
const { ObjectId } = require('mongodb');
const HealthBaseRoute = '/bootstrap/health';
const ApplicationBaseRoute = '/bootstrap/application';
const { getOneByCode } = require('../routes/controllers/application');
var BootstrapServer;
var BootstrapRoutes;
const port = process.env.ASSETMGMT_BOOTSTRAP_PORT;
let isAlreadyRunning = true;
var Token = '';
var ApplicationCount; 
var Applications;
String.prototype.replaceAt = function (index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
};
//var console = {};
//console.log = function () { };

const delay = ms => new Promise(res => setTimeout(res, ms));

//To delete any existing .csv file related with these test cases
const projectDirectory = process.cwd();
const csvFileName = path.join(projectDirectory, 'output-applications.csv');
beforeAll(() => {
    if (fs.existsSync(csvFileName)) {
        fs.unlinkSync(csvFileName);
    }
});

//To get the output.csv file
let headerWritten = false;
function printReqResToCSV(res, testDetails, testCondition, expectedResult, actualResult, status) {
    const req = JSON.parse(JSON.stringify(res)).req;
    // const requestString = JSON.stringify(req, null, 2).replace(/"/g, '""');
    // const responseString = JSON.stringify(res.body, null, 2).replace(/"/g, '""');
    if (typeof req === 'object'){
        var requestString = JSON.stringify(req, null, 2).replace(/"/g, '""');
        var responseString = JSON.stringify(res.body, null, 2).replace(/"/g, '""');
        // var csvRow = [testDetails, requestString, responseString, testCondition, expectedResult, actualResult, status];
    }

    if (typeof expectedResult === 'object') {
        expectedResult = JSON.stringify(expectedResult).replace(/"/g, '""');
    }
    if (typeof actualResult === 'object') {
        actualResult = JSON.stringify(actualResult).replace(/"/g, '""');
    }
    const csvRow = [testDetails, requestString, responseString, testCondition, expectedResult, actualResult, status];
    if (!headerWritten) {
        const header = ['Test Description', 'Request Body', 'Response Body', 'Test Condition', 'Expected Result', 'Actual Result', 'Status'];
        const csvContent = [header, csvRow].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        fs.appendFileSync(csvFileName, csvContent + '\n');
        headerWritten = true;
    } else {
        const csvContent = csvRow.map(cell => `"${cell}"`).join(',');
        fs.appendFileSync(csvFileName, csvContent + '\n');
    }
}

// printReqResToCSV(reqForCSV, testDetails, 'req.logs', 400, req.logs, 'Passed');
// printReqResToCSV({}, testDetails, 'next', 1, next.mock.calls.length, 'Passed');

async function startOrUseRunningInstance(cb) {
    await portfinder.getPort({
        port: port,    // minimum port
        stopPort: port // maximum port
    }, function (err, p) {
        if (err) {
            const response = Request('http:\\localhost:' + port).get(HealthBaseRoute);
            if (response.statusCode == 200 && (response.body.message = 'healthy')) {
                isAlreadyRunning = true;
                console.log('server already running');
                BootstrapRoutes = 'http:\\localhost:' + port;
                BootstrapServer = null;
            }
        }
        if (p) {
            isAlreadyRunning = false;
            console.log('starting server now');
            BootstrapServer = require('../bin/bootstrap');
            BootstrapRoutes = require('../index');
            //TODO: how to wait for the server tobe up here?
        }
        if (cb) {
            cb(isAlreadyRunning);
        }
    });
}


beforeAll(async () => {
    try {
        let response = await Request('http://localhost:' + port).get(HealthBaseRoute);
        if (response.statusCode == 200 && (response.body.message = 'healthy')) {
            isAlreadyRunning = true;
            console.log('server already running');
            BootstrapRoutes = 'http://localhost:' + port;
            BootstrapServer = null;
        } else {
            isAlreadyRunning = false;
            console.log('starting server now');
            BootstrapServer = await require('../bin/bootstrap');
            BootstrapRoutes = await require('../index');
            //TODO: how to wait for the server tobe up here?
            await delay(15000);
        }
    } catch (e) {
        isAlreadyRunning = false;
        console.log(e + ' - starting server now');
        BootstrapServer = await require('../bin/bootstrap');
        BootstrapRoutes = await require('../index');
        //TODO: how to wait for the server tobe up here?
        await delay(15000);
    }
}, 30000);

afterAll(async () => {
    if (!isAlreadyRunning) {
        BootstrapServer.close();
    }
});

describe('GET ' + HealthBaseRoute, () => {
    it('should return 200', async () => {
        const response = await Request(BootstrapRoutes).get(HealthBaseRoute);
        const testDetails = expect.getState().currentTestName;
        try{
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw(error);
        }
    });
});

describe('POST /login with wrong application code', () => {
    const payload = { code: 'test' };
    it(' >> should return 400', async () => {
        const response = await Request(BootstrapRoutes).post(ApplicationBaseRoute + '/login').send(payload);
        const testDetails = expect.getState().currentTestName;
        try{
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 'some-error', response.statusCode, 'Failed');
            throw(error);
        }
    }); 
});

describe('POST /login with right application code', () => {
    const payload = { code: 'admin' };
    it(' >> should return 200', async () => {
        const response = await Request(BootstrapRoutes).post(ApplicationBaseRoute + '/login').send(payload);
        Token = response.body.data.token;
        const testDetails = expect.getState().currentTestName;
        try{
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 'some-error', response.statusCode, 'Failed');
            throw(error);
        }
    });
});

describe('POST /login without an application code', () => {
    it(' >> should return 409', async () => {
        const response = await Request(BootstrapRoutes).post(ApplicationBaseRoute + '/login').send();
        const testDetails = expect.getState().currentTestName;
        try{
            expect(response.statusCode).toBe(409);
            printReqResToCSV(response, testDetails, 'response.statusCode', 409, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 409, response.statusCode, 'Failed');
            throw(error);
        }
    });
}); 

describe('GET / without authorization header', () => {
    it(' >> should return 400', async () => {
        const response = await Request(BootstrapRoutes).get(ApplicationBaseRoute);
        const testDetails = expect.getState().currentTestName;
        try{
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 'some-error', response.statusCode, 'Failed');
            throw(error);
        }
    });
});

describe('GET / with wrong Token in authorization header', () => {
    var invalidToken = '';
    beforeAll(async () => {
        invalidToken = Token.replaceAt(5, '!').replaceAt(7, 'q');
    });
    it(' >> should return 401', async () => {
        const response = await Request(BootstrapRoutes).get(ApplicationBaseRoute).set('Authorization', 'Bearer ' + invalidToken);
        const testDetails = expect.getState().currentTestName;
        try{
            expect(response.statusCode).toBe(401);
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 'some-error', response.statusCode, 'Failed');
            throw(error);
        }
    });
});

describe('GET / with right Token in authorization header', () => {
    it(' >> should return 200', async () => {
        const response = await Request(BootstrapRoutes).get(ApplicationBaseRoute).set('Authorization', 'Bearer ' + Token);
        Applications = response.body.data;
        ApplicationCount = Applications.length;
        const testDetails = expect.getState().currentTestName;
        try{
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 'some-error', response.statusCode, 'Failed');
            throw(error);
        }
    });
});

// describe('GET /:_id with wrong application id', () => {
//     var invalidAppId = '';
//     beforeAll(async () => {
//         if (ApplicationCount > 0) {
//             invalidAppId = Applications[ApplicationCount - 1]._id.replaceAt(5, '!').replaceAt(7, 'q');
//         }
//     });
//     it(' >> should return 400', async () => {
//         const response = await Request(BootstrapRoutes).get(ApplicationBaseRoute + invalidAppId).set('Authorization', 'Bearer ' + Token);
//         const testDetails = expect.getState().currentTestName;
//         try{
//             expect(response.statusCode).toBe(400);
//             printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
//         } catch (error) {
//             printReqResToCSV(response, testDetails, 'response.statusCode', 'some-error', response.statusCode, 'Failed');
//             throw(error);
//         }
//     });
// });

// describe('GET /:_id with a valid application id and valid auth token in header', () => {
//     var validAppId = '';
//     beforeAll(async () => {
//         if (ApplicationCount > 0) {
//             validAppId = Applications[0]._id;
//         }
//     });
//     it(' >> should return 200', async () => {
//         const response = await Request(BootstrapRoutes).get(ApplicationBaseRoute + validAppId).set('Authorization', 'Bearer ' + Token);
//         const testDetails = expect.getState().currentTestName;
//         try{
//             expect(response.statusCode).toBe(200);
//             printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
//         } catch (error) {
//             printReqResToCSV(response, testDetails, 'response.statusCode', 'some-error', response.statusCode, 'Failed');
//             throw(error);
//         }
//     });
// });

// describe('GET /:_id with invalid auth token in header and a valid application id', () => {
//     var validAppId = '';
//     var invalidToken = '';

//     beforeAll(async () => {
//         if (ApplicationCount > 0) {
//             validAppId = Applications[0]._id;
//             invalidToken = Token.replaceAt(5, '!').replaceAt(7, 'q');
//         }
//     });

//     it(' >> should return 401', async () => {
//         const response = await Request(BootstrapRoutes)
//             .get(ApplicationBaseRoute + validAppId)
//             .set('Authorization', 'Bearer ' + invalidToken);
//         const testDetails = expect.getState().currentTestName;
//         try{
//             expect(response.statusCode).toBe(401);
//             printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Passed');
//         } catch (error) {
//             printReqResToCSV(response, testDetails, 'response.statusCode', 'some-error', response.statusCode, 'Failed');
//             throw(error);
//         }
//     });
// });

// describe('GET /:_id with no auth token in header and a valid application id', () => {
//     var validAppId = '';
//     beforeAll(async () => {
//         if (ApplicationCount > 0) {
//             validAppId = Applications[0]._id;
//         }
//     });
//     it(' >> should return 400', async () => {
//         const response = await Request(BootstrapRoutes).get(ApplicationBaseRoute + validAppId);
//         const testDetails = expect.getState().currentTestName;
//         try{
//             expect(response.statusCode).toBe(400);
//             printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
//         } catch (error) {
//             printReqResToCSV(response, testDetails, 'response.statusCode', 'some-error', response.statusCode, 'Failed');
//             throw(error);
//         }
//     });
// });

describe('GET /:code with valid application code and valid auth token', ()=>{
    var validAppCode = 'admin';
    it(' >> should return 200', async () => {
        const response =  await Request(BootstrapRoutes).get(ApplicationBaseRoute + '/code/' + validAppCode).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;
        try{
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 'some-error', response.statusCode, 'Failed');
            throw(error);
        }
    });
});

describe('GET /:code with invalid application code and valid auth token', ()=>{
    var inValidAppCode = 'testcode';
    it(' >> should return 400', async () => {
        const response =  await Request(BootstrapRoutes).get(ApplicationBaseRoute + '/code/' + inValidAppCode).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;
        try{
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 'some-error', response.statusCode, 'Failed');
            throw(error);
        }
    });
});

describe('GET /:code without application code and valid auth token', ()=>{
    var inValidAppCode = '';
    it(' >> should return 400', async () => {
        const response =  await Request(BootstrapRoutes).get(ApplicationBaseRoute + '/code/' + inValidAppCode).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;
        try{
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 'some-error', response.statusCode, 'Failed');
            throw(error);
        }
    });
});

describe('GET /:code without application code passed in the params', () => {
    it('should enter the else block when req.params.code is falsy', async () => {
        const req = {params:{}};
        const response = await Request(BootstrapRoutes).get(ApplicationBaseRoute + '/code/' + req).set('Authorization', 'Bearer ' + Token);
        const next = jest.fn();
        await getOneByCode(req, response, next);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(req.logs.code).toBe(400); 
            printReqResToCSV(response, testDetails, 'req.logs.code', 400, req.logs.code, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'req.logs.code', 400, req.logs.code, 'Failed');
            throw(error);
        }
    });
});

describe('GET /:code with valid application code and invalid auth token', ()=>{
    var validAppCode = 'admin';
    var invalidToken = '';
    beforeAll(async () => {
        if (ApplicationCount > 0) {
            invalidToken = Token.replaceAt(5, '!').replaceAt(7, 'q');
        }
    });
    it(' >> should return 401', async () => {
        const response =  await Request(BootstrapRoutes).get( ApplicationBaseRoute + '/code/' + validAppCode).set('Authorization', 'Bearer ' + invalidToken);
        const testDetails = expect.getState().currentTestName;
        try{
            expect(response.statusCode).toBe(401);
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 'some-error', response.statusCode, 'Failed');
            throw(error);
        }
    });
});

describe('GET /:code with invalid application code and invalid auth token', ()=>{
    var inValidAppCode = 'test';
    var invalidToken = '';
    beforeAll(async () => {
        if (ApplicationCount > 0) {
            invalidToken = Token.replaceAt(5, '!').replaceAt(7, 'q');
        }
    });
    it(' >> should return 401', async () => {
        const response =  await Request(BootstrapRoutes).get( ApplicationBaseRoute + '/code/' + inValidAppCode).set('Authorization', 'Bearer ' + invalidToken);
        const testDetails = expect.getState().currentTestName;
        try{
            expect(response.statusCode).toBe(401);
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 'some-error', response.statusCode, 'Failed');
            throw(error);
        }
    });
});