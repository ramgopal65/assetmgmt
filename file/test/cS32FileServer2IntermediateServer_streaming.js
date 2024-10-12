const fs = require('fs');
const { PassThrough } = require('stream');
const axios = require('axios');
const ws = fs.createWriteStream('./tmpfile.txt');

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


async function myMail() {
    let consolidatedDownloadSize = 0;
    const monitor = new PassThrough();
    monitor.on('error', function (err) {
        console.log('stream error', err);
    });
    monitor.on('close', function () {
        console.log('stream close');
    });
    monitor.on('data', (chunk) => {
        consolidatedDownloadSize += chunk.length;
        //console.log('heap mem usage - ' + process.memoryUsage().heapUsed);
        console.log('stream progress = ' + consolidatedDownloadSize * 100);
    });
    monitor.on('end', () => {
        console.log('stream upoload complete');
    });





    let res1 = await axios.get(
        'http://localhost:3001/',
        { responseType: 'stream' }
    );
    await res1.data.pipe(monitor).pipe(ws);

    //axios
    //    .get(
    //        'http://localhost:3001/',
    //        config,
    //        { responseType: 'stream' }
    //    )
    //    .then(response => {
    //        response.data.pipe(monitor).pipe(ws);
    //        //console.log(response);
    //    });
}




myMail();