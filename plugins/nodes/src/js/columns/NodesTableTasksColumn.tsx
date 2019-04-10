import * as React from "react";
import sort from "array-sort";
import { NumberCell } from "@dcos/ui-kit";
import { WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";

import Node from "#SRC/js/structs/Node";
import TableColumnResizeStore from "#SRC/js/stores/TableColumnResizeStore";
import { columnWidthsStorageKey } from "../components/NodesTable";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";

const NodeTasks = React.memo(({ tasks }: { tasks: string }) => (
  <NumberCell>
    <span>{tasks}</span>
  </NumberCell>
));

export function tasksRenderer(data: Node): React.ReactNode {
  return <NodeTasks tasks={(data.get("TASK_RUNNING") || "0").toString()} />;
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

export function tasksWidth(_: WidthArgs) {
  return TableColumnResizeStore.get(columnWidthsStorageKey).tasks;
}
