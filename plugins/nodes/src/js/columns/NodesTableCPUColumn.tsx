import * as React from "react";
import { compareNumber, compareString } from "@dcos/sorting";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "../types/IWidthArgs";
import { TextCell } from "@dcos/ui-kit";

function getCpuUsage(node: Node) {
  return node.getUsageStats("cpus").percentage;
}

function getHostName(node: Node) {
  return node.getHostName().toLowerCase();
}

export function cpuRenderer(data: Node): React.ReactNode {
  return (
    <TextCell>
      <span>{getCpuUsage(data)}%</span>
    </TextCell>
  );
}
export const comparators = [
  compareNumber(getCpuUsage),
  compareString(getHostName)
];
export function cpuSizer(args: WidthArgs): number {
  // TODO: DCOS-39147
  return Math.min(60, Math.max(60, args.width / args.totalColumns));
}
