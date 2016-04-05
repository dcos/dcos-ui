const Util = {

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
    return array[array.length - 1] || null;
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

  /**
   * @param  {Object} arg to determine whether is an array or not
   * @return {Boolean} returns whether given arg is an array or not
   */
  isArray: function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
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
   * @param {Array}    array - An array to search in.
   * @param {Function} func  - Function testing each array element.
   * @return {anything}      - Returns first array element that passes
   *                           func truth test. Otherwise returns undefined.
   */
  find: function (array, func) {
    let length = array.length;

    for (let i = 0; i < length; i++) {
      if (func(array[i]) === true) {
        return array[i];
      }
    }

    return undefined;
  }
};

module.exports = Util;
