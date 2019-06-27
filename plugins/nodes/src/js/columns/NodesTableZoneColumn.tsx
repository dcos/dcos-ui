import * as React from "react";
import { TextCell } from "@dcos/ui-kit";

import Node from "#SRC/js/structs/Node";

const NodeZone = React.memo(({ name }: { name: string }) => (
  <TextCell>
    <span title={name}>{name}</span>
  </TextCell>
));
export function zoneRenderer(data: Node): React.ReactNode {
  return <NodeZone name={data.getZoneName()} />;
}

export function compareByZone(a: Node, b: Node): number {
  return a
    .getZoneName()
    .toLowerCase()
    .localeCompare(b.getZoneName().toLowerCase());
}
