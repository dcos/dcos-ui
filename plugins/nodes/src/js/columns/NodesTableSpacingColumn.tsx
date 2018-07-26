import * as React from "react";
import Node from "#SRC/js/structs/Node";

import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";

export function spacingRenderer(_data: Node): React.ReactNode {
  return null;
}

export function spacingSizer(args: WidthArgs): number {
  // TODO: DCOS-39147
  return Math.max(0, args.remainingWidth);
}
