import { DSLFilterTypes, DSLFilter } from "@d2iq/dsl-filter";

const LABEL = "is";

const LABEL_TO_HEALTH = {
  healthy: "healthy",
  unhealthy: "unhealthy"
};

class NodesHealthFilter extends DSLFilter {
  /**
   * Handle all `is:healthy||unhealthy` attribute filters that we can handle.
   *
   * @override
   */
  filterCanHandle(filterType, filterArguments) {
    return (
      filterType === DSLFilterTypes.ATTRIB &&
      filterArguments.label === LABEL &&
      LABEL_TO_HEALTH[filterArguments.text.toLowerCase()] != null
    );
  }

  /**
   * Keep only services whose health status matches the value of
   * the `health` label
   *
   * @override
   */
  filterApply(resultset, filterType, filterArguments) {
    const testStatus = LABEL_TO_HEALTH[filterArguments.text.toLowerCase()];

    return resultset.filterItems(node => {
      return node.getHealth().key.toLowerCase() === testStatus;
    });
  }
}

module.exports = NodesHealthFilter;
