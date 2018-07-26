import * as React from "react";
import { compareString } from "@dcos/sorting";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "../types/IWidthArgs";
import { TextCell } from "@dcos/ui-kit";

function getZoneName(data: Node): string {
  return data.getZoneName();
}
function getHostname(data: Node): string {
  return data.getHostName();
}
export function zoneRenderer(data: Node): React.ReactNode {
  const zoneName = getZoneName(data);

  return (
    <TextCell>
      <span title={zoneName}>{zoneName}</span>
    </TextCell>
  );
}

export const comparators = [
  compareString(getZoneName),
  compareString(getHostname)
];
export function zoneSizer(args: WidthArgs): number {
  return Math.max(125, args.width / args.totalColumns);
}
