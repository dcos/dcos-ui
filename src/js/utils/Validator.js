var _ = require('underscore');

var Validator = {
  isEmail: function (email) {
    return !_.isEmpty(email) &&
      !/\s/.test(email) &&
      /.+@.+\..+/
      .test(email);
  }

};

module.exports = Validator;
