import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import DSLFilter from "#SRC/js/structs/DSLFilter";

const LABEL = "is";

const LABEL_TO_TYPE = {
  private: "private",
  public: "public",
};

class NodesTypeFilter extends DSLFilter {
  /**
   * Handle all `is:private||public` attribute filters that we can handle.
   *
   * @override
   */
  filterCanHandle(filterType, filterArguments) {
    return (
      filterType === DSLFilterTypes.ATTRIB &&
      filterArguments.label === LABEL &&
      LABEL_TO_TYPE[filterArguments.text.toLowerCase()] != null
    );
  }

  /**
   * Keep only services whose type status matches the value of
   * the `type` label
   *
   * @override
   */
  filterApply(resultset, filterType, filterArguments) {
    const testStatus = LABEL_TO_TYPE[filterArguments.text.toLowerCase()];

    return resultset.filterItems((node) => {
      const nodeType = node.isPublic() ? "public" : "private";
      return nodeType === testStatus;
    });
  }
}

export default NodesTypeFilter;
