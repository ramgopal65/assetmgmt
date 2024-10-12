const axios = require('axios');
const Util = require('util');
const Stream = require('stream');

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
const Finished = Util.promisify(Stream.finished);

axios.interceptors.response.use(
    async (response) => {
        console.log('##### AXIOS RESPONSE #####');
        //if (response.headers.hasContentType('application/json') &&
        //    response.data instanceof Stream.Readable) {
        //    let data = '';

        //    await Finished(
        //        response.data.on('data', (chunk) => {
        //            data += chunk.toString();
        //        })
        //    );
        //    response.data = data;
        //    response.config.responseType = 'json';
        //}

        console.log(response.status);
        return response;
    },
    async (err) => {
        console.log('##### AXIOS ERROR #####');
        if (err.response.headers.hasContentType('application/json') &&
            err.response.data instanceof Stream.Readable) {
            console.log('YES');
            let data = '';

            await Finished(
                err.response.data.on('data', (chunk) => {
                    data += chunk.toString();
                })
            );
            err.response.data = data;
            err.response.config.responseType = 'json';
        }
        throw err;
    }
);



async function doGet() {
    try {
        //await axios.get(
        //    'http://localhost:3001/',
        //    {
        //        responseType: 'stream'
        //    }
        //);
        //console.log('result.status - ' + result.status);
        //console.log('result.statusText - ' + result.statusText);
        //console.log('result.data - ');
        //console.dir(result.data);

        let error = await axios.get(
            'http://localhost:3001/wrogn',
            {
                responseType: 'stream'
            }
        );
        console.log('111111');
        console.log('error.code - ' + error.code);
        console.log('error.response.status - ' + error.response.status);
        console.log('error.response.statusText - ' + error.response.statusText);
        console.log('error.response.data - ');
        console.dir(error.response.data);

    } catch (error) {
        console.log('error.code - ' + error.code);
        console.log('error.response.status - ' + error.response.status);
        console.log('error.response.statusText - ' + error.response.statusText);
        console.log('error.response.data - ');
        console.dir(error.response.data);
    }
}

async function doPost() {
    try {
        let result = await axios.post(
            'http://localhost:3001/'
        );
        console.log('result.status - ' + result.status);
        console.log('result.statusText - ' + result.statusText);
        console.log('result.data - ');
        console.dir(result.data);

        result = await axios.post(
            'http://localhost:3001/wrogn',
        );
    } catch (error) {
        console.log('error.code - ' + error.code);
        console.log('error.response.status - ' + error.response.status);
        console.log('error.response.statusText - ' + error.response.statusText);
        console.log('error.response.data - ');
        console.dir(error.response.data);
    }
}

doGet();