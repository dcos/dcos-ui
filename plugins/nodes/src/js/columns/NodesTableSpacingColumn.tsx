import * as React from "react";
import { WidthArgs } from "@dcos/ui-kit/dist/packages/table/components/Column";

import Node from "#SRC/js/structs/Node";

export function spacingRenderer(_data: Node): React.ReactNode {
  return null;
}

export function spacingSizer(args: WidthArgs): number {
  return Math.max(0, args.remainingWidth);
}
