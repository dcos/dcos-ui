var ValidatorUtil = {
  isDefined(value) {
    return (value != null && value !== '') || typeof value === 'number';
  },

  /**
   * Check if the given string is an e-mail
   *
   * @param {string} email - The e-mail string to test
   * @returns {boolean} - Returns true if the string is an e-mail
   */
  isEmail: function (email) {
    return email != null &&
      email.length > 0 &&
      !/\s/.test(email) &&
      /.+@.+\..+/
      .test(email);
  },

  isEmpty(data) {
    if (typeof data === 'number' || typeof data === 'boolean') {
      return false;
    }

    if (typeof data === 'undefined' || data === null) {
      return true;
    }

    if (typeof data.length !== 'undefined') {
      return data.length === 0;
    }

    return Object.keys(data).reduce(function (memo, key) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        memo++;
      }

      return memo;
    }, 0) === 0;
  },

  isInteger(value) {
    return ValidatorUtil.isNumber(value) &&
      Number.isInteger(parseFloat(value));
  },

  isNumber(value) {
    const number = parseFloat(value);

    return /^[0-9e+-.,]+$/.test(value) && !Number.isNaN(number) &&
      Number.isFinite(number);
  },

  isNumberInRange(value, range = {}) {
    const {min = 0, max = Number.POSITIVE_INFINITY} = range;
    const number = parseFloat(value);

    return ValidatorUtil.isNumber(value) && number >= min && number <= max;
  },

  /**
   * Test if the data argument is:
   *
   *  - null
   *  - undefined
   *  - []
   *  - {}
   *
   * @param {any} data - The variable to test
   * @returns {boolean} - Returns true if the value is considered empty
   */
  isEmpty: function (data) {
    if (typeof data === 'number' || typeof data === 'boolean') {
      return false;
    }

    if (typeof data === 'undefined' || data === null) {
      return true;
    }

    if (typeof data.length !== 'undefined') {
      return data.length === 0;
    }

    return Object.keys(data).reduce(function (memo, key) {
      if (data.hasOwnProperty(key)) {
        memo++;
      }

      return memo;
    }, 0) === 0;
  }

};

module.exports = ValidatorUtil;
