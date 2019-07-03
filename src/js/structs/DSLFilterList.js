/**
 * This class maintains a list with available filters that can be used
 * with a DSL expression.
 */
class DSLFilterList {
  /**
   * DSLFilterList constructor with optional initial filters array
   *
   * @param {Array} [filters] - An array with the initial filters
   */
  constructor(filters = []) {
    this.getMatchingFilters = this.getMatchingFilters.bind(filters);
  }

  /**
   * Returns an array of filter objects that match the specified filter token
   * array and arguments.
   *
   * @param {Number} filterType - The filter type (attribute, fuzzy, freetext)
   * @param {Object} filterArguments - The filter arguments, with `text` containing the string the user provided
   * @returns {Array} Returns an array of DSLFilter objects that can handle the given token
   */
  getMatchingFilters(filterType, filterArguments) {
    return this.filter(function(filter) {
      return filter.filterCanHandle(filterType, filterArguments);
    });
  }
}

module.exports = DSLFilterList;
