var ValidatorUtil = {
  isDefined(value) {
    return (value != null && value !== "") || typeof value === "number";
  },

  isEmail(email) {
    return (
      email != null &&
      email.length > 0 &&
      !/\s/.test(email) &&
      /.+@.+\..+/.test(email)
    );
  },

  isEmpty(data) {
    if (typeof data === "number" || typeof data === "boolean") {
      return false;
    }

    if (typeof data === "undefined" || data === null) {
      return true;
    }

    if (typeof data.length !== "undefined") {
      return data.length === 0;
    }

    return (
      Object.keys(data).reduce(function(memo, key) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          memo++;
        }

        return memo;
      }, 0) === 0
    );
  },

  isInteger(value) {
    return ValidatorUtil.isNumber(value) && Number.isInteger(parseFloat(value));
  },

  isNumber(value) {
    const number = parseFloat(value);

    return (
      /^[0-9e+-.,]+$/.test(value) &&
      !Number.isNaN(number) &&
      Number.isFinite(number)
    );
  },

  isNumberInRange(value, range = {}) {
    const { min = 0, max = Number.POSITIVE_INFINITY } = range;
    const number = parseFloat(value);

    return ValidatorUtil.isNumber(value) && number >= min && number <= max;
  },

  isStringInteger(value) {
    return typeof value === "string" && /^([0-9]+)$/.test(value);
  }
};

module.exports = ValidatorUtil;
