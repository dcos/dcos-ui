import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import DSLFilter from "#SRC/js/structs/DSLFilter";

const LABEL = "is";

const LABEL_TO_STATUS = {
  active: "active",
  completed: "completed"
};

/**
 * This filter handles the `is:state` for instances
 */
class PodInstanceStatusFilter extends DSLFilter {
  /**
   * Handle all `is:XXXX` attribute filters that we can handle.
   *
   * @override
   */
  filterCanHandle(filterType, filterArguments) {
    return (
      filterType === DSLFilterTypes.ATTRIB &&
      filterArguments.label === LABEL &&
      LABEL_TO_STATUS[filterArguments.text.toLowerCase()] != null
    );
  }

  /**
   * Keep only instances whose state matches the value of
   * the `is` label
   *
   * @override
   */
  filterApply(resultSet, filterType, filterArguments) {
    const testStatus = LABEL_TO_STATUS[filterArguments.text.toLowerCase()];

    return resultSet.filterItems(instance => {
      let instanceStatus = "completed";

      if (instance.isStaging()) {
        instanceStatus = "staging";
      }

      if (instance.isRunning()) {
        instanceStatus = "active";
      }

      return instanceStatus === testStatus;
    });
  }
}

module.exports = PodInstanceStatusFilter;
