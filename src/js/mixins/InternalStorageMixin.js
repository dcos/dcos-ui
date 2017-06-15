/**
 * A mixin to store component data that isn't part of properties or
 * part of state.
 */

var InternalStorageMixin = {
  internalStorage_data: {},

  internalStorage_get() {
    return this.internalStorage_data;
  },

  internalStorage_update(diff) {
    if (typeof this.internalStorage_data !== "object") {
      throw new Error(
        "Can only update internalStorage_data if that is of type Object or Array."
      );
    }

    this.internalStorage_data = Object.assign(this.internalStorage_get(), diff);
  },

  internalStorage_set(data) {
    this.internalStorage_data = data;
  }
};

module.exports = InternalStorageMixin;
