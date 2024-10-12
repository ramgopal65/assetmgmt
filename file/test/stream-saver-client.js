const fs = require('fs');
const { Transform, PassThrough } = require('stream');
const axios = require('axios');
const rs = fs.createReadStream('./file/test/txtfile');
var fileStats = fs.statSync('./file/test/txtfile');

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
    console.log('heap mem usage - ' + process.memoryUsage().heapUsed);
    console.log('stream progress = ' + consolidatedUploadSize * 100 / fileStats.size);
});
monitor.on('end', () => {
    console.log('stream upoload complete');
});

const config = {
    headers: {
        destinationfilepath: 'filenamefromheader.txt',
        streamsize: fileStats.size
    }
};
axios.put(
    'http://localhost:3000/',
    rs.pipe(monitor),
    config
);
