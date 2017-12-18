import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import DSLFilter from "#SRC/js/structs/DSLFilter";
import TaskUtil from "../utils/TaskUtil";

const LABEL = "region";

/**
 * This filter handles the `region:XXXX` for tasks
 */
class TasksRegionFilter extends DSLFilter {
  constructor(regions) {
    super();
    this.regions = [];

    if (Array.isArray(regions)) {
      this.regions = regions;
    }
  }
  /**
   * Handle all `region:XXXX` attribute filters that we can handle.
   *
   * @override
   */
  filterCanHandle(filterType, filterArguments) {
    const regions = this.regions;

    return (
      filterType === DSLFilterTypes.ATTRIB &&
      filterArguments.label === LABEL &&
      regions.includes(filterArguments.text.toLowerCase())
    );
  }

  /**
   * Keep only tasks whose region matches the value of
   * the `region` label
   *
   * @override
   */
  filterApply(resultset, filterType, filterArguments) {
    let region = "";
    if (this.regions.includes(filterArguments.text.toLowerCase())) {
      region = filterArguments.text.toLowerCase();
    }

    return resultset.filterItems(task => {
      const node = TaskUtil.getNode(task);

      return node.getRegionName().toLowerCase() === region;
    });
  }
}

module.exports = TasksRegionFilter;
