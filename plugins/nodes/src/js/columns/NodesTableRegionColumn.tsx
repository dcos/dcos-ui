import * as React from "react";
import { compareValues } from "#PLUGINS/nodes/src/js/utils/compareValues";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import { TextCell } from "@dcos/ui-kit";

export function regionRenderer(
  masterRegion: string,
  data: Node
): React.ReactNode {
  const regionName =
    data.getRegionName() +
    (masterRegion === data.getRegionName() ? " (Local)" : "");

  return (
    <TextCell>
      <span title={regionName}>{regionName}</span>
    </TextCell>
  );
}

export function regionSorter(
  data: Node[],
  sortDirection: SortDirection
): Node[] {
  const sortedData = data.sort((a, b) =>
    compareValues(
      a.getRegionName().toLowerCase(),
      b.getRegionName().toLowerCase(),
      a.getHostName().toLowerCase(),
      b.getHostName().toLowerCase()
    )
  );
  return sortDirection === "ASC" ? sortedData : sortedData.reverse();
}

export function regionSizer(_args: WidthArgs): number {
  return 200;
}
