import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import DSLFilter from "#SRC/js/structs/DSLFilter";
import ServiceStatus from "../constants/ServiceStatus";

const LABEL = "is";

const LABEL_TO_INSTANCE = {
  deleting: ServiceStatus.DELETING,
  deploying: ServiceStatus.DEPLOYING,
  recovering: ServiceStatus.RECOVERING,
  running: ServiceStatus.RUNNING,
  stopped: ServiceStatus.STOPPED
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

export default ServiceAttribIsFilter;
