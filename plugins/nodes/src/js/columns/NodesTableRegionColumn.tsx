import * as React from "react";
import { compareValues } from "#PLUGINS/nodes/src/js/utils/compareValues";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";

export function regionRenderer(
  masterRegion: string,
  data: Node
): React.ReactNode {
  const regionName = data.getRegionName();
  return (
    <span title={regionName}>
      {regionName}
      {masterRegion === regionName ? " (Local)" : null}
    </span>
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
export function regionSizer(args: WidthArgs): number {
  return Math.max(170, args.width / args.totalColumns);
}
