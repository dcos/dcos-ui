import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import DSLFilter from "#SRC/js/structs/DSLFilter";

const LABEL = "region";

/**
 * This filter handles the `region:XXXX` for nodes
 */
class NodesRegionFilter extends DSLFilter {
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
   * Keep only nodes whose region matches the value of the `region` label
   *
   * @override
   */
  filterApply(resultSet, filterType, filterArguments) {
    let region = "";
    const filterArgumentsText = filterArguments.text.toLowerCase();
    if (this.regions.includes(filterArgumentsText)) {
      region = filterArgumentsText;
    }

    return resultSet.filterItems(node => {
      return node.getRegionName().toLowerCase() === region;
    });
  }
}

export default NodesRegionFilter;
