import * as React from "react";
import { compareValues } from "#PLUGINS/nodes/src/js/utils/compareValues";
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

export function tasksSorter(
  data: Node[],
  sortDirection: SortDirection
): Node[] {
  // current implementation is a rough idea, not sure if it is the best one…
  const sortedData = data.sort((a, b) =>
    compareValues(
      a.get("TASK_RUNNING").toString(),
      b.get("TASK_RUNNING").toString(),
      a.getHostName().toLowerCase(),
      b.getHostName().toLowerCase()
    )
  );
  return sortDirection === "ASC" ? sortedData : sortedData.reverse();
}

export function tasksSizer(_args: WidthArgs): number {
  return 80;
}
