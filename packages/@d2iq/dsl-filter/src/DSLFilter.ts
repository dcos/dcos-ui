import List from "#SRC/js/structs/List";
import Node from "#SRC/js/structs/Node";

import { FilterType } from "./DSLFilterTypes";

type Arguments = {
  label: string;
  text: string;
};

export default interface DSLFilter {
  /**
   * Returns true if the filter can be applied to the given operand
   */
  filterCanHandle(type: FilterType, args: Arguments): boolean;

  /**
   * Apply the filter to the given result set, using the operand details given
   * Returns the new, filtered list
   */
  filterApply(
    resultset: List<Node>,
    type: FilterType,
    args: Arguments
  ): List<Node>;
}

// we need this as long as you find something when grep'ing for `extends DSLFilter`.
// it's a backwards-compatibility-measure on our way of converting filters to TS.
export default class DSLFilter {}
