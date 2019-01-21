import * as React from "react";
import { TextCell } from "@dcos/ui-kit";

import UnitHealthUtil from "#SRC/js/utils/UnitHealthUtil";
import Node from "#SRC/js/structs/Node";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";

export function healthRenderer(data: Node): React.ReactNode {
  const health = data.getHealth();
  return (
    <TextCell>
      <span className={health.classNames}>{health.title}</span>
    </TextCell>
  );
}

export function healthSorter(
  data: Node[],
  sortDirection: SortDirection
): Node[] {
  const sortedData = data.sort(UnitHealthUtil.getHealthSortFunction);
  return sortDirection === "ASC" ? sortedData : sortedData.reverse();
}
