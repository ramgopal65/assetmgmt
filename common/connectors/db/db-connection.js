const Mongoose = require('mongoose');
const Constants = require('../../constant/constant');

/**
 * setup the db connection
 */
let db;
async function setupDBConnection(dbUrl, cb) {
    // Check if database url is configured. If not, stop the process
    if (!dbUrl) {
        //console.error(Constants.COMMON.APP_DB.ERROR_DB_URL_NOT_SET);
        let e = new Error(Constants.COMMON.APP_DB.ERROR_DB_URL_NOT_SET);
        cb(e);
    }

    // Connect to database
    Mongoose.connect(
        encodeURI(dbUrl),
        {
            useNewUrlParser: true
        }
    );
    db = Mongoose.connection;
    db.on('error', (err) => {
        //console.error(Constants.COMMON.APP_DB.DB_CONNECTION_ERROR);
        let e = new Error(Constants.COMMON.APP_DB.DB_CONNECTION_ERROR + ' - ' + err);
        cb(e, null);
    });
    db.once('open', async () => {
        //console.log(Constants.COMMON.APP_DB.DB_CONNECTION_SUCCESS);
        cb(null, db);
    });
}
async function closeDBConnection(cb) {
    db.close();
    if (cb) {
        cb(null, Constants.COMMON.APP_DB.DB_CONNECTION_CLOSED);
    }
}

module.exports = {
    setupDBConnection: setupDBConnection,
    closeDBConnection: closeDBConnection,
};
