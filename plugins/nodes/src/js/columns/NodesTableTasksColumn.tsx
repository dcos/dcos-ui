import * as React from "react";
import { NumberCell } from "@dcos/ui-kit";

import Node from "#SRC/js/structs/Node";

const NodeTasks = React.memo(({ tasks }: { tasks: string }) => (
  <NumberCell>
    <span>{tasks}</span>
  </NumberCell>
));

export function tasksRenderer(data: Node): React.ReactNode {
  return <NodeTasks tasks={(data.get("TASK_RUNNING") || "0").toString()} />;
}

export function getTasks(node: Node): number {
  return node.get("TASK_RUNNING");
}
