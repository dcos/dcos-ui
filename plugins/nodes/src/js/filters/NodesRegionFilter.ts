import { DSLFilterTypes, DSLFilter } from "@d2iq/dsl-filter";

/**
 * This filter handles the `region:XXXX` for nodes
 */
const filter: DSLFilter = {
  /*
   * Handle all `region:XXXX` attribute filters that we can handle.
   */
  filterCanHandle: (filterType, filterArguments) =>
    filterType === DSLFilterTypes.ATTRIB && filterArguments.label === "region",
  /*
   * Keep only nodes whose region matches the value of the `region` label
   */
  filterApply: (resultSet, _filterType, { text }) =>
    resultSet.filterItems(
      node => node.getRegionName().toLowerCase() === text.toLowerCase()
    )
};
export default filter;
