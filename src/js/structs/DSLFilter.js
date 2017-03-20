/**
 * This is the base class for implementing custom DSL Filters
 */
class DSLFilter {
  /* eslint-disable no-unused-vars */

  /**
   * Returns true if the filter can be applied to the given operand
   *
   * @abstract
   * @param {DSLFilterTypes} filterType -
   *  The filter type (ex. fuzzy or attribute)
   * @param {Object} filterArguments - The filter arguments
   * @returns {Boolean} True if the filter can be applied to the given operand
   */
  filterCanHandle(filterType, filterArguments) {
    return false;
  }

  /**
   * Apply the filter to the given result set, using the operand details given
   *
   * @abstract
   * @param {List} resultset - The list with the results to filter
   * @param {DSLFilterTypes} filterType -
   *  The filter type (ex. fuzzy or attribute)
   * @param {Object} filterArguments - The filter arguments
   * @returns {List} Returns the new, filtered list
   */
  filterApply(resultset, filterType, filterArguments) {
    return resultset;
  }

  /**
   * Return typeahead components for the given state of the filter
   *
   * @abstract
   * @param {DSLFilterTypes} filterType -
   *  The filter type (ex. fuzzy or attribute)
   * @param {Object} filterArguments - The filter arguments
   * @returns {Array} Returns an array of React.Components to display in the typeahead dropdown
   */
  filterTypeahead(filterType, filterArguments) {
    return [];
  }

  /* eslint-enable no-unused-vars */
}

module.exports = DSLFilter;
