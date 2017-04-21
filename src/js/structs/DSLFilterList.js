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
    this.add = this.add.bind(filters);
    this.getMatchingFilters = this.getMatchingFilters.bind(filters);
  }

  /**
   * Add a filter to the list of filters
   *
   * @param {...DSLFilter} filter - The filter to plug
   * @returns {DSLFilterList} Returns a new DSLFilterList object
   */
  add(...filters) {
    return new DSLFilterList(this.concat(filters));
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
