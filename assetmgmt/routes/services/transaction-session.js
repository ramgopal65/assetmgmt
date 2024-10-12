module.exports = {
    startTransactionSession: startTransactionSession,
    commitTransaction: commitTransaction,
    abortTransaction: abortTransaction,
};

const Mongoose = require('mongoose');
const Config = require('../../config/config');

/**
 * start trascaction session
 */
async function startTransactionSession() {
    let session = await Config.DB.DB.startSession();
    await session.startTransaction();
    return session;
}

/**
 * commit trascaction
 */
async function commitTransaction(transactionSession) {
    await transactionSession.commitTransaction();
    await transactionSession.endSession();
}

/**
 * abort trascaction
 */
async function abortTransaction(transactionSession) {
    await transactionSession.abortTransaction();
    await transactionSession.endSession();
}

