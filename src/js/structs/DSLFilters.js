/**
 * This class maintains a dictionary with all the currently available
 */
class DSLFilters {

  /**
   * DSLFilters constructor with optional initial filters array
   *
   * @param {Array} [filters] - An array with the initial filters
   */
  constructor(filters=[]) {
    this.add = this.add.bind(filters);
    this.getMatchingFilters = this.getMatchingFilters.bind(filters);
  }

  /**
   * Add a filter to the list of filters
   *
   * @param {DSLFilter} filter - The filter to plug
   * @returns {DSLFilters} Returns a new DSLFilters object
   */
  add(filter) {
    return new DSLFilters(
      this.concat([filter])
    );
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
    return this.filter(function (filter) {
      return filter.filterCanHandle(filterType, filterArguments);
    });
  }

};

module.exports = DSLFilters;
