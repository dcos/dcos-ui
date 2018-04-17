import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import DSLFilter from "#SRC/js/structs/DSLFilter";

/**
 * This filter handles the `text` attributes against service's `getName` value
 */
class NodesTextFilter extends DSLFilter {
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
   * Keep only nodes whose name has text
   *
   * @override
   */
  filterApply(resultset, filterType, filterArguments) {
    return resultset.filterItems(node => {
      const hostName = node.getHostName();

      return hostName && hostName.includes(filterArguments.text);
    });
  }
}

module.exports = NodesTextFilter;
