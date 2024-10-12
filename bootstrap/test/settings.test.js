/* eslint-disable no-mixed-spaces-and-tabs */
const Request = require('supertest');
const _ = require('underscore');
const fs = require('fs');
const path = require('path');
const SettingsBaseRoute = '/bootstrap/setting';
const HealthBaseRoute = '/bootstrap/health';
const ApplicationBaseRoute = '/bootstrap/application';
const { ObjectId } = require('mongodb');
var BootstrapServer;
var BootstrapRoutes;
const port = process.env.ASSETMGMT_BOOTSTRAP_PORT;
const portfinder = require('portfinder');
let isAlreadyRunning = true;


var Token = '';
var InvalidToken = '';
String.prototype.replaceAt = function (index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
};

//var console = {};
//console.log = function () { };

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
var CreatedSettings;
const Settings = [
    {
        applicationCode: 'bootstrap',
        applicationName: 'Bootstrap',
        categoryCode: 'cat1',
        categoryName: 'Category 1',
        property: 'jest.test.11',
        value: 'test11Value',
        valueType: 'string',
        isEditable: true,
        description: 'test11'
    },
    {
        applicationCode: 'bootstrap',
        applicationName: 'Bootstrap',
        categoryCode: 'cat1',
        categoryName: 'Category 1',
        property: 'jest.test.12',
        value: '12121212',
        valueType: 'integer',
        isEditable: true,
        description: 'test 12'
    },
    {
        applicationCode: 'admin',
        applicationName: 'Admin',
        categoryCode: 'cat2',
        categoryName: 'Category 2',
        property: 'jest.test.13',
        value: '13.131313',
        valueType: 'float',
        isEditable: true,
        description: 'test 13'
    },
    {
        applicationCode: 'admin',
        applicationName: 'Admin',
        categoryCode: 'cat3',
        categoryName: 'Category 3',
        property: 'jest.test.14',
        value: 'test14Value',
        valueType: 'string',
        isEditable: true,
        description: 'test14'
    }
];
var CreatedSetting;
const Setting = {
    applicationCode: 'audit',
    applicationName: 'Audit',
    categoryCode: 'cat2',
    categoryName: 'Category 2',
    property: 'jest.test.15',
    value: 'test15Value',
    valueType: 'string',
    isEditable: true,
    description: 'test 15 description'
};

const delay = ms => new Promise(res => setTimeout(res, ms));

//To delete any existing .csv file related with these test cases
const projectDirectory = process.cwd();
const csvFileName = path.join(projectDirectory, 'output-settings.csv');
beforeAll(() => {
    if (fs.existsSync(csvFileName)) {
        fs.unlinkSync(csvFileName);
    }
});

//To get the output.csv file
let headerWritten = false;
function printReqResToCSV(res, testDetails, testCondition, expectedResult, actualResult, status) {
    const req = JSON.parse(JSON.stringify(res)).req;
    const requestString = JSON.stringify(req, null, 2).replace(/"/g, '""');
    const responseString = JSON.stringify(res.body, null, 2).replace(/"/g, '""');

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
        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/ - no authorization header', () => {
    it(' >> should return 400', async () => {
        const payload = Settings[0];
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/').send(payload);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + ApplicationBaseRoute + '/login', () => {
    const payload = { code: 'admin' };
    it(' >> should return 200', async () => {
        const response = await Request(BootstrapRoutes).post(ApplicationBaseRoute + '/login').send(payload);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }
        Token = response.body.data.token;
        InvalidToken = Token.replaceAt(5, '!').replaceAt(7, 'q');
    });
});

describe('POST ' + SettingsBaseRoute + '/ - wrong authorization token', () => {
    it(' >> should return 401', async () => {
        const payload = Settings;
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/').send(payload).set('Authorization', 'Bearer ' + InvalidToken);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(401);
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/ - wrong data(invalid settings in body)', () => {
    beforeAll(async () => {
    });
    it(' >> should return 400', async () => {
        const payload = {};
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/').send(payload).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/ - wrong data(one setting missing required fields)', () => {
    var strippedSetting = Object.assign({}, Setting);
    beforeAll(async () => {
        delete strippedSetting['applicationCode'];
        delete strippedSetting['applicationName'];
        delete strippedSetting['categoryCode'];
        delete strippedSetting['categoryName'];
        delete strippedSetting['property'];
        delete strippedSetting['value'];
        delete strippedSetting['valueType'];
    });
    it(' >> should return 400', async () => {
        const payload = strippedSetting;
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/').send(payload).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/ - one setting', () => {
    it(' >> should return 200 and the created setting', async () => {
        const payload = Setting;
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/').send(payload).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }

        try {
            expect(compareJsonObject(response.body.data, Setting)).toBe(true);
            printReqResToCSV(response, testDetails, 'response.body.data', Setting, response.body.data, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data', Setting, response.body.data, 'Failed');
            throw (error);
        }

        if (response.statusCode == 200) {
            CreatedSetting = response.body.data;
        }

    });
});

describe('POST ' + SettingsBaseRoute + '/ - 4 settings with wrong data(one setting with incorrect value)', () => {
    let incorrectSettings;
    beforeAll(async () => {
        incorrectSettings = JSON.parse(JSON.stringify(Settings));
        incorrectSettings[0].valueType = 'invalidValueType';
    });
    it(' >> should return 400 and not create any settings', async () => {
        const payload = incorrectSettings;
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/').send(payload).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/ - 4 settings', () => {
    it(' >> should return 200 and array of created settings of length 4', async () => {
        const payload = Settings;
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/').send(payload).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }

        try {
            expect(compareJsonArrays(response.body.data, Settings)).toBe(true);
            printReqResToCSV(response, testDetails, 'response.body.data', Settings, response.body.data, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data', Settings, response.body.data, 'Failed');
            throw (error);
        }

        try {
            expect(response.body.data.length).toBe(4);
            printReqResToCSV(response, testDetails, 'response.body.data.length', Settings.length, response.body.data.length, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.length', Settings.length, response.body.data.length, 'Failed');
            throw (error);
        }
        if (response.statusCode == 200) {
            CreatedSettings = response.body.data;
        }
    });
});

describe('GET ' + SettingsBaseRoute + '/:_id - wrong authorization token', () => {
    var createdSettingIds;
    beforeAll(async () => {
        createdSettingIds = { _ids: CreatedSettings.map(cs => cs._id) };
    });
    it(' >> should return 401', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/' + createdSettingIds._ids[0]).set('Authorization', 'Bearer ' + InvalidToken);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(401);
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('GET ' + SettingsBaseRoute + '/:_id - wrong data(invalid id)', () => {
    var createdSettingIds;
    beforeAll(async () => {
        createdSettingIds = { _ids: CreatedSettings.map(cs => cs._id) };
    });
    it(' >> should return 400', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/' + createdSettingIds._ids[0].replaceAt(5, 'g')).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('GET ' + SettingsBaseRoute + '/:_id - wrong data(valid non-exising id)', () => {
    var createdSettingIds;
    beforeAll(async () => {
        createdSettingIds = { _ids: CreatedSettings.map(cs => cs._id) };
    });
    it(' >> should return 400', async () => {
        //let nonextitantId = '00000010' + createdSettingIds._ids[0].substring(createdSettingIds._ids[0].length - 8);
        let nonextitantObjectId = new ObjectId();
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/' + nonextitantObjectId.toString()).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('GET ' + SettingsBaseRoute + '/:_id', () => {
    var createdSettingIds;
    beforeAll(async () => {
        createdSettingIds = { _ids: CreatedSettings.map(cs => cs._id) };
    });
    it(' >> should return 200', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/' + createdSettingIds._ids[0]).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }

        try {
            expect(response.body.data._id).toBe(createdSettingIds._ids[0]);
            printReqResToCSV(response, testDetails, 'response.body.data._id', createdSettingIds._ids[0], response.body.data._id, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data._id', createdSettingIds._ids[0], response.body.data._id, 'Failed');
            throw (error);
        }

    });
});

describe('GET ' + SettingsBaseRoute + '/:sort&:select - wrong authorization token', () => {
    let paramString, queryString;
    beforeAll(async () => {
        let sortJson = { applicationCode: 1 };
        let strSortJson = JSON.stringify(sortJson);
        let encodedStrSortJson = encodeURIComponent(strSortJson);

        let selectStr = '_id applicationCode categoryCode property value valueType';
        let encodedSelectStr = encodeURIComponent(selectStr);

        paramString = encodedStrSortJson + '&' + encodedSelectStr;

        let query = { skip: 0, limit: 5 };
        queryString = '?' + encodeURIComponent('skip') + '=' + encodeURIComponent(query.skip) + '&' + encodeURIComponent('limit') + '=' + encodeURIComponent(query.limit);

    });
    it(' >> should return 401', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/' + paramString + queryString).set('Authorization', 'Bearer ' + InvalidToken);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(401);
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('GET ' + SettingsBaseRoute + '/:sort&:select - wrong sort data', () => {
    let paramString, queryString;
    beforeAll(async () => {
        let sortJson = { property1: 1 };
        let strSortJson = JSON.stringify(sortJson);
        let encodedStrSortJson = encodeURIComponent(strSortJson);

        let selectStr = '_id applicationCode categoryCode property value valueType';
        let encodedSelectStr = encodeURIComponent(selectStr);

        paramString = encodedStrSortJson + '&' + encodedSelectStr;

        let query = { skip: 0, limit: 3 };
        queryString = '?' + encodeURIComponent('skip') + '=' + encodeURIComponent(query.skip) + '&' + encodeURIComponent('limit') + '=' + encodeURIComponent(query.limit);
    });

    it(' >> should return 200 and use system default for sort', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/' + paramString + queryString).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }

        try {
            expect(response.body.data.length).toBe(3);
            printReqResToCSV(response, testDetails, 'response.body.data.length', 3, response.body.data.length, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.length', 3, response.body.data.length, 'Failed');
            throw (error);
        }

        try {
            expect(Object.keys(response.body.data[0]).length).toBe(6);
            printReqResToCSV(response, testDetails, 'Object.keys(response.body.data[0]).length', 6, Object.keys(response.body.data[0]).length, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'Object.keys(response.body.data[0]).length', 6, Object.keys(response.body.data[0]).length, 'Failed');
            throw (error);
        }
    });
});

describe('GET ' + SettingsBaseRoute + '/:sort&:select - select not provided', () => {
    let paramString, queryString;
    beforeAll(async () => {
        let sortJson = { applicationCode1: 1 };
        let strSortJson = JSON.stringify(sortJson);
        let encodedStrSortJson = encodeURIComponent(strSortJson);

        paramString = encodedStrSortJson;

        let query = { skip: 0, limit: 5 };
        queryString = '?' + encodeURIComponent('skip') + '=' + encodeURIComponent(query.skip) + '&' + encodeURIComponent('limit') + '=' + encodeURIComponent(query.limit);

    });
    //should trigger GET /:_id and fail with 400
    it(' >> should return 400 as it triggers GET ' + SettingsBaseRoute + '/:_id with wrong _id', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/' + paramString + queryString).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});


describe('GET ' + SettingsBaseRoute + '/:sort&:select - empty sort and query', () => {
    let paramString, queryString;
    beforeAll(async () => {
        let sortJson = {};
        let strSortJson = JSON.stringify(sortJson);
        let encodedStrSortJson = encodeURIComponent(strSortJson);

        let selectStr = '_id1 applicationCode1 categoryCode1 property value valueType';
        let encodedSelectStr = encodeURIComponent(selectStr);

        paramString = encodedStrSortJson + '&' + encodedSelectStr;

        queryString = '?';

    });
    it(' >> should return 200 and use system defaults for sort, select and skip and limit', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/' + paramString + queryString).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('GET ' + SettingsBaseRoute + '/:sort&:select - wrong select data', () => {
    let paramString, queryString;
    beforeAll(async () => {
        let sortJson = { applicationCode: 1 };
        let strSortJson = JSON.stringify(sortJson);
        let encodedStrSortJson = encodeURIComponent(strSortJson);

        let selectStr = '_id1 applicationCode1 categoryCode1 property value valueType';
        let encodedSelectStr = encodeURIComponent(selectStr);

        paramString = encodedStrSortJson + '&' + encodedSelectStr;

        let query = { skip: 0, limit: 3 };
        queryString = '?' + encodeURIComponent('skip') + '=' + encodeURIComponent(query.skip) + '&' + encodeURIComponent('limit') + '=' + encodeURIComponent(query.limit);
    });

    it(' >> should return 200 and takes only right parts in select', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/' + paramString + queryString).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }
        try {
            expect(response.body.data.length).toBe(3);
            printReqResToCSV(response, testDetails, 'response.body.data.length', 3, response.body.data.length, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.length', 3, response.body.data.length, 'Failed');
            throw (error);
        }

        try {
            expect(Object.keys(response.body.data[0]).length).toBe(4);
            printReqResToCSV(response, testDetails, 'Object.keys(response.body.data[0]).length', 4, Object.keys(response.body.data[0]).length, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'Object.keys(response.body.data[0]).length', 4, Object.keys(response.body.data[0]).length, 'Failed');
            throw (error);
        }
    });
});

describe('GET ' + SettingsBaseRoute + '/:sort&:select', () => {
    let paramString, queryString;
    beforeAll(async () => {
        let sortJson = { applicationCode: 1 };
        let strSortJson = JSON.stringify(sortJson);
        let encodedStrSortJson = encodeURIComponent(strSortJson);

        let selectStr = '_id applicationCode categoryCode property value valueType';
        let encodedSelectStr = encodeURIComponent(selectStr);

        paramString = encodedStrSortJson + '&' + encodedSelectStr;

        let query = { skip: 0, limit: 5 };
        queryString = '?' + encodeURIComponent('skip') + '=' + encodeURIComponent(query.skip) + '&' + encodeURIComponent('limit') + '=' + encodeURIComponent(query.limit);
    });
    it(' >> should return 200 and data per the passed sort, select, skip, limit', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/' + paramString + queryString).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }
        try {
            expect(response.body.data.length).toBe(5);
            printReqResToCSV(response, testDetails, 'response.body.data.length', 5, response.body.data.length, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.length', 5, response.body.data.length, 'Failed');
            throw (error);
        }

        try {
            expect(Object.keys(response.body.data[0]).length).toBe(6);
            printReqResToCSV(response, testDetails, 'Object.keys(response.body.data[0]).length', 6, Object.keys(response.body.data[0]).length, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'Object.keys(response.body.data[0]).length', 6, Object.keys(response.body.data[0]).length, 'Failed');
            throw (error);
        }
    });
});

describe('GET ' + SettingsBaseRoute + '/:applicationCode&:categoryCode&:property - wrong authorization token', () => {
    let paramString;
    beforeAll(async () => {
        let applicationCode = Setting.applicationCode;
        let categoryCode = Setting.categoryCode;
        let property = Setting.property;
        paramString = applicationCode + '&' + categoryCode + '&' + property;
    });
    it(' >> should return 401', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/' + paramString).set('Authorization', 'Bearer ' + InvalidToken);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(401);
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('GET ' + SettingsBaseRoute + '/:applicationCode&:categoryCode&:property - invalid data(3 params and wrong applicationCode)', () => {
    let paramString;
    beforeAll(async () => {
        let applicationCode = Setting.applicationCode + '1';
        let categoryCode = Setting.categoryCode;
        let property = Setting.property;
        paramString = applicationCode + '&' + categoryCode + '&' + property;
    });
    it(' >> should return 400 as it triggers GET/:sort&:select with wrong data', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/' + paramString).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('GET ' + SettingsBaseRoute + '/:applicationCode&:categoryCode&:property - invalid data(3 params and wrong categoryCode)', () => {
    let paramString;
    beforeAll(async () => {
        let applicationCode = Setting.applicationCode;
        let categoryCode = Setting.categoryCode + '1';
        let property = Setting.property;
        paramString = applicationCode + '&' + categoryCode + '&' + property;
    });
    it(' >> should return 400 as it triggers GET/:sort&:select with wrong data', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/' + paramString).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('GET ' + SettingsBaseRoute + '/:applicationCode&:categoryCode&:property - invalid data(3 params and wrong property)', () => {
    let paramString;
    beforeAll(async () => {
        let applicationCode = Setting.applicationCode;
        let categoryCode = Setting.categoryCode;
        let property = Setting.property + '1';
        paramString = applicationCode + '&' + categoryCode + '&' + property;
    });
    it('should return 400 as it triggers GET/:sort&:select with wrong data', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/' + paramString).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('GET ' + SettingsBaseRoute + '/:applicationCode&:categoryCode&:property', () => {
    let paramString;
    beforeAll(async () => {
        let applicationCode = Setting.applicationCode;
        let categoryCode = Setting.categoryCode;
        let property = Setting.property;
        paramString = applicationCode + '&' + categoryCode + '&' + property;
    });
    it(' >> should return 200 and the matching setting', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/' + paramString).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }

        try {
            expect(compareJsonObject(response.body.data, Setting)).toBe(true);
            printReqResToCSV(response, testDetails, 'response.body.data', Setting, response.body.data, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data', Setting, response.body.data, 'Failed');
            throw (error);
        }
    });
});

describe('GET ' + SettingsBaseRoute + '/count - wrong authorization token', () => {
    it(' >> should return 401', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/count').set('Authorization', 'Bearer ' + InvalidToken);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(401);
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('GET ' + SettingsBaseRoute + '/count', () => {
    it(' >> should return 200 and matching count', async () => {
        const response = await Request(BootstrapRoutes).get(SettingsBaseRoute + '/count').set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }
        try {
            expect(response.body.data.count).toBe(40);
            printReqResToCSV(response, testDetails, 'response.body.data.count', 40, response.body.data.count, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.count', 40, response.body.data.count, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/search/count - wrong authorization token', () => {
    let searchData = {};
    it('should return 401', async () => {
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/search/count').send(searchData).set('Authorization', 'Bearer ' + InvalidToken);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(401);
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/search/count - wrong data(invalid id in condition)', () => {
    let searchData = {};
    beforeAll(async () => {
        let condition = {
            _id: CreatedSetting._id.replaceAt(5, 'g')
        };
        let sortJson = {};
        let selectStr = '';
        let skip = 0;
        let limit = 5;
        searchData = {
            skip: skip,
            limit: limit,
            sort: sortJson,
            select: selectStr,
            condition: condition
        };
    });
    //_id has changed so it is treated as invalid object
    it(' >> should return 400 as query was for invalid object id', async () => {
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/search/count').send(searchData).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/search/count - wrong data(invalid condition)', () => {
    let searchData = {};
    beforeAll(async () => {
        searchData = { test: false };
    });
    it(' >> should return 400', async () => {
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/search/count').send(searchData).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/search/count - wrong data(not matching query and empty sort, empty select, no skip and no limit', () => {
    let searchData = {};
    beforeAll(async () => {
        let condition = {
            _id: CreatedSetting._id,
            applicationCode: CreatedSetting.applicationCode + '1',
            applicationName: CreatedSetting.applicationName + '1',
            categoryCode: CreatedSetting.categoryCode + '1',
            categoryName: CreatedSetting.categoryName + '1',
            property: CreatedSetting.property + '1',
            value: CreatedSetting.value + '1',
            isEditable: !CreatedSetting.isEditable,
        };
        let sortJson = {};
        let selectStr = '';
        searchData = {
            sort: sortJson,
            select: selectStr,
            condition: condition
        };
    });

    it(' >> should return 200 and 0 search count', async () => {
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/search/count').send(searchData).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }
        try {
            expect(response.body.data.count).toBe(0);
            printReqResToCSV(response, testDetails, 'response.body.data.count', 0, response.body.data.count, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.count', 0, response.body.data.count, 'Failed');
            throw (error);
        }
    });
});


describe('POST ' + SettingsBaseRoute + '/search/count - wrong data(invalid fields in query)', () => {
    let searchData = {};
    beforeAll(async () => {
        let condition = {
            _id: CreatedSetting._id,
            applicationCode: CreatedSetting.applicationCode + '1',
            applicationName: CreatedSetting.applicationName + '1',
            categoryCode: CreatedSetting.categoryCode + '1',
            categoryName: CreatedSetting.categoryName + '1',
            property: CreatedSetting.property + '1',
            value: CreatedSetting.value + '1',
            isEditable: !CreatedSetting.isEditable,
        };
        let sortJson = {};
        let selectStr = '_id applicationCode applicationName categoryCode categoryName property value valueType isEditable description createdBy updatedBy createdAt updatedAt __v';
        let skip = 0;
        let limit = 5;
        searchData = {
            sort: sortJson,
            select: selectStr,
            condition: condition
        };
    });

    it(' >> should return 200 and 0 search count', async () => {
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/search/count').send(searchData).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;
        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }
        try {
            expect(response.body.data.count).toBe(0);
            printReqResToCSV(response, testDetails, 'response.body.data.count', 0, response.body.data.count, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.count', 0, response.body.data.count, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/search/count - wrong data( invalid single field in query)', () => {
    let searchData = {};
    beforeAll(async () => {
        let condition = {
            _id: CreatedSetting._id,
            applicationCode: [CreatedSetting.applicationCode + '1', CreatedSetting.applicationCode + '2'],
            applicationName: CreatedSetting.applicationName,
            categoryCode: CreatedSetting.categoryCode,
            categoryName: CreatedSetting.categoryName,
            property: CreatedSetting.property,
            value: CreatedSetting.value,
            isEditable: CreatedSetting.isEditable
        };

        let sortJson = {};
        let selectStr = '_id applicationCode applicationName categoryCode categoryName property value valueType isEditable description createdBy updatedBy createdAt updatedAt __v';

        searchData = {
            sort: sortJson,
            select: selectStr,
            condition: condition
        };
    });    //_id has changes so it is treated as invalid object
    it(' >> should return 200 and 0 search count', async () => {
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/search/count').send(searchData).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }
        try {
            expect(response.body.data.count).toBe(0);
            printReqResToCSV(response, testDetails, 'response.body.data.count', 0, response.body.data.count, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.count', 0, response.body.data.count, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/search/count - valid data(with single field)', () => {
    let searchData = {};
    beforeAll(async () => {
        let condition = {
            categoryCode: 'cat1',
        };

        let sortJson = {};
        let selectStr = '_id applicationCode applicationName categoryCode categoryName property value valueType isEditable description createdBy updatedBy createdAt updatedAt __v';
        searchData = {
            sort: sortJson,
            select: selectStr,
            condition: condition
        };
    });
    it(' >> should return 200 and 6 as search count', async () => {
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/search/count').send(searchData).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }

        try {
            expect(response.body.data.count).toBe(6);
            printReqResToCSV(response, testDetails, 'response.body.data.count', 6, response.body.data.count, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.count', 6, response.body.data.count, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/search/count - valid data(with multiple fields)', () => {
    let searchData = {};
    beforeAll(async () => {
        let condition = {
            _id: CreatedSetting._id,
            applicationCode: CreatedSetting.applicationCode,
            applicationName: CreatedSetting.applicationName,
            categoryCode: CreatedSetting.categoryCode,
            categoryName: CreatedSetting.categoryName,
            property: CreatedSetting.property,
            value: CreatedSetting.value,
            isEditable: CreatedSetting.isEditable
        };

        let sortJson = {};
        let selectStr = '_id applicationCode applicationName categoryCode categoryName property value valueType isEditable description createdBy updatedBy createdAt updatedAt __v';
        let skip = 0;
        let limit = 5;

        searchData = {
            skip: skip,
            limit: limit,
            sort: sortJson,
            select: selectStr,
            condition: condition
        };
    });

    it(' >> should return 200 and 1 as search count', async () => {
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/search/count').send(searchData).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 'some-error', response.statusCode, 'Failed');
            throw (error);
        }

        try {
            expect(response.body.data.count).toBe(1);
            printReqResToCSV(response, testDetails, 'response.body.data.count', 1, response.body.data.count, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.count', 1, response.body.data.count, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/search - wrong authorization token', () => {
    let searchData = {};

    it(' >> should return 401', async () => {
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/search').send(searchData).set('Authorization', 'Bearer ' + InvalidToken);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(401);
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/search - wrong data(no query condition)', () => {
    let searchData = {};
    beforeAll(async () => {

        let sortJson = {};
        let selectStr = '';
        let skip = 0;
        let limit = 5;

        searchData = {
            skip: skip,
            limit: limit,
            sort: sortJson,
            select: selectStr,
        };
    });
    it(' >> should return 400', async () => {
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/search').send(searchData).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/search - wrong data(invalid id)', () => {
    let searchData = {};
    beforeAll(async () => {
        let condition = {
            _id: CreatedSetting._id.replaceAt(5, 'g')
        };

        let sortJson = {};
        let selectStr = '';
        let skip = 0;
        let limit = 5;

        searchData = {
            skip: skip,
            limit: limit,
            sort: sortJson,
            select: selectStr,
            condition: condition
        };
    });
    //_id has changes so it is treated as invalid object
    it(' >> should return 400 as passed object id is invalid', async () => {
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/search').send(searchData).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/search - wrong data(invalid fields, no skip and limit)', () => {
    let searchData = {};
    beforeAll(async () => {
        let condition = {
            _id: CreatedSetting._id,
            applicationCode: CreatedSetting.applicationCode + '1',
            applicationName: CreatedSetting.applicationName + '1',
            categoryCode: CreatedSetting.categoryCode + '1',
            categoryName: CreatedSetting.categoryName + '1',
            property: CreatedSetting.property + '1',
            value: CreatedSetting.value + '1',
            isEditable: !CreatedSetting.isEditable,
        };

        let sortJson = { applicationCode: 1 };
        let selectStr = '_id applicationCode applicationName categoryCode categoryName property value valueType isEditable description createdBy updatedBy createdAt updatedAt __v';

        searchData = {
            sort: sortJson,
            select: selectStr,
            condition: condition
        };
    });

    it(' >> should return 200 and 0 search results', async () => {
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/search').send(searchData).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }

        try {
            expect(response.body.data.length).toBe(0);
            printReqResToCSV(response, testDetails, 'response.body.data.length', 0, response.body.data.length, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.length', 0, response.body.data.length, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/search - wrong data( invalid single field)', () => {
    let searchData = {};
    beforeAll(async () => {
        let condition = {
            _id: CreatedSetting._id,
            applicationCode: [CreatedSetting.applicationCode + '1', CreatedSetting.applicationCode + '2'],
            applicationName: CreatedSetting.applicationName,
            categoryCode: CreatedSetting.categoryCode,
            categoryName: CreatedSetting.categoryName,
            property: CreatedSetting.property,
            value: CreatedSetting.value,
            isEditable: CreatedSetting.isEditable
        };

        let sortJson = {};
        let selectStr = '_id applicationCode applicationName categoryCode categoryName property value valueType isEditable description createdBy updatedBy createdAt updatedAt __v';
        let skip = 0;
        let limit = 5;

        searchData = {
            skip: skip,
            limit: limit,
            sort: sortJson,
            select: selectStr,
            condition: condition
        };
    });

    it(' >> should return 200 and 0 search results', async () => {
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/search').send(searchData).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 0, response.statusCode, 'Failed');
            throw (error);
        }

        try {
            expect(response.body.data.length).toBe(0);
            printReqResToCSV(response, testDetails, 'response.body.data.length', 0, response.body.data.length, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.length', 0, response.body.data.length, 'Failed');
            throw (error);
        }
    });
});


describe('POST ' + SettingsBaseRoute + '/search - valid data(single field)', () => {
    let searchData = {};
    beforeAll(async () => {
        let condition = {
            categoryCode: 'cat1',
        };

        let sortJson = {};
        let selectStr = '_id applicationCode applicationName categoryCode categoryName property value valueType isEditable description createdBy updatedBy createdAt updatedAt __v';
        let skip = 0;
        let limit = 5;

        searchData = {
            skip: skip,
            limit: limit,
            sort: sortJson,
            select: selectStr,
            condition: condition
        };
    });

    it(' >> should return 200 and 5 results', async () => {
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/search').send(searchData).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }

        try {
            expect(response.body.data.length).toBe(5);
            printReqResToCSV(response, testDetails, 'response.body.data.length', 5, response.body.data.length, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.length', 5, response.body.data.length, 'Failed');
            throw (error);
        }
    });
});

describe('POST ' + SettingsBaseRoute + '/search - valid data(multiple fields)', () => {
    let searchData = {};
    beforeAll(async () => {
        let condition = {
            _id: CreatedSetting._id,
            applicationCode: CreatedSetting.applicationCode,
            applicationName: CreatedSetting.applicationName,
            categoryCode: CreatedSetting.categoryCode,
            categoryName: CreatedSetting.categoryName,
            property: CreatedSetting.property,
            value: CreatedSetting.value,
            isEditable: CreatedSetting.isEditable
        };

        let sortJson = {};
        let selectStr = '_id applicationCode applicationName categoryCode categoryName property value valueType isEditable description createdBy updatedBy createdAt updatedAt __v';
        let skip = 0;
        let limit = 5;

        searchData = {
            skip: skip,
            limit: limit,
            sort: sortJson,
            select: selectStr,
            condition: condition
        };
    });

    it(' >> should return 200 and 1 result', async () => {
        const response = await Request(BootstrapRoutes).post(SettingsBaseRoute + '/search').send(searchData).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }

        try {
            expect(response.body.data.length).toBe(1);
            printReqResToCSV(response, testDetails, 'response.body.data.length', 1, response.body.data.length, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.length', 1, response.body.data.length, 'Failed');
            throw (error);
        }

        try {
            expect(compareJsonObject(response.body.data[0], CreatedSetting)).toBe(true);
            printReqResToCSV(response, testDetails, 'response.body.data[0]', CreatedSetting, response.body.data, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data[0]', CreatedSetting, response.body.data, 'Failed');
            throw (error);
        }
    });
});

describe('PUT ' + SettingsBaseRoute + '/:_id - wrong authorization token', () => {
    let updatedSetting;
    let settingIdToUpdate;
    beforeAll(async () => {
        settingIdToUpdate = CreatedSetting._id;
        settingIdToUpdate = encodeURIComponent(settingIdToUpdate);
        updatedSetting = {
            catagoryCode: 'cat4',
            catagoryName: 'Category 4',
            property: 'jest.test.1515',
            value: '0',
            valueType: 'integer'
        };

    });
    it(' >> should return 401', async () => {
        const response = await Request(BootstrapRoutes).put(SettingsBaseRoute + '/' + settingIdToUpdate).send(updatedSetting).set('Authorization', 'Bearer ' + InvalidToken);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(401);
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('PUT ' + SettingsBaseRoute + '/:_id - wrong data(invalid id)', () => {
    let updatedSetting;
    let settingIdToUpdate;
    beforeAll(async () => {
        settingIdToUpdate = CreatedSetting._id.replaceAt(3, 'g');
        settingIdToUpdate = encodeURIComponent(settingIdToUpdate);

        updatedSetting = {
            catagoryCode: 'cat4',
            catagoryName: 'Category 4',
            property: 'jest.test.1515',
            value: '0',
            valueType: 'integer'
        };
    });
    it(' >> should return 400', async () => {
        const response = await Request(BootstrapRoutes).put(SettingsBaseRoute + '/' + settingIdToUpdate).send(updatedSetting).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('PUT ' + SettingsBaseRoute + '/:_id - wrong data(non-existant id)', () => {
    let updatedSetting;
    let nonextitantObjectId;
    beforeAll(async () => {
        nonextitantObjectId = new ObjectId();

        updatedSetting = {
            catagoryCode: 'cat4',
            catagoryName: 'Category 4',
            property: 'jest.test.1515',
            value: '0',
            valueType: 'integer'
        };
    });
    it(' >> should return 400', async () => {
        const response = await Request(BootstrapRoutes).put(SettingsBaseRoute + '/' + nonextitantObjectId.toString()).send(updatedSetting).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});


describe('PUT ' + SettingsBaseRoute + '/:_id', () => {
    let updatedSetting;
    let settingIdToUpdate;
    beforeAll(async () => {
        settingIdToUpdate = CreatedSetting._id;
        settingIdToUpdate = encodeURIComponent(settingIdToUpdate);
        updatedSetting = {
            catagoryCode: 'cat4',
            catagoryName: 'Category 4',
            property: 'jest.test.1515',
            value: '0',
            valueType: 'integer'
        };
    });
    it(' >> should return 200', async () => {
        const response = await Request(BootstrapRoutes).put(SettingsBaseRoute + '/' + settingIdToUpdate).send(updatedSetting).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }

        try {
            expect(response.body.data.property).toBe(updatedSetting.property);
            printReqResToCSV(response, testDetails, 'response.body.data.property', updatedSetting.property, response.body.data.property, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.property', updatedSetting.property, response.body.data.property, 'Failed');
            throw (error);
        }
    });
});

describe('DELETE ' + SettingsBaseRoute + '/:_id - wrong authorization token', () => {
    it(' >> should return 401', async () => {
        const response = await Request(BootstrapRoutes).delete(SettingsBaseRoute + '/' + CreatedSetting._id.replaceAt(3, 'g')).set('Authorization', 'Bearer ' + InvalidToken);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(401);
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('DELETE ' + SettingsBaseRoute + '/:_id - wrong data(invalid _id)', () => {
    it(' >> should return 400', async () => {
        const response = await Request(BootstrapRoutes).delete(SettingsBaseRoute + '/' + CreatedSetting._id.replaceAt(3, 'g')).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('DELETE ' + SettingsBaseRoute + '/:_id - wrong data(non-existant id)', () => {
    let nonextitantObjectId;
    it(' >> should return 400', async () => {
        nonextitantObjectId = new ObjectId();

        const response = await Request(BootstrapRoutes).delete(SettingsBaseRoute + '/' + nonextitantObjectId.toString()).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('DELETE ' + SettingsBaseRoute + '/:_id', () => {
    it(' >> should return 200 and deleted setting', async () => {
        const response = await Request(BootstrapRoutes).delete(SettingsBaseRoute + '/' + CreatedSetting._id).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }

        try {
            expect(response.body.data._id).toBe(CreatedSetting._id);
            printReqResToCSV(response, testDetails, 'response.body.data._id', CreatedSetting._id, response.body.data._id, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data._id', CreatedSetting._id, response.body.data._id, 'Failed');
            throw (error);
        }
    });
});

describe('DELETE ' + SettingsBaseRoute + '/ with - wrong authorization token', () => {
    var createdSettingIds;
    beforeAll(async () => {
        createdSettingIds = { _ids: CreatedSettings.map(cs => cs._id) };
    });
    it(' >> should return 401', async () => {
        const response = await Request(BootstrapRoutes).delete(SettingsBaseRoute + '/').send(createdSettingIds).set('Authorization', 'Bearer ' + InvalidToken);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(401);
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 401, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('DELETE ' + SettingsBaseRoute + '/ - wrong data(no req.body._ids)', () => {
    var createdSettingIds;
    beforeAll(async () => {
        createdSettingIds = { _ids1: CreatedSettings.map(cs => cs._id) };
    });
    it('should return 400', async () => {
        const response = await Request(BootstrapRoutes).delete(SettingsBaseRoute + '/').send(createdSettingIds).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});

describe('DELETE ' + SettingsBaseRoute + '/ - wrong data(one invalid id in req.body._ids)', () => {
    var createdSettingIds;
    beforeAll(async () => {
        createdSettingIds = JSON.parse(JSON.stringify({ _ids: CreatedSettings.map(cs => cs._id) }));
        createdSettingIds._ids[0] = new ObjectId();
        createdSettingIds._ids[1] = new ObjectId();
        createdSettingIds._ids[2] = new ObjectId();
        createdSettingIds._ids[3] = new ObjectId();
    });
    it('should return 400', async () => {
        const response = await Request(BootstrapRoutes).delete(SettingsBaseRoute + '/').send(createdSettingIds).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(400);
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 400, response.statusCode, 'Failed');
            throw (error);
        }
    });
});


describe('DELETE ' + SettingsBaseRoute + '/ - 4 settings', () => {
    var createdSettingIds;
    beforeAll(async () => {
        createdSettingIds = { _ids: CreatedSettings.map(cs => cs._id) };
    });
    it(' >> should return 200 and delete count 4', async () => {
        const response = await Request(BootstrapRoutes).delete(SettingsBaseRoute + '/').send(createdSettingIds).set('Authorization', 'Bearer ' + Token);
        const testDetails = expect.getState().currentTestName;

        try {
            expect(response.statusCode).toBe(200);
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.statusCode', 200, response.statusCode, 'Failed');
            throw (error);
        }

        try {
            expect(response.body.data.deletedCount).toBe(4);
            printReqResToCSV(response, testDetails, 'response.body.data.deletedCount', 4, response.body.data.deletedCount, 'Passed');
        } catch (error) {
            printReqResToCSV(response, testDetails, 'response.body.data.deletedCount', 4, response.body.data.deletedCount, 'Failed');
            throw (error);
        }

    });
});
