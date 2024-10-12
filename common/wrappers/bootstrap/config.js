require('dotenv').config();

const ENV = process.env;
let BOOTSTRAP_BASE_URL = ENV.ASSETMGMT_BOOTSTRAP_URL;
let BOOTSTRAP_PORT = ENV.ASSETMGMT_BOOTSTRAP_PORT;

module.exports = {
    BOOTSTRAP_BASE_URL: BOOTSTRAP_BASE_URL + ':' + BOOTSTRAP_PORT + '/' + 'bootstrap',
    APPLICATION_LOGIN: '/application/login',
    GET_ALL_SETTINGS: '/setting/',
    GET_ALL_SETTINGS_COUNT: '/setting/count',
    POST_SETTINGS_SEARCH: '/setting/search/',
    POST_SETTINGS_SEARCH_COUNT: '/setting/search/count',
};
