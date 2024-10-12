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
    let file = 'test/aaa/300mb.txt';
    const filestream = fs.createWriteStream('./tmpfile');
    /////////from source  end

    /////////for progress monitor  start
    let consolidatedDownloadSize = 0;

    filestream.on('error', function (err) {
        console.log('stream error', err);
    });
    filestream.on('drain', function () {
        console.log('stream drain');
        //console.log(chunk.length);
    });
    filestream.on('pause', function () {
        console.log('stream pause');
    });
    filestream.on('unpipe', function () {
        //console.log('stream drain');
    });
    filestream.on('close', function () {
        console.log('cS32FileServer2here_streaming - ' + '; stream close');
    });
    filestream.on('data', (chunk) => {
        console.log('Hello');
        consolidatedDownloadSize += chunk.length;
        console.log('cS32FileServer2here_streaming - ' + '; percent progress = ' + consolidatedDownloadSize * 100 / res1.getHeader('streamsize'));
    });
    filestream.on('finish', () => {
        console.log('cS32FileServer2here_streaming - '+ '; stream finish');
    });
    filestream.on('end', () => {
        console.log('cS32FileServer2here_streaming - '+ '; stream end');
    });
    /////////for progress monitor  end

    const axios = require('axios');
    let res1 = await axios.get(
        'http://localhost:9004/file/' + '?' + file,
        { responseType: 'stream' }
    );
    console.log(file + ' - start');
    console.log(res1.headers.streamsize);
    await res1.data.pipe(filestream);
    console.log(file + ' - end');
    /////////to destination  end
}

myMain();
