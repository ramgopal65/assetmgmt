/////////Logging with timestame - start
const Util = require('util');

var consoleFuncs = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console)
};
Object.keys(consoleFuncs).forEach(function (k) {
    console[k] = function () {
        var K = k.toUpperCase();
        arguments[0] = Util.format('[' + new Date().toISOString() + ']' + '[' + K + ']', arguments[0]);
        consoleFuncs[k].apply(console, arguments);
    };
});
/////////Logging with timestame - end

/////////for s3 operations  start
var AWS = require('aws-sdk');
AWS.config.update({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: 'AKIA6F53773QPIAXLQ5X',
        secretAccessKey: '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',
    },
});
// Create S3 service object
var s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// call S3 to retrieve upload file to specified bucket
var uploadParams = {
    Bucket: 'visit.ai-prod', Key: '', Body: ''
};
/////////for s3 operations  end

async function myMain() {
    /////////from source  start
    let file = '300mb.txt';
    var fs = require('fs');
    var stats = fs.statSync('./' + file);
    var fileStream = fs.createReadStream('./' + file);
    /////////from source  end

    /////////for progress monitor  start
    var consolidatedUploadSize = 0;
    fileStream.on('error', function (err) {
        console.log('stream error', err);
    });
    fileStream.on('drain', function () {
        console.log('stream drain');
    });
    fileStream.on('pause', function () {
        console.log('stream pause');
    });
    fileStream.on('unpipe', function () {
        console.log('stream drain');
    });
    fileStream.on('close', function () {
        console.log('cS3_streaming - ' + file + 'stream close');
    });
    fileStream.on('data', (chunk) => {
        consolidatedUploadSize += chunk.length;
        console.log('cS3_streaming - ' + file + 'percent progress = ' + consolidatedUploadSize * 100 / stats.size);
    });
    fileStream.on('finish', () => {
        console.log('cS3_streaming - ' + file + 'stream finish');
    });
    fileStream.on('end', () => {
        console.log('cS3_streaming - ' + file + 'stream end');
    });
    /////////for progress monitor  end


    /////////to destination  start
    uploadParams.Body = fileStream;
    uploadParams.Key = 'test/cTestServer2X_streaming/' + file;

    console.log('cS3_streaming - ' + file + ' - start');
    await s3.upload(uploadParams, function (err, data) {
        if (err) {
            console.log('Error', err);
            //fileStream.error();
        }
        if (data) {
            console.log('Upload Success', data);
        }
    });
    console.log('cS3_streaming - ' + file + ' - end');
    /////////to destination  end
}

myMain();
