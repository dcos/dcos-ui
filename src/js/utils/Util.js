import ValidatorUtil from "./ValidatorUtil";

const uniqueIDMap = {};

const Util = {
  /**
   * Give a unique ID for this session.
   * @param {string} id              Namespace for the unique ids.
   * @return {Integer}               A unique id.
   */
  uniqueID(id) {
    if (!Object.prototype.hasOwnProperty.call(uniqueIDMap, id)) {
      uniqueIDMap[id] = 0;
    }

    return uniqueIDMap[id]++;
  },

  /**
   * Returns a composed aggregate object given an array and a key to use as the composed
   * object id. If the values of key are not unique, the last object is used.
   * @param {Array} array            The collection of objects to iterate over
   * @param {string} key             The key used to retreive a value that will become the key of the aggregate object
   * @return {Object}                The aggregate object
   */
  keyBy(array, key) {
    return array.reduce((acc, current) => {
      acc[current[key]] = current;

      return acc;
    }, {});
  },

  /**
   * Copies specific keys of an object
   * @param  {Object} object        Object to copy
   * @param  {Array} allowKeys      Keys to copy
   * @return {Object}               Copy of object with allowed keys
   */
  pluck(object, allowKeys) {
    const allow = new Set(allowKeys);

    return Object.keys(object).reduce((newObject, key) => {
      if (allow.has(key)) {
        newObject[key] = object[key];
      }

      return newObject;
    }, {});
  },

  /**
   * Copies an object, omitting specific keys.
   * @param  {Object} object        Object to copy
   * @param  {Array} denyKeys       Keys to not copy over
   * @return {Object}               Copy of object without disallowed keys
   */
  omit(object, denyKeys) {
    const deny = new Set(denyKeys);

    return Object.keys(object).reduce((newObject, key) => {
      if (!deny.has(key)) {
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
  last(array) {
    if (!Array.isArray(array) || array.length === 0) {
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
  findLastIndex(array, condition) {
    const length = array.length;
    let index = length - 1;
    for (; index >= 0; index--) {
      if (condition(array[index], index, array)) {
        return index;
      }
    }

    return -1;
  },

  getLocaleCompareSortFn(prop) {
    return (a, b) => {
      return a[prop].localeCompare(b[prop]);
    };
  },

  /**
   * Finds the property in a given object using a string of properties
   * using dot-notation, e.g. 'hello.is.it.me.you.are.looking.for'
   * @param  {Object} obj          Object to search in
   * @param  {String} propertyPath Property path to search for
   * @return {*}                   The value of the found property or null
   */
  findNestedPropertyInObject(obj, propertyPath) {
    if (propertyPath == null || obj == null) {
      return null;
    }

    return propertyPath.split(".").reduce((current, nextProp) => {
      if (current == null) {
        return current;
      }

      return current[nextProp];
    }, obj);
  },

  /**
   * Will wait until a certain amount of time has elapsed
   * before calling the given function.
   *
   * @param  {Function} func A callback function to be called
   * @param  {Number} wait How long to wait before callback is called
   * @return {Function} A function
   */
  debounce(func, wait) {
    let timeoutID = null;

    return (...args) => {
      if (timeoutID) {
        global.clearTimeout(timeoutID);
      }

      timeoutID = global.setTimeout(() => {
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
  isObject(obj) {
    return obj && obj.toString && obj.toString() === "[object Object]";
  },

  /**
   * Deep copy an object.
   *
   * @param  {Object} obj Object to deep copy.
   * @return {Object} Copy of obj.
   */
  deepCopy(obj) {
    let copy;
    if (Array.isArray(obj)) {
      copy = obj.slice(); // shallow copy
    } else if (Util.isObject(obj)) {
      copy = Object.assign({}, obj);
    }

    if (copy != null) {
      Object.keys(copy).forEach(key => {
        copy[key] = Util.deepCopy(copy[key]);
      });
    } else {
      copy = obj;
    }

    return copy;
  },

  /**
   * Removes keys with empty values from an Object
   *
   * @param {Object} obj Object to filter
   * @return {Object} Copy of a filtered obj
   */
  filterEmptyValues(obj) {
    return Object.keys(obj)
      .filter(key => {
        return !ValidatorUtil.isEmpty(obj[key]);
      })
      .reduce((memo, key) => {
        memo[key] = obj[key];

        return memo;
      }, {});
  },

  objectToGetParams(obj) {
    const queryString = Object.keys(obj)
      .filter(param => {
        return obj[param] != null;
      })
      .map(param => {
        return `${encodeURIComponent(param)}=${encodeURIComponent(obj[param])}`;
      })
      .join("&");

    return queryString ? `?${queryString}` : "";
  },

  /**
   * Transform param to lower case
   * if param is string otherwise
   * return unchanged param
   *
   * @param {String} item
   * @returns {String} item param lowercased
   */
  toLowerCaseIfString(item) {
    if (typeof item === "string") {
      return item.toLowerCase();
    }

    return item;
  },

  /**
   * Transform param to upper case
   * if param is string otherwise
   * return unchanged param
   *
   * @param {String} item
   * @returns {String} item param lowercased
   */
  toUpperCaseIfString(item) {
    if (typeof item === "string") {
      return item.toUpperCase();
    }

    return item;
  },

  isString(str) {
    return typeof str === "string";
  },

  /**
   * Parse url string
   * and returns its object representation
   *
   * @param {String} url
   * @returns {Object} url representation
   */
  parseUrl(url) {
    if (!Util.isString(url)) {
      return null;
    }

    // Add http/s otherwise browser/engine think it's relative path
    if (!/http|https/.test(url)) {
      url = `https://${url}`;
    }

    // TODO: replace below with browser native API <new URL()>
    // when all browsers support are available
    const aElement = document.createElement("a");
    aElement.href = url;

    return {
      hash: aElement.hash,
      host: aElement.host,
      hostname: aElement.hostname,
      href: aElement.href,
      origin: aElement.origin,
      password: aElement.password,
      pathname: aElement.pathname,
      port: aElement.port,
      protocol: aElement.protocol,
      search: aElement.search,
      username: aElement.username
    };
  }
};

module.exports = Util;
