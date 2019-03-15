import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import DSLFilter from "#SRC/js/structs/DSLFilter";
import HealthStatus from "../constants/HealthStatus";

const LABEL = "no";
const LABEL_TEXT = "healthchecks";

/**
 * This filter handles the `no:healthckecks` filter that returns the services
 * without health checks
 */
class ServiceAttributeNoHealthchecksFilter extends DSLFilter {
  /**
   * Handle all `no:healthckecks` attribute filters.
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
   * Keep only services whose health checks is N/A
   *
   * @override
   */
  filterApply(resultset) {
    return resultset.filterItems(service => {
      return service.getHealth() === HealthStatus.NA;
    });
  }
}

export default ServiceAttributeNoHealthchecksFilter;
