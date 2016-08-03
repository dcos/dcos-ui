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
  }

  /**
   * Check if the given string is a valid cron component
   *
   * @param {string} component - The cron component to test
   * @param {number} numMin - The minimum value accepted in the numerical components
   * @param {number} numMax - The maximum value accepted in the numerical components
   * @param {array} discreteValues - Other valid discreet values
   * @returns {string} - Returns null if test passes otherwise return the error string
   */
  testCronComponent: function (component, numMin, numMax, discreteValues = []) {
    let value = component;

    // Separate stepValue
    if (component.indexOf('/') !== -1) {
      let parts = component.split('/');
      if (parts.length > 2) {
        return 'can have only up to one step (/) declaration';
      }

      // Separate to value and stepValue
      let stepValue = parts[1].toLowerCase();
      value = parts[0];

      // Validate stepValue
      if (isNaN(stepValue)) {
        // Check non-numerical values against discreet values
        if (discreteValues.indexOf(stepValue) === -1) {
          return 'expects step declaration (/) to be a number ('+stepValue+' given)';
        }

      } else {
        // Check numerical values against continuous range
        let numValue = parseInt(stepValue);
        if (numValue < numMin) {
          return 'expects step value bigger than '+numMin;
        }
        if (numValue > numMax) {
          return 'expects step value smaller than '+numMax;
        }
      }

    }

    // Extract list of items
    return value.split(',').reduce(function ( lastError, listValue ) {

      // Keep the first error encountered
      if (lastError) {
        return lastError;
      }

      // Check if this is a range
      let rangeParts = listValue.split('-');
      if (rangeParts.length > 2) {
        return 'has more than one range (-) declaration';
      }

      // Validate range parts
      return rangeParts.reduce(function ( lastError, rangeValue ) {

        // Keep the first error encountered
        if (lastError) {
          return lastError;
        }

        // Star is always accepted
        if (rangeValue === '*') {
          return null;
        }

        // Validate stepValue
        if (isNaN(rangeValue)) {
          // Check non-numerical values against discreet values
          if (discreteValues.indexOf(rangeValue) === -1) {
            return 'expects value \''+rangeValue+'\' to be a number';
          }

        } else {
          // Check numerical values against continuous range
          let numValue = parseInt(rangeValue);
          if (numValue < numMin) {
            return 'expects values bigger than '+numMin;
          }
          if (numValue > numMax) {
            return 'expects values smaller than '+numMax;
          }
        }

        // Test pass
        return null;

      }, null);

    }, null);

  }

};

module.exports = ValidatorUtil;
