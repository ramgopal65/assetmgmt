const fs = require('fs');
const { PassThrough } = require('stream');
const axios = require('axios');
const rs = fs.createReadStream('./violet.jpeg');
var fileStats = fs.statSync('./violet.jpeg');

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
        filename: 'violet.jpeg',
        streamsize: fileStats.size,
        Authorization: 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib3Jxc2lvIiwianRpIjoiNjY0MmI3ZmVhMGY0MTU1OTQ5ZjU0ZTMzIiwiYXVkIjoiY29hY2giLCJzdWIiOiJzc28gdG9rZW4gZm9yIGNvYWNoIiwiaWF0IjoxNzE1NjQ4NTI4MDIyLCJleHAiOjE3MTgyNDA1MjgwMjJ9.W4KauYK99_XklOPSXp8V-lV4Bhdwy6RuTXSsrp7AeE0'
    }
};
axios.post(
    'http://localhost:9002/assetmgmt/user/profile-pic',
    rs.pipe(monitor),
    config
);
