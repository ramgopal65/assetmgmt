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


/////////express server start
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('This is test file server. will write content to file instead of s3.');
});

app.put('/', (req, res, next) => {
    console.log(req.headers);
    console.log(req.headers.destinationfilepath);
    console.log(req.headers.streamsize);

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
    var s3 = new AWS.S3({});

    // call S3 to retrieve upload file to specified bucket
    var uploadParams = {
        Bucket: 'visit.ai-prod', Key: '', Body: ''
    };
    /////////for s3 operations  end

    /////////for progress monitor  start
    var consolidatedUploadSize = 0;
    req.on('error', function (err) {
        console.log('stream error', err);
    });
    req.on('drain', function () {
        console.log('stream drain');
    });
    req.on('resume', function () {
        console.log('stream resume');
    });
    req.on('pause', function () {
        console.log('stream pause');
    });
    req.on('unpipe', function () {
        console.log('stream drain');
    });
    req.on('close', function () {
        console.log('sTestServer2S3_streaming - ' + req.headers.destinationfilepath + '; stream close');
    });
    req.on('data', (chunk) => {
        consolidatedUploadSize += chunk.length;
        console.log('sTestServer2S3_streaming - ' + req.headers.destinationfilepath + '; percent progress = ' + consolidatedUploadSize * 100 / req.headers.streamsize);
    });
    req.on('finish', () => {
        console.log('sTestServer2S3_streaming - ' + req.headers.destinationfilepath + '; stream finish');
        res.send('finished');
    });
    req.on('end', () => {
        console.log('sTestServer2S3_streaming - ' + req.headers.destinationfilepath + '; stream end');
        res.send('ended');
    });
    /////////for progress monitor  end

    /////////to destination  start
    uploadParams.Body = req;
    uploadParams.Key = req.headers.destinationfilepath;

    console.log('sTestServer2S3_streaming - ' + req.headers.destinationfilepath + ' - start');
    s3.upload(uploadParams, function (err, data) {
        if (err) {
            console.log('Error', err);
            //fileStream.error();
        }
        if (data) {
            console.log('Upload Success', data);
        }
    });
    console.log('sTestServer2S3_streaming - ' + req.headers.destinationfilepath + ' - end');
    /////////to destination  end
});

app.listen(port, () => {
    console.log(`This is test file server. will write content to file instead of s3. listening on port ${port}`);
});
/////////express server end