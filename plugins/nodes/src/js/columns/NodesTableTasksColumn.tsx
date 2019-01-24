import * as React from "react";
import sort from "array-sort";
import { NumberCell } from "@dcos/ui-kit";

import Node from "#SRC/js/structs/Node";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";

export function tasksRenderer(data: Node): React.ReactNode {
  return (
    <NumberCell>
      <span>{(data.get("TASK_RUNNING") || "0").toString()}</span>
    </NumberCell>
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
