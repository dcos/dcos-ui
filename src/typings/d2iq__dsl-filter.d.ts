import List from "#SRC/js/structs/List";
import Node from "#SRC/js/structs/Node";

export const DSLFilterTypes = {
  ATTRIB: 1,
  EXACT: 2,
  FUZZY: 3
};

type DSLFilterType = 1 | 2 | 3;

type Arguments = {
  label: string;
  text: string;
};

export interface DSLFilter {
  /**
   * Returns true if the filter can be applied to the given operand
   */
  filterCanHandle(type: DSLFilterTypes, args: Arguments): boolean;

  /**
   * Apply the filter to the given result set, using the operand details given
   * Returns the new, filtered list
   */
  filterApply(
    resultset: List<Node>,
    type: DSLFilterTypes,
    args: Arguments
  ): List<Node>;
}
