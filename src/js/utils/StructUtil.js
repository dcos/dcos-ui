import List from "../structs/List";
import Item from "../structs/Item";

const StructUtil = {
  /**
   * Recursively peels open Structs to get raw data and returns a clone
   *
   * @param  {Object} obj Item to be cloned where structs will be striped.
   *                      One of Object, Array, Date, String, Number, or Boolean.
   * @return {Object}     Cloned Object without Structs
   */
  copyRawObject: function copyRawObject(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (obj == null || typeof obj !== "object") {
      return obj;
    }
    // Extract underlying array object
    if (obj instanceof List) {
      return copyRawObject(obj.getItems());
    }
    // Extract underlying storage Object
    if (obj instanceof Item) {
      return copyRawObject(obj._itemData);
    }
    // Handle Date
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());

      return copy;
    }
    // Handle Array
    if (obj instanceof Array) {
      return obj.map(copyRawObject);
    }
    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, attr)) {
          copy[attr] = copyRawObject(obj[attr]);
        }
      }

      return copy;
    }
  }
};

module.exports = StructUtil;
