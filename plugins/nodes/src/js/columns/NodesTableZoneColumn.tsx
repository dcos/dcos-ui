import * as React from "react";
import { compareValues } from "#PLUGINS/nodes/src/js/utils/compareValues";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";

export function zoneRenderer(data: Node): React.ReactNode {
  // TODO: DCOS-38820
  return <span>{data.getZoneName().toString()}</span>;
}
export function zoneSorter(data: Node[], sortDirection: SortDirection): Node[] {
  // TODO: DCOS-38820
  // current implementation is a rough idea, not sure if it is the best one…
  const sortedData = data.sort((a, b) =>
    compareValues(
      a.getZoneName().toLowerCase(),
      b.getZoneName().toLowerCase(),
      a.getHostName().toLowerCase(),
      b.getHostName().toLowerCase()
    )
  );
  return sortDirection === "ASC" ? sortedData : sortedData.reverse();
}
export function zoneSizer(args: WidthArgs): number {
  // TODO: DCOS-38820
  return Math.max(100, args.width / args.totalColumns);
}
