const fs = require('fs');
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




let file = './txtfile.txt';
let stats = fs.statSync(file);
//console.log(stats);
let consolidatedUploadSize = 0;
let fileStream = fs.createReadStream(file, { highWaterMark: 1 * 1024 * 1024});
//console.log('filestream at source - ', fileStream);

fileStream.on('error', function (err) {
    console.log('File Error');
    //console.log('File Error', err);
});
fileStream.on('close', function () {
    console.log('close');
});
fileStream.on('end', function () {
    console.log('end');
});
fileStream.on('data', function (data) {
    consolidatedUploadSize += data.length;
    console.log('percent progress = ' + consolidatedUploadSize*100/stats.size);
});

const axios = require('axios');
let result;
try{
    const FormData = require('form-data');
    const form = new FormData();
    const request_config = {
        headers: {
            ...form.getHeaders()
        }
    };

    console.log(request_config);

    let body =         
    {
        path: 'hello/streamedtextfile.txt',
        file:{
            size:stats.size,
            mimetype:'text/plain'
        },
        allowedMaxSize: 200*1024*1024,
        allowedMimeTypes: 'text/*'
    };
    form.append('fileSize', body.file.size);
    form.append('fileMimetype', body.file.mimetype);
    form.append('path', body.path);
    form.append('allowedMaxSize', body.allowedMaxSize);
    form.append('allowedMimeTypes', body.allowedMimeTypes);
    form.append('stream', fileStream);


    console.log(request_config);
    console.log(form);
    result =  axios.put(
        'http://localhost:9004/file/streaming', 
        form, 
        request_config
    );

    return;
    /*
    result = axios.put(
        'http://localhost:9004/file/stream',
        {
            stream: fileStream,
            path: './streamedtextfile.txt',
            file:{
                size:stats.size,
                mimetype:'text/plain'
            },
            allowedMaxSize: 200*1024*1024,
            allowedMimeTypes: 'text/*'
        }
    ); */
}catch(e){
    console.log('exception');
    //console.log(e.message);
    //console.log(e.response.data);
}


