import * as React from "react";
import Node from "#SRC/js/structs/Node";

// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";

export function cpubarRenderer(data: Node): React.ReactNode {
  // TODO: DCOS-38822
  return <span>{data.get("used_resources").cpus.toString()}</span>;
}
export function cpubarSizer(args: WidthArgs): number {
  // TODO: DCOS-38822
  return Math.max(100, args.width / args.totalColumns);
}
