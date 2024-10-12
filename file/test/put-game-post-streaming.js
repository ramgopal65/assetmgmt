const fs = require('fs');
const { PassThrough } = require('stream');
const axios = require('axios');
const rs = fs.createReadStream('./large_128mb_sample_3840x2160 - Copy.mp4');
var fileStats = fs.statSync('./large_128mb_sample_3840x2160 - Copy.mp4');

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
        filename: 'large_128mb_sample_3840x2160 - Copy.mp4',
        streamsize: fileStats.size,
        Authorization: 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib3Jxc2lvIiwianRpIjoiNjY0MmI3ZGVhMGY0MTU1OTQ5ZjU0ZTBmIiwiYXVkIjoicGxheWVyIiwic3ViIjoic3NvIHRva2VuIGZvciBwbGF5ZXIiLCJpYXQiOjE3MTU2NDg1MDAyMzYsImV4cCI6MTcxODI0MDUwMDIzNn0.8kqbt5y48PaUCP8APZv7nFNtj7JiyX8P6HeFmNmHx0I'
    }
};
axios.put(
    'http://localhost:9002/assetmgmt/post?type=game&sharedWith=6642b832a0f4155949f54e71',
    rs.pipe(monitor),
    config
);
