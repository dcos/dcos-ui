import * as React from "react";
import sort from "array-sort";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import { TextCell } from "@dcos/ui-kit";

export function tasksRenderer(data: Node): React.ReactNode {
  return (
    <TextCell>
      <span>{data.get("TASK_RUNNING").toString()}</span>
    </TextCell>
  );
}

function compareNodesByTasks(a: Node, b: Node): number {
  return a.get("TASK_RUNNING") - b.get("TASK_RUNNING");
}

function compareNodesByHostname(a: Node, b: Node): number {
  return a
    .getHostName()
    .toLowerCase()
    .localeCompare(b.getHostName().toLowerCase());
}

const comparators = [compareNodesByTasks, compareNodesByHostname];
export function tasksSorter(
  data: Node[],
  sortDirection: SortDirection
): Node[] {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}

export function tasksSizer(args: WidthArgs): number {
  return Math.max(100, args.width / args.totalColumns);
}
