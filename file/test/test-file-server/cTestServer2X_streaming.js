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
    const axios = require('axios');

    let file = '300mb.txt';
    const source = fs.createReadStream('./' + file);
    var stats = fs.statSync('./' + file);
    /////////from source  end

    /////////for progress monitor  start
    var consolidatedUploadSize = 0;
    source.on('error', function (err) {
        console.log('stream error', err);
    });
    source.on('drain', function () {
        console.log('stream drain');
    });
    source.on('pause', function () {
        console.log('stream pause');
    });
    source.on('unpipe', function () {
        console.log('stream drain');
    });
    source.on('close', function () {
        console.log('cTestServer2X_streaming - ' + file + '; stream close');
    });
    source.on('data', (chunk) => {
        consolidatedUploadSize += chunk.length;
        console.log('cTestServer2X_streaming - ' + file + '; percent progress = ' + consolidatedUploadSize * 100 / stats.size);
    });
    source.on('finish', () => {
        console.log('cTestServer2X_streaming - ' + file + '; stream finish');
    });
    source.on('end', () => {
        console.log('cTestServer2X_streaming - ' + file + '; stream end');
    });
    /////////for progress monitor  end

    /////////to destination  start
    const config = {
        headers: {
            destinationfilepath: 'streamed_' + file,
            streamsize: stats.size
        }
    };
    console.log('cTestServer2X_streaming - ' + file + ' - start');

    let result = await axios.put(
        'http://localhost:3000/',
        source,
        config
    );
    console.log(result);
    console.log('cTestServer2X_streaming - ' + file + ' - end');
    /////////to destination  end
}

myMain();