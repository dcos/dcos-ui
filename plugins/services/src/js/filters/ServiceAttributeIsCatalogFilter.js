import { DSLFilterTypes, DSLFilter } from "@d2iq/dsl-filter";
import Framework from "../structs/Framework";

const LABEL = "is";
const LABEL_TEXT = "catalog";

/**
 * This filter handles the `is:catalog` for filtering catalog frameworks
 */
class ServiceAttributeIsCatalogFilter extends DSLFilter {
  /**
   * Handle all `is:catalog` attrib filters that we can handle.
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

module.exports = ServiceAttributeIsCatalogFilter;
