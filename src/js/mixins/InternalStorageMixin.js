/**
 * A mixin to store component data that isn't part of properties or
 * part of state.
 */

var _ = require('underscore');

var InternalStorageMixin = {

  internalStorage_data: {},

  internalStorage_get: function () {
    return this.internalStorage_data;
  },

  internalStorage_update: function (diff) {
    if (!_.isObject(this.internalStorage_data)) {
      throw new Error('Can only update internalStorage_data if that is of type Object or Array.');
    }

    this.internalStorage_data = _.extend(this.internalStorage_get(), diff);
  },

  internalStorage_set: function (data) {
    this.internalStorage_data = data;
  }

};

module.exports = InternalStorageMixin;
