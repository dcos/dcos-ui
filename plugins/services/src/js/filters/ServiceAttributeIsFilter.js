import DSLFilterTypes from "../../../../../src/js/constants/DSLFilterTypes";
import DSLFilter from "../../../../../src/js/structs/DSLFilter";
import ServiceStatus from "../constants/ServiceStatus";

const LABEL = "is";

const LABEL_TO_INSTANCE = {
  delayed: ServiceStatus.DELAYED,
  deploying: ServiceStatus.DEPLOYING,
  na: ServiceStatus.NA,
  running: ServiceStatus.RUNNING,
  suspended: ServiceStatus.SUSPENDED,
  waiting: ServiceStatus.WAITING
};

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
      filterArguments.label === LABEL &&
      LABEL_TO_INSTANCE[filterArguments.text.toLowerCase()] != null
    );
  }

  /**
   * Keep only services whose health service matches the value of
   * the `is` label
   *
   * @override
   */
  filterApply(resultset, filterType, filterArguments) {
    const testStatus = LABEL_TO_INSTANCE[filterArguments.text.toLowerCase()];

    return resultset.filterItems(service => {
      return service.getServiceStatus() === testStatus;
    });
  }
}

module.exports = ServiceAttribIsFilter;
