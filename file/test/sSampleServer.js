const express = require('express');
var bodyParser = require('body-parser');

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

app.use(express.json());
const port = 3001;

app.get('/', (req, res) => {
    res.status(200).send({ code: 200, message: 'iam ok', data: { a: 1, b: 2 } });

});

app.get('/wrogn', (req, res) => {
    res.status(409).send({ code: 409, message: 'iam not ok - 409', data: { a: 1, b: 2 } });
});

app.post('/', (req, res) => {
    res.status(200).send({ code: 200, message: 'iam ok', data: { a: 1, b: 2 } });
});

app.post('/wrogn', (req, res) => {
    res.status(409).send({ code: 409, message: 'iam not ok - 409', data: { a: 1, b: 2 } });
});

app.listen(port, () => {
    console.log(`This is sample server. listening on port ${port}`);
});