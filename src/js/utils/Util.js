let uniqueIDMap = {};

const Util = {

  /**
   * Give a unique ID for this session.
   * @param {string} id              Namespace for the unique ids.
   * @return {Integer}               A unique id.
   */
  uniqueID: function (id) {
    if (!uniqueIDMap.hasOwnProperty(id)) {
      uniqueIDMap[id] = 0;
    }

    return uniqueIDMap[id]++;
  },

  /**
   * Copies an object, omitting blacklisted keys.
   * @param  {Object} object        Object to copy
   * @param  {Array} blacklistKeys  Keys to not copy over
   * @return {Object}               Copy of object without blacklisted keys
   */
  omit: function (object, blacklistKeys) {
    return Object.keys(object).reduce(function (newObject, key) {
      if (blacklistKeys.indexOf(key) === -1) {
        newObject[key] = object[key];
      }

      return newObject;
    }, {});
  },

  /**
   * Returns the last element
   * @param  {Array} array        Array to act on
   * @return {Anything}           Value in last position of Array
   */
  last: function (array) {
    if (array.length === 0) {
      return null;
    }

    return array[array.length - 1];
  },

  /**
   * Finds last index where condition returns true
   * @param  {Array} array         Array to search
   * @param  {Function} condition  Condition to find
   * @return {Int}                 Index of last item or -1 if not found
   */
  findLastIndex: function (array, condition) {
    let length = array.length;
    let index = length - 1;
    for (; index >= 0; index--) {
      if (condition(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  },

  getLocaleCompareSortFn: function (prop) {
    return function (a, b) {
      return a[prop].localeCompare(b[prop]);
    };
  },

  /**
   * Finds the property in a given object using a string of propeties
   * using dot-notation, e.g. 'hello.is.it.me.you.are.looking.for'
   * @param  {Object} obj          Object to search in
   * @param  {String} propertyPath Property path to search for
   * @return {*}                   The value of the found property or null
   */
  findNestedPropertyInObject: function (obj, propertyPath) {
    if (propertyPath == null || obj == null) {
      return null;
    }

    return propertyPath.split('.').reduce(function (current, nextProp) {
      if (current == null) {
        return current;
      }

      return current[nextProp];
    }, obj);
  },

  /**
   * @param {Function} func A callback function to be called
   * @param {Number} wait How long to wait
   * @returns {Function} A function, that, after triggered the first time, will
   * wait for a period of time before the next trigger. If triggered during the
   * wait, the function will be invoked immediately after the wait is over.
   * This function is specifically made for React events, hence the nativeEvent
   * lookup.
   */
  throttleScroll: function (func, wait) {
    let canCall = true;
    let callWhenReady = false;

    let resetCall = function () {
      if (callWhenReady) {
        setTimeout(resetCall.bind(this, arguments[0]), wait);
        callWhenReady = false;
        func.apply(this, arguments);
      } else {
        canCall = true;
      }
    };

    return function () {
      if (canCall) {
        setTimeout(resetCall.bind(this, arguments[0].nativeEvent), wait);
        canCall = false;
        callWhenReady = false;
        func.apply(this, arguments);
      } else {
        callWhenReady = true;
      }
    };
  },

  /**
   * Will wait until a certain amount of time has elapsed
   * before calling the given function.
   *
   * @param  {Function} func A callback function to be called
   * @param  {Number} wait How long to wait before callback is called
   * @return {Function} A function
   */
  debounce: function (func, wait) {
    let timeoutID = null;

    return function (...args) {
      if (timeoutID) {
        global.clearTimeout(timeoutID);
      }

      timeoutID = global.setTimeout(function () {
        func.apply(null, args);
      }, wait);
    };
  },

  /**
   * Check if item is an object.
   *
   * @param  {Object} obj Item to check if is an object.
   * @return {Boolean} Whether the argument is an object.
   */
  isObject: function (obj) {
    return obj && obj.toString && obj.toString() === '[object Object]';
  },

  /**
   * Deep copy an object.
   *
   * @param  {Object} obj Object to deep copy.
   * @return {Object} Copy of obj.
   */
  deepCopy: function (obj) {
    let copy;
    if (Array.isArray(obj)) {
      copy = obj.slice(); // shallow copy
    } else if (this.isObject(obj)) {
      copy = Object.assign({}, obj);
    }

    if (copy != null) {
      Object.keys(copy).forEach((key) => {
        copy[key] = this.deepCopy(copy[key]);
      });
    } else {
      copy = obj;
    }

    return copy;
  }
};

module.exports = Util;
