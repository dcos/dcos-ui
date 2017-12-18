import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import DSLFilter from "#SRC/js/structs/DSLFilter";
import TaskUtil from "../utils/TaskUtil";

const LABEL = "zone";

/**
 * This filter handles the `zone:XXXX` for tasks
 */
class TasksZoneFilter extends DSLFilter {
  constructor(zones) {
    super();
    this.zones = [];

    if (Array.isArray(zones)) {
      this.zones = zones;
    }
  }
  /**
   * Handle all `zone:XXXX` attribute filters that we can handle.
   *
   * @override
   */
  filterCanHandle(filterType, filterArguments) {
    const zones = this.zones;

    return (
      filterType === DSLFilterTypes.ATTRIB &&
      filterArguments.label === LABEL &&
      zones.includes(filterArguments.text.toLowerCase())
    );
  }

  /**
   * Keep only tasks whose zone matches the value of
   * the `zone` label
   *
   * @override
   */
  filterApply(resultset, filterType, filterArguments) {
    let zone = "";
    if (this.zones.includes(filterArguments.text.toLowerCase())) {
      zone = filterArguments.text.toLowerCase();
    }

    return resultset.filterItems(task => {
      const node = TaskUtil.getNode(task);

      return node.getZoneName().toLowerCase() === zone;
    });
  }
}

module.exports = TasksZoneFilter;
