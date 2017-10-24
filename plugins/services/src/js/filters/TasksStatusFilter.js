import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import DSLFilter from "#SRC/js/structs/DSLFilter";

const LABEL = "is";

const LABEL_TO_STATUS = {
  active: "TASK_RUNNING",
  completed: "TASK_COMPLETE"
};

/**
 * This filter handles the `is:state` for tasks
 */
class TasksStatusFilter extends DSLFilter {
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
   * Keep only tasks whose state matches the value of
   * the `is` label
   *
   * @override
   */
  filterApply(resultset, filterType, filterArguments) {
    const testStatus = LABEL_TO_STATUS[filterArguments.text.toLowerCase()];

    return resultset.filterItems(task => {
      return task.state.toLowerCase() === testStatus.toLowerCase();
    });
  }
}

module.exports = TasksStatusFilter;
