import * as React from "react";
import { compareValues } from "#PLUGINS/nodes/src/js/utils/compareValues";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
import { SortDirection } from "#PLUGINS/nodes/src/js/types/SortDirection";
import { TextCell } from "@dcos/ui-kit/dist/packages";

export function gpuRenderer(data: Node): React.ReactNode {
  return (
    <TextCell>
      <span>{data.getUsageStats("gpus").percentage}%</span>
    </TextCell>
  );
}

export function gpuSorter(data: Node[], sortDirection: SortDirection): Node[] {
  const sortedData = data.sort((a, b) =>
    compareValues(
      a.get("used_resources").gpus.toString(),
      b.get("used_resources").gpus.toString(),
      a.getHostName().toLowerCase(),
      b.getHostName().toLowerCase()
    )
  );
  return sortDirection === "ASC" ? sortedData : sortedData.reverse();
}

export function gpuSizer(_args: WidthArgs): number {
  return 60;
}
