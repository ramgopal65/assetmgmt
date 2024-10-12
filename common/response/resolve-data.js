const CommonConstants = require('../../common/constant/constant');
//TODO: change from class to function
module.exports = class ResolveData {
    constructor(code, message, data) {
        this.setCode(code);
        this.setMessage(message);
        this.setData(data);
    }
    setCode(code) {
        this.code = code || CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE;
    }
    setMessage(message) {
        if ((typeof message === 'object') && (message.constructor === Object)) {
            this.message = message.MESSAGE;
        } else {
            this.message = message;
        }
    }
    setData(data) {
        this.data = data || null;
    }
    appendMessage(message) {
        if ((typeof message === 'object') && (message.constructor === Object)) {
            this.message += '. ' + message.MESSAGE;
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
        if (this.data) {
            ret.data = this.data;
        }

        return ret;
    }
};