const Mongoose = require('mongoose');
const Constants = require('../../constant/constant');
const Config = require('../../config/config');

/**
 * setup the db connection
 */
let db;
async function setupDBConnection(cb) {
    // Check if database url is configured. If not, stop the process
    if (!Config.DB.URL) {
        let e = new Error(Constants.BOOTSTRAP.GENERIC.ERROR_ENV_DB_URL_NOT_SET);
        cb(e);
    }

    // Connect to database
    Mongoose.connect(
        encodeURI(Config.DB.URL),
        {
            useNewUrlParser: true
        }
    );
    db = Mongoose.connection;
    db.on('error', (err) => {
        let e = new Error(Constants.BOOTSTRAP.GENERIC.DB_CONNECTION_ERROR + ' - ' + err);
        cb(e, null);
    });
    db.once('open', async () => {
        cb(null, Constants.BOOTSTRAP.GENERIC.DB_CONNECTION_SUCCESS);
    });
}
async function closeDBConnection(cb) {
    db.close();
    if (cb) {
        cb(null, Constants.BOOTSTRAP.GENERIC.DB_CONNECTION_CLOSED);
    }
}

module.exports = {
    setupDBConnection: setupDBConnection,
    closeDBConnection: closeDBConnection,
};
