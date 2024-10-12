const fs = require('fs');
const { PassThrough } = require('stream');
const axios = require('axios');
const ws = fs.createWriteStream('./tmpfile');

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
            'http://localhost:9002/assetmgmt/user/profile-pic',
            {
                headers: {
                    Authorization: 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib3Jxc2lvIiwianRpIjoiNjY0MmI3ZmVhMGY0MTU1OTQ5ZjU0ZTMzIiwiYXVkIjoiY29hY2giLCJzdWIiOiJzc28gdG9rZW4gZm9yIGNvYWNoIiwiaWF0IjoxNzE1NjQ4NTI4MDIyLCJleHAiOjE3MTgyNDA1MjgwMjJ9.W4KauYK99_XklOPSXp8V-lV4Bhdwy6RuTXSsrp7AeE0'
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