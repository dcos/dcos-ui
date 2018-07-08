import * as React from "react";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";

export function membarRenderer(data: Node): React.ReactNode {
  // TODO: DCOS-38823
  return <span>{data.get("used_resources").mem.toString()}</span>;
}
export function membarSizer(args: WidthArgs): number {
  // TODO: DCOS-38823
  return Math.max(100, args.width / args.totalColumns);
}
