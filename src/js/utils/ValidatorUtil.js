var ValidatorUtil = {
  isDefined: function (value) {
    return value != null && value !== '' || typeof value === 'number';
  },

  isEmail: function (email) {
    return email != null &&
      email.length > 0 &&
      !/\s/.test(email) &&
      /.+@.+\..+/
      .test(email);
  },

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
  },

  isNumberInRange: function (value, range = {}) {
    const {min = 0, max = Number.POSITIVE_INFINITY} = range;
    const number = parseFloat(value);

    return !Number.isNaN(number) && number >= min && number <= max;
  }
};

module.exports = ValidatorUtil;
