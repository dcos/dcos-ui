/**
 * This module contains the utility functions for the `JSONEditor` component,
 * separated into a different file solely for organization purposes.
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
      return { row: 0, column: 0 };
    }

    // Find row
    for (let index = 0; index <= offset; ++index) {
      if (text[index] === "\n") {
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

    return { row, column };
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
    if (
      typeof oldObj !== typeof newObj ||
      (oldObj !== null && newObj === null) ||
      (oldObj === null && newObj !== null)
    ) {
      return [{ path, value: newObj, previous: oldObj }];
    }
    if (typeof oldObj !== "object") {
      return [{ path, value: newObj, previous: oldObj }];
    }

    const oldKeys = Object.keys(oldObj);
    const newKeys = Object.keys(newObj);

    // Process removed/changed keys
    let diff = oldKeys.reduce(function(memo, key) {
      const index = newKeys.indexOf(key);
      if (index === -1) {
        memo.push({
          path: path.concat([key]),
          value: undefined,
          previous: oldObj[key]
        });

        return memo;
      }

      newKeys.splice(index, 1);

      return memo.concat(
        JSONEditorUtil.deepObjectDiff(
          oldObj[key],
          newObj[key],
          path.concat([key])
        )
      );
    }, []);

    // Process new keys
    diff = newKeys.reduce(function(memo, key) {
      memo.push({
        path: path.concat([key]),
        value: newObj[key],
        previous: undefined
      });

      return memo;
    }, diff);

    // If something changed, include the current object as changed
    if (diff.length) {
      diff.push({ path, value: newObj, previous: oldObj });
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
    const length = Math.min(oldString.length, newString.length);
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
      return newVal;
    }

    // Since `null` is also considered an object, handle it before we reach
    // the next statement where Object.keys will fail.
    if (oldVal == null || newVal == null) {
      return newVal;
    }

    if (typeof oldVal === "object" && typeof newVal === "object") {
      const oldKeys = Object.keys(oldVal);
      const newKeys = Object.keys(newVal);

      // Keep keys that exist in both objects, in the order they appear in the
      // `oldKeys` array. In the same time, strip these keys out of the
      // `newKeys` array in order to keep only the `new` keys.
      const resultKeys = oldKeys.filter(function(key) {
        if (Object.prototype.hasOwnProperty.call(newVal, key)) {
          const index = newKeys.indexOf(key);
          newKeys.splice(index, 1);

          return true;
        }

        return false;
      });

      // Stack new keys at the end of the object
      resultKeys.push(...newKeys);

      // Convert keys array to an object
      return resultKeys.reduce(function(resultObj, key) {
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
