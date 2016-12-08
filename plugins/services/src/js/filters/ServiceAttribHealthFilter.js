import DSLFilterTypes from '../../../../../src/js/constants/DSLFilterTypes';
import DSLFilter from '../../../../../src/js/structs/DSLFilter';
import HealthStatus from '../constants/HealthStatus';

const LABEL = 'health';

const LABEL_TO_HEALTH = {
  healthy   : HealthStatus.HEALTHY,
  idle      : HealthStatus.IDLE,
  na        : HealthStatus.NA,
  unhealthy : HealthStatus.UNHEALTHY
};

/**
 * This filter handles the `health:status` for services using `getHealth`
 */
class SearviceAttribHealthFilter extends DSLFilter {

  /**
   * Handle all `health:XXXX` attrib filters that we can handle.
   *
   * @override
   */
  filterCanHandle(filterType, filterArguments) {
    return filterType === DSLFilterTypes.ATTRIB &&
           filterArguments.label === LABEL &&
           LABEL_TO_HEALTH[filterArguments.text.toLowerCase()] != null;
  }

  /**
   * Keep only services whose health status matches the value of
   * the `health` label
   *
   * @override
   */
  filterApply(resultset, filterType, filterArguments) {
    let testStatus = LABEL_TO_HEALTH[filterArguments.text.toLowerCase()];

    return resultset.filterItems((service) => {
      return service.getHealth() === testStatus;
    });
  }

}

module.exports = SearviceAttribHealthFilter;
