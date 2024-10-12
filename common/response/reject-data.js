const CommonConstants = require('../../common/constant/constant');
module.exports = class RejectData {
    constructor(code, message, type, details, data) {
        this.setCode(code);
        this.setMessage(message);
        this.setType(type);
        this.setDetails(details);
        this.setData(data);
    }
    setCode(code) {
        this.code = code || CommonConstants.COMMON.APP_HTTP.STATUS.UNKNOWN.CODE;
    }
    setMessage(message) {
        if ((typeof message === 'object') && (message.constructor === Object)) {
            this.message = message.MESSAGE;
            this.subCode = message.SUBCODE;
        } else {
            this.message = message;
            this.subCode = null;
        }
    }
    setSubCode(subCode) {
        this.subCode = subCode;
    }
    setType(type) {
        this.type = type || CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN;
    }
    setData(data) {
        this.data = data || null;
    }
    setDetails(details) {
        if (details) {
            this.details = {
                code: details.code,
                message: details.message,
                name: details.name,
                stack: details.stack
            };
        } else {
            this.details = null;
        }
    }
    setStack(error) {
        //TODO: control stack size
        //TODO: Only my functions in the stack
        this.details.stack = error.stack;
    }
    appendMessage(message) {
        if ((typeof message === 'object') && (message.constructor === Object)) {
            this.message += '. ' + message.MESSAGE;
            this.subCode = message.SUBCODE;
        } else {
            this.message += '. ' + message;
        }
    }
    jsonObject() {
        let ret = {};
        if (this.code) {
            ret.code = this.code;
        }
        if (this.message) {
            ret.message = this.message;
        }
        if (this.subCode) {
            ret.subCode = this.subCode;
        }
        if (this.type) {
            ret.type = this.type;
        }
        if (this.details) {
            ret.details = this.details;
        }
        if (this.data) {
            ret.data = this.data;
        }

        return ret;
    }
};