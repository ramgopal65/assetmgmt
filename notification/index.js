//Imports
const routes = require('./routes/routes');

// Express app setup
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found - ' + req.url);
    err.status = 404;
    next(err);
});

module.exports = app;