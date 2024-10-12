const CommonConstants = require('../../../common/constant/constant');

module.exports = class BootstrapWrapperError extends Error {
    constructor(message, code, data) {
        super(message);
        this.code = code || CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE;
        this.name = this.constructor.name;
        Error.captureStackTrace(this.stack, this.constructor);
        this.data = data || null;
    }
};