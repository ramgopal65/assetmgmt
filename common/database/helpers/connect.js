// Imports
const mongoose = require('mongoose');
const BootstrapConfig = require('../../../bootstrap/config/config');

module.exports = {
    connect: connect
}

/**
 * Connect to a database
 * @param {*} connectionParams 
 * @param {*} options 
 */
async function connect(connectionParams, options) {
    try {
        // Initialize
        let db, connectPromise;

        // If no DB URL is passed, read from environment variable
        if (!connectionParams.url) {
            // Check if database url is configured. If not, stop the process
            if (!BootstrapConfig.DB.URL) {
                console.error("Unable to read database URL from system environment variable BORQS_BOOTSTRAP_DB_URL. Please configure it to proceed.");
                process.exit();
            } else {
                connectionParams.url = BootstrapConfig.DB.URL;
            }
        }

        // Prepare connection
        mongoose.connect(
            encodeURI(connectionParams.url),
            {
                useNewUrlParser: true // For - DeprecationWarning: current URL string parser is deprecated, and will be removed in a future version. To use the new parser, pass option { useNewUrlParser: true } to MongoClient.connect.
            }
        );

        // Connect
        connectPromise = new Promise((resolve, reject) => {
            db = mongoose.connection;

            // Wait till connection is successful
            db.once('open', () => {
                console.log("Database connection successful.");
                resolve();
            })

            // Handle connection failure
            db.on('error', (error) => {
                console.error('Database connection error :' + error)
                reject();
            });
        });
        await connectPromise;

        return Promise.resolve({ code: 200, message: "Database connection successful.", data: db });
    } catch (error) {
        if (error && error.code && error.message) {
            return Promise.reject({ code: error.code, message: error.message, data: error.data });
        } else {
            return Promise.reject({ code: 409, message: "Error while establishing connection to database: " + error });
        }
    }
}