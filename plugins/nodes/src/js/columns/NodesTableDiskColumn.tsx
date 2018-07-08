import * as React from "react";
import { compareValues } from "#PLUGINS/nodes/src/js/utils/compareValues";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";

export function diskRenderer(data: Node): React.ReactNode {
  // TODO: DCOS-38824
  return <span>{data.get("used_resources").disk.toString()}</span>;
}
export function diskSorter(data: Node[], sortDirection: SortDirection): Node[] {
  // TODO: DCOS-38824
  // current implementation is a rough idea, not sure if it is the best one…
  const sortedData = data.sort((a, b) =>
    compareValues(
      a.get("used_resources").disk.toString(),
      b.get("used_resources").disk.toString(),
      a.getHostName().toLowerCase(),
      b.getHostName().toLowerCase()
    )
  );
  return sortDirection === "ASC" ? sortedData : sortedData.reverse();
}
export function diskSizer(args: WidthArgs): number {
  // TODO: DCOS-38824
  return Math.max(100, args.width / args.totalColumns);
}
