import * as React from "react";
import { compareValues } from "#PLUGINS/nodes/src/js/utils/compareValues";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";

export function healthRenderer(data: Node): React.ReactNode {
  // TODO: DCOS-38827
  return <span>{data.getHealth().title.toString()}</span>;
}
export function healthSorter(
  data: Node[],
  sortDirection: SortDirection
): Node[] {
  // TODO: DCOS-38827
  // current implementation is a rough idea, not sure if it is the best one…
  const sortedData = data.sort((a, b) =>
    compareValues(
      a.getHealth().title.toLowerCase(),
      b.getHealth().title.toLowerCase(),
      a.getHostName().toLowerCase(),
      b.getHostName().toLowerCase()
    )
  );
  return sortDirection === "ASC" ? sortedData : sortedData.reverse();
}
export function healthSizer(args: WidthArgs): number {
  // TODO: DCOS-38827
  return Math.max(100, args.width / args.totalColumns);
}
