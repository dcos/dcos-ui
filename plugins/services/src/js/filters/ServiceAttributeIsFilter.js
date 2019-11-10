import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import DSLFilter from "#SRC/js/structs/DSLFilter";
import * as ServiceStatus from "../constants/ServiceStatus";

/**
 * This filter handles the `is:status` for services using `getServiceStatus`
 */
class ServiceAttribIsFilter extends DSLFilter {
  /**
   * Handle all `is:XXXX` attribute filters that we can handle.
   *
   * @override
   */
  filterCanHandle(filterType, filterArguments) {
    return (
      filterType === DSLFilterTypes.ATTRIB &&
      filterArguments.label === "is" &&
      ServiceStatus[filterArguments.text.toUpperCase()] != null
    );
  }

  /**
   * Keep only services whose health service matches the value of
   * the `is` label
   *
   * @override
   */
  filterApply(resultset, filterType, filterArguments) {
    const testStatus = ServiceStatus[filterArguments.text.toUpperCase()];

    return resultset.filterItems(
      service => service.getServiceStatus() === testStatus
    );
  }
}

module.exports = ServiceAttribIsFilter;
