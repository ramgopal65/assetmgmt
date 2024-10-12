'use strict';
const Http = require('http');
const Util = require('util');
const Config = require('../config/config');

const Constants = require('../constant/constant');
const To = require('../../common/to/to');
let Index;
const CommonValidator = require('../../common/validate/validator');
//const AllRoutes = require('express-list-endpoints');

const BootstrapSettingsWrapper = require('../../common/wrappers/bootstrap/setting');
require('dotenv').config();

//TODO: Logging implementation
/**
 * For logging the timestamp in good format
 */
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

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}

/**
 * Create the HTTP server
*/
async function createServer() {
    try {
        Index = require('../index');
        Index.set('port', port);

        //Create HTTP server.
        console.log(Constants.NOTIFICATION.GENERIC.STARTING_SERVER);
        server = await Http.createServer(Index);

        //Listen on provided port, on all network interfaces.
        server.listen(port);
        server.on('error', onError);
        server.on('listening', onListening);
    } catch (e) {
        console.error(e);
        console.error(Constants.NOTIFICATION.GENERIC.EXITING);
        process.exit();
    }
}

/**
 * Event listener for HTTP server
*/
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
    case 'EACCES':
        console.error(bind + Constants.NOTIFICATION.GENERIC.PORT_REQUIRES_ELEVATED_PRIVILEDGES);
        close();
        process.exit(1);
        break;
    case 'EADDRINUSE':
        console.error(bind + Constants.NOTIFICATION.GENERIC.PORT_ALREADY_IN_USE);
        close();
        process.exit(1);
        break;
    default:
        close();
        throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log(Constants.NOTIFICATION.GENERIC.SERVER_LISSTENING_ON_PORT + bind);
    //console.log(AllRoutes(Index));
}

async function startIfNotRunning() {
    await portfinder.getPort({
        port: port,    // minimum port
        stopPort: port // maximum port
    }, async function (err, p) {
        if (err) {
            console.log(Constants.NOTIFICATION.GENERIC.SERVER_ALREADY_RUNNING_ON_PORT + port);
        }
        if (p) {
            await createServer();
        }
    });
}
/**
 * close HTTP server
*/
function close() {
    server.close();
}

let port = normalizePort(Config.NOTIFICATION.DEFAULT_PORT || 9005);
let server;
var portfinder = require('portfinder');

new Promise(async (resolve, reject) => {
    try {
        // Initialize
        let error, settingResult;
        // Get settings
        [error, settingResult] = await To(BootstrapSettingsWrapper.loginApplicationAndFetchRelevantSettings(Config.NOTIFICATION.APPLICATION.CODE));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(settingResult)) {
            //console.log([...SettingsMap.entries()]);
            startIfNotRunning()
                .then(r => {
                })
                .catch(e => {
                });

        } else {
            console.error(error);
            console.error(Constants.NOTIFICATION.GENERIC.EXITING);
            process.exit();
        }
    } catch (e) {
        console.error(e);
        console.error(Constants.NOTIFICATION.GENERIC.EXITING);
        process.exit();
    }
});

