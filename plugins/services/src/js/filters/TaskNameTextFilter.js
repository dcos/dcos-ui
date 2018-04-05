import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import DSLFilter from "#SRC/js/structs/DSLFilter";

/**
 * This filter handles the `text` attributes against taks's `name` value
 */
class TaskNameTextFilter extends DSLFilter {
  /**
   * Handle all `name` attribute filters that we can handle.
   *
   * @override
   */
  filterCanHandle(filterType) {
    return (
      filterType === DSLFilterTypes.EXACT || filterType === DSLFilterTypes.FUZZY
    );
  }

  /**
   * Keep only tasks whose name contains part of the filter's text
   *
   * @override
   */
  filterApply(resultSet, filterType, filterArguments) {
    return resultSet.filterItems(task => {
      return (
        (task.id && task.id.indexOf(filterArguments.text) !== -1) ||
        (task.name && task.name.indexOf(filterArguments.text) !== -1)
      );
    });
  }
}

module.exports = TaskNameTextFilter;
