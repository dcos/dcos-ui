/**
 * A mixin to create getter and setter functions for store data
 */

var PluginSDK;

// Hack until we fix circular dependency - DCOS-5040
if (global.__DEV__) {
  PluginSDK = require('PluginSDK');
}

import {APP_STORE_CHANGE} from '../constants/EventTypes';

var GetSetMixin = {

  get: function (key) {
    if (typeof this.getSet_data === 'undefined') {
      return null;
    }

    return this.getSet_data[key];
  },

  set: function (data) {
    // Throw error if data is an array or is not an object
    if (!(typeof data === 'object' && !Array.isArray(data))) {
      throw new Error('Can only update getSet_data with data of type Object.');
    }

    // Allows overriding `getSet_data` wherever this is implemented
    if (typeof this.getSet_data === 'undefined') {
      this.getSet_data = {};
    }

    Object.assign(this.getSet_data, data);

    if (!global.__DEV__) {
      PluginSDK = require('PluginSDK');
    }
    // Dispatch new Store data
    PluginSDK.dispatch({
      type: APP_STORE_CHANGE,
      storeID: this.storeID,
      data: this.getSet_data
    });
  }

};

module.exports = GetSetMixin;
