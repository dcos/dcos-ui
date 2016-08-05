var ValidatorUtil = {
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
  }
};

module.exports = ValidatorUtil;
