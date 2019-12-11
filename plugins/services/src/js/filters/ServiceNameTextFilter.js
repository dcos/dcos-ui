import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import DSLFilter from "#SRC/js/structs/DSLFilter";

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
    return resultset.filterItems(
      service => service.getName().indexOf(filterArguments.text) !== -1
    );
  }
}

export default ServiceNameTextFilter;
