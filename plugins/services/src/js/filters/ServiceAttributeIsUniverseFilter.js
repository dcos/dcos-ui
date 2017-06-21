import DSLFilterTypes from "../../../../../src/js/constants/DSLFilterTypes";
import DSLFilter from "../../../../../src/js/structs/DSLFilter";
import Framework from "../structs/Framework";

const LABEL = "is";
const LABEL_TEXT = "universe";

/**
 * This filter handles the `is:universe` for filtering universe frameworks
 */
class ServiceAttributeIsUniverseFilter extends DSLFilter {
  /**
   * Handle all `is:universe` attrib filters that we can handle.
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
   * Keep only services whose instance is of type `Framework`
   *
   * @override
   */
  filterApply(resultset) {
    return resultset.filterItems(service => {
      return service instanceof Framework;
    });
  }
}

module.exports = ServiceAttributeIsUniverseFilter;
