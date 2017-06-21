import DSLFilterTypes from "../../../../../src/js/constants/DSLFilterTypes";
import DSLFilter from "../../../../../src/js/structs/DSLFilter";
import Pod from "../structs/Pod";

const LABEL = "is";
const LABEL_TEXT = "pod";

/**
 * This filter handles the `is:pod` for filtering pod instances
 */
class ServiceAttributeIsPodFilter extends DSLFilter {
  /**
   * Handle all `is:pod` attribute filters.
   *
   * @override
   */
  filterCanHandle(filterType, filterArguments) {
    return (
      filterType === DSLFilterTypes.ATTRIB &&
      filterArguments.label === LABEL &&
      filterArguments.text.toLowerCase() === LABEL_TEXT
    );
  }

  /**
   * Keep only services whose instance is of type `Pod`
   *
   * @override
   */
  filterApply(resultset) {
    return resultset.filterItems(service => {
      return service instanceof Pod;
    });
  }
}

module.exports = ServiceAttributeIsPodFilter;
