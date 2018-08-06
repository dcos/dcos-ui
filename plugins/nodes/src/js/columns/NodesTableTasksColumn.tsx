import * as React from "react";
import sort from "array-sort";
import Node from "#SRC/js/structs/Node";
import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import { TextCell } from "@dcos/ui-kit";

export function tasksRenderer(data: Node): React.ReactNode {
  return (
    <TextCell>
      <span>{(data.get("TASK_RUNNING") || "0").toString()}</span>
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

export function tasksSizer(_args: WidthArgs): number {
  return 80;
}
