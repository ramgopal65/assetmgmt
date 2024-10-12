const Util = require('util');
const Fetch = require('node-fetch');

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

async function doGet() {
    try {
        let result = await Fetch(
            'http://localhost:3001/',
            {
                method: 'GET'
            }
        );
        console.dir(result);
        console.dir(result.Response);
        console.dir(result.body);
        console.dir(result.data);

    //    result = await Fetch('http://localhost:3001/wrogn',
    //        {
    //            method: 'GET'
    //        }
    //    );
    //    console.log(result.data);
    } catch (error) {
        console.log('error');
        console.log(error);
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