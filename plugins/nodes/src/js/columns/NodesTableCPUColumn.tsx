import * as React from "react";
import { sort, compareNumber, compareString } from "@dcos/sorting";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "../types/IWidthArgs";
import { TextCell } from "@dcos/ui-kit";
import {
  SortDirection,
  directionAwareComparators
} from "../types/SortDirection";

function getCpuUsage(node: Node) {
  return node.getUsageStats("cpus").percentage;
}

function getHostName(node: Node) {
  return node.getHostName().toLowerCase();
}

export function cpuRenderer(data: Node): React.ReactNode {
  return (
    <TextCell>
      <span>{getCpuUsage(data)}%</span>
    </TextCell>
  );
}

export function cpuSorter(data: Node[], sortDirection: SortDirection): Node[] {
  return sort(
    directionAwareComparators(
      [compareNumber(getCpuUsage), compareString(getHostName)],
      sortDirection
    ),
    data
  );
}

export function cpuSizer(args: WidthArgs): number {
  // TODO: DCOS-39147
  return Math.min(60, Math.max(60, args.width / args.totalColumns));
}
