const Request = require('supertest');
var filesServer;
let isAlreadyRunning = true;
require('dotenv').config();

//TODO: move to vaults in cloud from ENV for authentication keys
const ENV = process.env;

const delay = ms => new Promise(res => setTimeout(res, ms));
const port = ENV.ASSETMGMT_FILES_PORT || 9004;
const FilesBaseRoute = 'http://localhost:' + port;
const FilesRoute = '/files';
const HealthBaseRoute = '/files/health';

const path = require('path');

const fs = require('fs');
//To delete any existing .csv file related with these test cases
const projectDirectory = process.cwd();
const csvFileName = path.join(projectDirectory, 'output-files.csv');
beforeAll(() => {
    if (fs.existsSync(csvFileName)) {
        fs.unlinkSync(csvFileName);
    }
});

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
        let response = await Request(FilesBaseRoute).get(HealthBaseRoute);
        if (response.body.code == 200 && (response.body.message = 'healthy')) {
            isAlreadyRunning = true;
            console.log('server already running');
            filesServer = null;
        } else {
            isAlreadyRunning = false;
            console.log('starting server now');
            filesServer = await require('../../files/bin/files');
            //TODO: how to wait for the server tobe up here?
            await delay(15000);
        }
    } catch (e) {
        console.log(e);
        isAlreadyRunning = false;
        console.log(e + ' - starting server now');
        filesServer = await require('../../files/bin/files');
        //TODO: how to wait for the server tobe up here?
        await delay(15000);
    }
}, 30000);

afterAll(async () => {
    if (!isAlreadyRunning) {
        filesServer.close();
    }
});

let testFilePath = null;
describe('POST /files/upload - upload a new file', () => {
    const filePath = `${__dirname}\testFiles\irseuropa.png`;
    console.log("filepath: ", filePath);
    it('should upload the test file', () =>
        // Test if the test file is exist
        fs.exists(filePath)
            .then(async (exists) => {
                if (!exists) throw new Error('file does not exist');
                return Request(FilesBaseRoute)
                    .post('/files/upload')
                    // Attach the file with key 'file' which is corresponding to your endpoint setting. 
                    .attach('file', filePath)
                    .then((res) => {
                        const { success, message, filePath } = res.body;
                        expect(success).toBeTruthy();
                        expect(message).toBe('Uploaded successfully');
                        expect(typeof filePath).toBeTruthy();
                        // store file data for following tests
                        testFilePath = filePath;
                    })
                    .catch(err => console.log(err));
            })
    )
})

