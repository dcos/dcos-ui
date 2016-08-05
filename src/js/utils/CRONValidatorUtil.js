
/**
 * Validator utilities for CRON syntax
 */
class CRONValidatorUtil {

  /**
   * Test if the given string is a valid CRON syntax
   *
   * @param {string} value - The cron string to test
   * @returns {string} - Returns null if test passes otherwise return the error string
   */
  static testCronString(value) {
    let test;
    let parts = value.split(/ +/);
    if (parts.length !== 5) {
      return 'Expecting 5 components: minute hour date month weekday';
    }

    // Validate minute
    test = CRONValidatorUtil.testCronComponent( parts[0], 0, 59 );
    if (test !== null) {
      return 'Minute (1rst component) '+test;
    }

    // Validate hour
    test = CRONValidatorUtil.testCronComponent( parts[1], 0, 23 );
    if (test !== null) {
      return 'Hour (2nd component) '+test;
    }

    // Validate date
    test = CRONValidatorUtil.testCronComponent( parts[2], 1, 31 );
    if (test !== null) {
      return 'Date (3rd component) '+test;
    }

    // Validate month
    test = CRONValidatorUtil.testCronComponent( parts[3], 1, 12,
      ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    );
    if (test !== null) {
      return 'Month (4th component) '+test;
    }

    // Validate weekday
    test = CRONValidatorUtil.testCronComponent( parts[4], 0, 6,
      ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    );
    if (test !== null) {
      return 'Week day (5th component) '+test;
    }

    // All tests passed successfully
    return null;
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
  static testCronComponent(component, numMin, numMax, discreteValues = []) {
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

module.exports = CRONValidatorUtil;
