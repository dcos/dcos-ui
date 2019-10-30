// @ts-ignore
import { DSLFilterTypes, DSLFilter } from "@d2iq/dsl-filter";
import { Status } from "../types/Status";

/*
 * Handle `status:XXXX` filters.
 */
const filter: DSLFilter = {
  filterCanHandle: (filterType, filterArguments) =>
    filterType === DSLFilterTypes.ATTRIB && filterArguments.label === "status",

  filterApply: (resultSet, _filterType, { text }) =>
    resultSet.filterItems(
      node =>
        Status.fromNode(node).displayName.toLowerCase() === text.toLowerCase()
    )
};
export default filter;
