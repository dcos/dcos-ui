import * as React from "react";
import UnitHealthUtil from "#SRC/js/utils/UnitHealthUtil";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";

export function healthRenderer(data: Node): React.ReactNode {
  const health = data.getHealth();
  return <span className={health.classNames}>{health.title}</span>;
}

export function healthSorter(
  data: Node[],
  sortDirection: SortDirection
): Node[] {
  const sortedData = data.sort(UnitHealthUtil.getHealthSortFunction);
  return sortDirection === "ASC" ? sortedData : sortedData.reverse();
}

export function healthSizer(args: WidthArgs): number {
  // TODO: DCOS-38827
  return Math.max(100, args.width / args.totalColumns);
}
