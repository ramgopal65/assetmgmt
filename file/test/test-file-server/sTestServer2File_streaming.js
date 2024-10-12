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
    /////////source & destination start
    console.log(req.headers);
    console.log(req.headers.destinationfilepath);
    console.log(req.headers.streamsize);
    //createWriteStream cannot create directory - fyi
    const fs = require('fs');
    const fileName = req.headers.destinationfilepath;
    const newFile = fs.createWriteStream(req.headers.destinationfilepath);
    req.pipe(newFile);
    /////////source & destination end

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
        console.log('sTestServer2File_streaming - ' + fileName + 'stream close');
    });
    req.on('data', (chunk) => {
        consolidatedUploadSize += chunk.length;
        console.log('sTestServer2File_streaming - ' + fileName + 'percent progress = ' + consolidatedUploadSize * 100 / req.headers.streamsize);
    });
    req.on('finish', () => {
        console.log('sTestServer2File_streaming - ' + fileName + 'stream finish');
        res.send('finished');
    });
    req.on('end', () => {
        console.log('sTestServer2File_streaming - ' + fileName + 'stream end');
        res.send('ended');
    });
    /////////for progress monitor  end

});

app.listen(port, () => {
    console.log(`This is test file server. will write content to file instead of s3. listening on port ${port}`);
});
/////////express server end
