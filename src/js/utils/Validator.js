var Validator = {
  isEmail: function (email) {
    return email != null &&
      email.length > 0 &&
      !/\s/.test(email) &&
      /.+@.+\..+/
      .test(email);
  },

  hasNoWhitespaces: function (str) {
    return str.match(/ /g) == null;
  },

  hasValidServiceIdChars: function (str) {
    return str.match(/[^a-z0-9\-\.\/]/g) == null;
  },

  isWellFormedServiceIdPath: function (str) {
    // This RegExp is taken from the ID field explanation described here:
    // https://mesosphere.github.io/marathon/docs/rest-api.html#post-v2-apps
    var idMatchRegExp = '^(([a-z0-9]|[a-z0-9][a-z0-9\-]*' +
      '[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])$';
    return str.split('/').every((pathSegement) => {
      return pathSegement == null ||
        pathSegement.length === 0 ||
        pathSegement === '.' ||
        pathSegement === '..' || !!pathSegement.match(idMatchRegExp);
    });
  }
};

module.exports = Validator;
