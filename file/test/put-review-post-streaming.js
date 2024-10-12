const fs = require('fs');
const { PassThrough } = require('stream');
const axios = require('axios');
const rs = fs.createReadStream('./300 m b .zip');
var fileStats = fs.statSync('./300 m b .zip');

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

let consolidatedUploadSize = 0;
const monitor = new PassThrough();
monitor.on('error', function (err) {
    console.log('stream error', err);
});
monitor.on('close', function () {
    console.log('stream close');
});
monitor.on('data', (chunk) => {
    consolidatedUploadSize += chunk.length;
    //console.log('heap mem usage - ' + process.memoryUsage().heapUsed);
    console.log('stream progress = ' + consolidatedUploadSize * 100 / fileStats.size);
});
monitor.on('end', () => {
    console.log('stream upoload complete');
});

const config = {
    headers: {
        filename: '300 m b .zip',
        streamsize: fileStats.size,
        Authorization: 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib3Jxc2lvIiwianRpIjoiNjY0MmI4MzJhMGY0MTU1OTQ5ZjU0ZTcxIiwiYXVkIjoiY29hY2giLCJzdWIiOiJzc28gdG9rZW4gZm9yIGNvYWNoIiwiaWF0IjoxNzE1NjQ4NTg4NTAzLCJleHAiOjE3MTgyNDA1ODg1MDN9.yAgIyC9kY-1hAtgULOUhOlIUyZtB7yFAWQlgUuCJ_Pk'
    }
};
console.log(config);

axios.put(
    'http://localhost:9002/assetmgmt/post?type=review&gamePost=6642c587c9daa1f960c89b0f',
    rs.pipe(monitor),
    config
);
