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
    let file = 'a bit less than 5 m b .txt';
    const filestream = fs.createReadStream('./' + file);
    var fileStats = fs.statSync('./' + file);
    /////////from source  end

    /////////for progress monitor  start
    let consolidatedUploadSize = 0;
    //Cannot monitor progress
    /////////for progress monitor  end

    /////////to destination  start
    var FormData = require('form-data');
    const config = {
        headers: {
            'destinationfilepath': 'test/c File Server 2 S3 _ inline /' + file,
            'filesize': fileStats.size
        }
    };
    var bodyFormData = new FormData();
    bodyFormData.append('file', filestream);

    const axios = require('axios');
    console.log(config.headers.destinationfilepath + ' - ' + ' - start');
    let result = await axios.put(
        'http://localhost:9004/file/inline',
        bodyFormData,
        config
    );
    console.log(config.headers.destinationfilepath + ' - ' + ' - end');
    console.log(result.data);
    /////////to destination  end
}

myMain();
