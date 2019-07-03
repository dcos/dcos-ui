/**
 * Different types of filters (operands) in a DSL expression
 */
const FilterTypes = {
  ATTRIB: 1,
  EXACT: 2,
  FUZZY: 3
};

export type FilterType = 1 | 2 | 3;
export default FilterTypes;
