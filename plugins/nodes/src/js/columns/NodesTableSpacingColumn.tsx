import * as React from "react";
import Node from "#SRC/js/structs/Node";

// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "#PLUGINS/nodes/src/js/types/IWidthArgs";

export function spacingRenderer(_data: Node): React.ReactNode {
  return null;
}

export function spacingSizer(args: WidthArgs): number {
  // TODO: DCOS-39147
  return args.remainingWidth;
}
