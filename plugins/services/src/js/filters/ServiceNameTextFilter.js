import DSLFilterTypes from "../../../../../src/js/constants/DSLFilterTypes";
import DSLFilter from "../../../../../src/js/structs/DSLFilter";

/**
 * This filter handles the `text` attributes against service's `getName` value
 */
class ServiceNameTextFilter extends DSLFilter {
  /**
   * Handle all `name` attribute filters that we can handle.
   *
   * @override
   */
  filterCanHandle(filterType) {
    return (
      filterType === DSLFilterTypes.EXACT || filterType === DSLFilterTypes.FUZZY
    );
  }

  /**
   * Keep only services whose status
   *
   * @override
   */
  filterApply(resultset, filterType, filterArguments) {
    return resultset.filterItems(service => {
      return service.getName().indexOf(filterArguments.text) !== -1;
    });
  }
}

module.exports = ServiceNameTextFilter;
