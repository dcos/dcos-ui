import * as React from "react";
import { TextCell } from "@dcos/ui-kit";

import Node from "#SRC/js/structs/Node";

const NodeRegion = React.memo(({ regionName }: { regionName: string }) => (
  <TextCell>
    <span title={regionName}>{regionName}</span>
  </TextCell>
));

export function regionRenderer(
  masterRegion: string,
  data: Node
): React.ReactNode {
  const regionName =
    data.getRegionName() +
    (masterRegion === data.getRegionName() && masterRegion !== "N/A"
      ? " (Local)"
      : "");

  return <NodeRegion regionName={regionName} />;
}

export function compareByRegion(a: Node, b: Node): number {
  return a
    .getRegionName()
    .toLowerCase()
    .localeCompare(b.getRegionName().toLowerCase());
}
