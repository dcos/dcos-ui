import * as React from "react";
import { sort, compareNumber, compareString } from "@dcos/sorting";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
import {
  SortDirection,
  directionAwareComparators
} from "plugins/nodes/src/js/types/SortDirection";
import { TextCell } from "@dcos/ui-kit";

function getMemUsage(data: Node) {
  return data.getUsageStats("mem").percentage;
}
function getHostname(data: Node): string {
  return data.getHostName();
}

export function memRenderer(data: Node): React.ReactNode {
  return (
    <TextCell>
      <span>{getMemUsage(data)}%</span>
    </TextCell>
  );
}

export function memSorter(data: Node[], sortDirection: SortDirection): Node[] {
  return sort(
    directionAwareComparators(
      [compareNumber(getMemUsage), compareString(getHostname)],
      sortDirection
    ),
    data
  );
}

export function memSizer(args: WidthArgs): number {
  // TODO: DCOS-39147
  return Math.min(60, Math.max(60, args.width / args.totalColumns));
}
