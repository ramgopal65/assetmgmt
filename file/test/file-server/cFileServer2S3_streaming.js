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


async function myMain() {
    /////////from source  start
    const fs = require('fs');
    let file = '300mb.txt';
    const rs = fs.createReadStream('./' + file);
    var fileStats = fs.statSync('./' + file);
    /////////from source  end

    /////////for progress monitor  start
    const { PassThrough } = require('stream');
    let consolidatedUploadSize = 0;
    const monitor = new PassThrough();

    monitor.on('error', function (err) {
        console.log('stream error', err);
    });
    monitor.on('drain', function () {
        console.log('stream drain');
    });
    monitor.on('pause', function () {
        console.log('stream pause');
    });
    monitor.on('unpipe', function () {
        console.log('stream drain');
    });
    monitor.on('close', function () {
        console.log('cFileServer2S3_streaming - ' + file + '; stream close');
    });
    monitor.on('data', (chunk) => {
        consolidatedUploadSize += chunk.length;
        console.log('cFileServer2S3_streaming - ' + file + '; percent progress = ' + consolidatedUploadSize * 100 / fileStats.size);
    });
    monitor.on('finish', () => {
        console.log('cFileServer2S3_streaming - ' + file + '; stream finish');
    });
    monitor.on('end', () => {
        console.log('cFileServer2S3_streaming - ' + file + '; stream end');
    });
    /////////for progress monitor  end

    /////////to destination  start
    const config = {
        headers: {
            destinationfilepath: 'test/aaa/' + file,
            streamsize: fileStats.size
        }
    };

    const axios = require('axios');
    console.log(config.headers.destinationfilepath + ' - ' + ' - start');
    let result = await axios.put(
        'http://localhost:9004/file',
        rs.pipe(monitor),
        config
    );
    console.log(config.headers.destinationfilepath + ' - ' + ' - end');
    /////////to destination  end
}

myMain();