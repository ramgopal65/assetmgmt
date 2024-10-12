'use strict';
/**
 * SettingMap
 */
function SettingMap() {
    var _map = new Map();

    /**
     * Set
     * @param {*} key 
     * @param {*} value 
     */
    this.set = (key, value) => {
        return _map.set(key, value);
    };

    /**
     * Get
     * @param {*} key 
     */
    this.get = (key) => {
        return _map.get(key);
    };

    /**
     * Size
     */
    this.size = () => {
        return _map.size;
    };

    /**
     * Get all entries
     */
    this.entries = () => {
        return _map.entries();
    };

    /**
     * Get all keys
     */
    this.keys = () => {
        return _map.keys();
    };

    /**
     * Get all values
     */
    this.values = () => {
        return _map.values();
    };

    /**
     * Check if a key exists
     * @param {*} key 
     */
    this.has = (key) => {
        return _map.has(key);
    };

    /**
     * Delete an entry
     * @param {*} key 
     */
    this.delete = (key) => {
        return _map.delete(key);
    };

    /**
     * Clear all entries
     */
    this.clear = () => {
        _map.clear();
    };
}

module.exports = new SettingMap();