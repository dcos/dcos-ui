import * as React from "react";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";

export function gpubarRenderer(data: Node): React.ReactNode {
  // TODO: DCOS-38825
  return <span>{data.get("used_resources").gpus.toString()}</span>;
}
export function gpubarSizer(args: WidthArgs): number {
  // TODO: DCOS-38825
  return Math.max(100, args.width / args.totalColumns);
}
