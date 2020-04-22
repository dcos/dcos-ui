import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";

const getStatus = (label) =>
  ({
    active: "active",
    completed: "completed",
  }[label.toLowerCase()]);

/**
 * This filter handles the `is:state` for instances
 */
export default {
  /**
   * Handle all `is:XXXX` attribute filters that we can handle.
   */
  filterCanHandle(filterType, { label, text }) {
    return (
      filterType === DSLFilterTypes.ATTRIB && label === "is" && getStatus(text)
    );
  },

  /**
   * Keep only instances whose state matches the value of the `is` label
   */
  filterApply(resultSet, _filterType, { text }) {
    const testStatus = getStatus(text);

    return resultSet.filterItems((instance) => {
      let instanceStatus = "completed";
      if (instance.isStaging()) {
        instanceStatus = "staging";
      }
      if (instance.isRunning()) {
        instanceStatus = "active";
      }

      return instanceStatus === testStatus;
    });
  },
};
