import deepEqual from 'deep-equal';

/**
 * Check if all keys of `objectA` exist on `objectB` or vice-versa
 *
 * @param {Object} objectA - The first object to compare
 * @param {Object} objectB - The second object to compare
 * @returns {Boolean} Returns `true` if all keys of A are in B or vice versa
 */
function doKeysOverlap(objectA, objectB) {
  let keysA = Object.keys(objectA);
  let keysB = Object.keys(objectB);
  return keysA.every(function (value) {
    return keysB.indexOf(value) !== -1;
  }) || keysB.every(function (value) {
    return keysA.indexOf(value) !== -1;
  });
}

/**
 * This module contains the utility functions for the `JSONEditor` component,
 * separated into a different file solely for organisation purposes.
 */
var JSONEditorUtil = {

  /**
   * This function walks the `text` argument and locates the line and
   * column the given string offset.
   *
   * Note: Both row/column values are 0-based
   *
   * @param {number} offset - The string offset
   * @param {string} text - The source string
   * @returns {{line, column}} Returns the line/column for the given offset
   */
  cursorFromOffset(offset, text) {
    let column = 0;
    let lastRowOffset = 0;
    let row = 0;

    // Handle negative offsets
    if (offset < 0) {
      return {row:0, column:0};
    }

    // Find row
    for (let index = 0; index <= offset; ++index) {
      if (text[index] === '\n') {
        row++;
        lastRowOffset = index + 1;
      }
    }

    // Find column
    column = offset - lastRowOffset;

    // Wrap to maximum length
    if (lastRowOffset + column > text.length) {
      column = text.length - lastRowOffset;
    }

    return {row, column};
  },

  /**
   * Deep compare two objects and return an array of differences as an object
   * with `path`, `value` and `previous` property.
   *
   * @param {any} oldObj - The old object to compare
   * @param {any} newObj - The new object to compare
   * @param {Array} [path] - The current object path
   * @returns {[{path, previous, value}]} Returns an array with the differences
   */
  deepObjectDiff(oldObj, newObj, path = []) {
    if (oldObj === newObj) {
      return [];
    }
    if ((typeof oldObj !== typeof newObj) ||
       ((oldObj !== null) && (newObj === null)) ||
       ((oldObj === null) && (newObj !== null))) {
      return [{path, value: newObj, previous: oldObj}];
    }
    if (typeof oldObj !== 'object') {
      return [{path, value: newObj, previous: oldObj}];
    }

    let oldKeys = Object.keys(oldObj);
    let newKeys = Object.keys(newObj);

    // Process removed/changed keys
    let diff = oldKeys.reduce(function (memo, key) {
      let index = newKeys.indexOf(key);
      if (index === -1) {
        memo.push(
          {path: path.concat([key]), value: undefined, previous: oldObj[key]}
        );

        return memo;
      }

      newKeys.splice(index, 1);

      return memo.concat(
        JSONEditorUtil.deepObjectDiff(
          oldObj[key], newObj[key], path.concat([key])
        )
      );
    }, []);

    // Process new keys
    diff = newKeys.reduce(function (memo, key) {
      memo.push(
        {path: path.concat([key]), value: newObj[key], previous: undefined}
      );

      return memo;
    }, diff);

    // If something changed, include the current object as changed
    if (diff.length) {
      diff.push({path, value: newObj, previous: oldObj});
    }

    return diff;
  },

  /**
   * Find the location of a change between two strings
   *
   * @param {string} oldString - The old string
   * @param {string} newString - The new string
   * @returns {number} Returns the offset in the string with the first difference
   */
  diffLocation(oldString, newString) {
    let length = Math.min(oldString.length, newString.length);
    for (let index = 0; index < length; ++index) {
      if (oldString[index] !== newString[index]) {
        return index;
      }
    }

    return -1;
  },

  /**
   * Arrange object keys (or array elements) of the given new value in order to
   * match the ones in the old value.
   *
   * @param {any} oldVal - The previous value to match against
   * @param {any} newVal - The new value to adapt
   * @returns {any} Returns the newVal with it's element properly arranged
   */
  sortObjectKeys(oldVal, newVal) {
    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      let oldValues = oldVal.slice();
      let newValues = newVal.slice();

      // Keep values that exist in both arrays, in the order they appear in the
      // `oldValues` array. In the same time, strip these values out of the
      // `newValues` array in order to keep only the `new` values.
      let resultVal = oldValues.reduce(function (memo, oldItem) {

        // Check if we have the same or compatible item in the `newValues` array
        // A "compatible" item is an object that has
        let index = newValues.findIndex(function (newItem) {
          if (oldItem === newItem) {
            return true;
          }

          if ((typeof oldItem === 'object') && (typeof newItem === 'object') &&
              doKeysOverlap(oldItem, newItem)) {
            return true;
          }

          return deepEqual(oldItem, newItem);
        });

        // If we don't have that item, don't include it in the list
        if (index === -1) {
          return memo;
        }

        // Push (and recursively sort if appliable) the value
        memo.push(JSONEditorUtil.sortObjectKeys(oldItem, newValues[index]));
        newValues.splice(index, 1);

        return memo;
      }, []);

      // Append new values in the order they appear at the end of the array
      return resultVal.concat(newValues);
    }

    // Since `null` is also considered an object, handle it before we reach
    // the next statement where Object.keys will fail.
    if ((oldVal == null) || (newVal == null)) {
      return newVal;
    }

    if ((typeof oldVal === 'object') && (typeof newVal === 'object')) {
      let oldKeys = Object.keys(oldVal);
      let newKeys = Object.keys(newVal);

      // Keep keys that exist in both objects, in the order they appear in the
      // `oldKeys` array. In the same time, strip these keys out of the
      // `newKeys` array in order to keep only the `new` keys.
      let resultKeys = oldKeys.filter(function (key) {
        if (Object.prototype.hasOwnProperty.call(newVal, key)) {
          let index = newKeys.indexOf(key);
          newKeys.splice(index, 1);

          return true;
        }

        return false;
      });

      // Stack new keys at the end of the object
      resultKeys.push(...newKeys);

      // Convert keys array to an object
      return resultKeys.reduce(function (resultObj, key) {
        resultObj[key] = JSONEditorUtil.sortObjectKeys(
          oldVal[key],
          newVal[key]
        );

        return resultObj;
      }, {});
    }

    return newVal;
  }

};

module.exports = JSONEditorUtil;
