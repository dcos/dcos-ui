import * as React from "react";
import { sort, compareNumber, compareString } from "@dcos/sorting";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
import { TextCell } from "@dcos/ui-kit";
import {
  SortDirection,
  directionAwareComparators
} from "plugins/nodes/src/js/types/SortDirection";

export function diskRenderer(data: Node): React.ReactNode {
  return (
    <TextCell>
      <span>{data.getUsageStats("disk").percentage}%</span>
    </TextCell>
  );
}

function getDiskUsage(data: Node) {
  return data.getUsageStats("disk").percentage;
}

function getHostName(node: Node) {
  return node.getHostName().toLowerCase();
}

export function diskSorter(data: Node[], sortDirection: SortDirection): Node[] {
  return sort(
    directionAwareComparators(
      [compareNumber(getDiskUsage), compareString(getHostName)],
      sortDirection
    ),
    data
  );
}
export function diskSizer(args: WidthArgs): number {
  // TODO: DCOS-39147
  return Math.min(60, Math.max(60, args.width / args.totalColumns));
}
