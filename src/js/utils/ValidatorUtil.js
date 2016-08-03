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
    let expectDiscreetString = '';

    // If we have discreet values, create a help string
    if (discreteValues.length) {
      expectDiscreetString += ' or "' + discreteValues[0] + '" - "' + discreteValues[discreteValues.length-1] + '"';
    }

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
          return 'expects step declaration (/) to be a number'+expectDiscreetString+' ('+stepValue+' given)';
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
      let firstIndex;
      let rangeParts = listValue.toLowerCase().split('-');
      if (rangeParts.length > 2) {
        return 'has more than one range (-) declaration';
      }

      // Check empty range cases
      if (rangeParts[0] === '') {
        return 'cannot accept negative values';
      } else if ((rangeParts.length === 2) && (rangeParts[1] === '')) {
        return 'has an incomplete range declaration';
      }

      // Handle star wildcard case
      if (rangeParts[0] === '*') {

        // The only invalid case is in a range
        if (rangeParts.length > 1) {
          return 'does not accept * in a range';
        }

        // Move along
        return null;

      }

      // Check integrity of first part
      if (isNaN(rangeParts[0])) {

        // Try to get the discreete value index
        firstIndex = discreteValues.indexOf(rangeParts[0]);

        // If there is no discreete value, this number is not
        if (firstIndex === -1) {
          return 'expects value \''+rangeParts[0]+'\' to be a number'+expectDiscreetString;
        }

      } else {

        // Check numerical values against continuous range
        let numValue = parseInt(rangeParts[0]);
        if (numValue < numMin) {
          return 'expects values bigger than '+numMin;
        }
        if (numValue > numMax) {
          return 'expects values smaller than '+numMax;
        }

        // Update first index
        firstIndex = numValue;

      }

      // Check integrity of the second part
      if (rangeParts.length === 2) {
        let secondIndex;
        if (isNaN(rangeParts[0])) {

          // Try to get the discreete value index
          secondIndex = discreteValues.indexOf(rangeParts[1]);

          // If there is no discreete value, this number is not
          if (secondIndex === -1) {
            return 'expects value \''+rangeParts[1]+'\' to be a number'+expectDiscreetString;
          }

        } else {

          // Check numerical values against continuous range
          let numValue = parseInt(rangeParts[1]);
          if (numValue < numMin) {
            return 'expects values bigger than '+numMin;
          }
          if (numValue > numMax) {
            return 'expects values smaller than '+numMax;
          }

          // Update second index
          secondIndex = numValue;

        }

        // Validate incrementing order in indices
        if (secondIndex <= firstIndex) {
          return 'expects ranges in incrementing order';
        }

      }

      // Validation passes
      return null;

    }, null);

  }

};

module.exports = ValidatorUtil;
