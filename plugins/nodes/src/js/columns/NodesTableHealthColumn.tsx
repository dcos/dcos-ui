import * as React from "react";
import { TextCell } from "@dcos/ui-kit";

import UnitHealthUtil from "#SRC/js/utils/UnitHealthUtil";
import Node from "#SRC/js/structs/Node";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";

const NodeHealth = ({
  classNames,
  title
}: {
  classNames: string;
  title: string;
}) => (
  <TextCell>
    <span className={classNames}>{title}</span>
  </TextCell>
);
const NodeHealthMemo = React.memo(NodeHealth);

export function healthRenderer(data: Node): React.ReactNode {
  const health = data.getHealth();
  return <NodeHealthMemo classNames={health.classNames} title={health.title} />;
}

export function healthSorter(
  data: Node[],
  sortDirection: SortDirection
): Node[] {
  const sortedData = data.sort(UnitHealthUtil.getHealthSortFunction);
  return sortDirection === "ASC" ? sortedData : sortedData.reverse();
}
