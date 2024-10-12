const express = require('express');
var bodyParser = require('body-parser');
const { PassThrough } = require('stream');

const axios = require('axios');
const app = express();
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

// create application/json parser
app.use(express.raw());
//app.use(bodyParser.json({ limit: '5mb' }));
const port = 3001;

//app.get('/', (req, res) => {
//    res.send('This is intermediate server like assetmgmt server');
//});

app.put('/', (req, res, next) => {
    console.log(req.headers);
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
        console.log('stream progress = ' + consolidatedUploadSize * 100 / req.headers.streamsize + '; ' + chunk.slice(0, 20));
    });
    monitor.on('end', () => {
        console.log('stream upoload complete');
        res.end();
    });

    const config = {
        headers: {
            destinationfilepath: req.headers.destinationfilepath,
            streamsize: req.headers.streamsize
        }
    };

    axios.put(
        'http://localhost:9004/file/',
        req.pipe(monitor),
        config
    );

});

app.get('/', (req, res, next) => {
    doGet(req, res, next);

});

async function doGet(req, res, next) {
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
        console.log('stream progress = ' + consolidatedUploadSize * 100 / req.headers.streamsize);
    });
    monitor.on('end', () => {
        console.log('stream download complete');
    });
    const config = {
        headers: {
            destinationfilename: '300mb.txt'
        }
    };

    let destinationfilepath = 'test/my/preferred/path/300mb.txt';



    let res1 = await axios.get(
        'http://localhost:9004/file' + '?' + destinationfilepath,
        { responseType: 'stream' }
    );
    console.log(res1.headers.streamsize);
    res1.data.pipe(monitor).pipe(res);



//    axios
//        .get(
//            'http://localhost:9004/file?' + destinationfilepath,
//            config,
//            { responseType: 'stream' }
//        )
//        .then(response => {
//            response.data.pipe(monitor);
//            //console.log(response.data);
//        });
}



app.listen(port, () => {
    console.log(`This is intermediate server like assetmgmt server. listening on port ${port}`);
    console.dir(process.memoryUsage());
});