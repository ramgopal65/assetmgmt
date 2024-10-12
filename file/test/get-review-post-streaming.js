const fs = require('fs');
const { PassThrough } = require('stream');
const axios = require('axios');
const ws = fs.createWriteStream('./postfile');

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


async function myMain() {
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
        //console.log('stream progress = ' + consolidatedDownloadSize * 100);
    });
    monitor.on('end', () => {
        console.log('stream download complete');
    });

    try {
        let res1 = await axios.get(
            'http://localhost:9002/assetmgmt/post?postId=6642c587c9daa1f960c89b0f&type=review',
            {
                headers: {
                    Authorization: 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib3Jxc2lvIiwianRpIjoiNjY0MmI4MTlhMGY0MTU1OTQ5ZjU0ZTUyIiwiYXVkIjoicGxheWVyIiwic3ViIjoic3NvIHRva2VuIGZvciBwbGF5ZXIiLCJpYXQiOjE3MTU2NDg1NTQzMDQsImV4cCI6MTcxODI0MDU1NDMwNH0.s5oLOrlQDs6rpABLPPBiCAGXsuIUrb5skkCqeyvs_hk'
                },
                responseType: 'stream'

            }
        );
        console.log(res1.data);
        await res1.data.pipe(monitor).pipe(ws);
        console.log('nowexiting');
    } catch (e) {
        console.log(e);
    }

}

myMain();