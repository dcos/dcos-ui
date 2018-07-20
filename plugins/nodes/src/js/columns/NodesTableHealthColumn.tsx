import * as React from "react";
import { sort } from "@dcos/sorting";
import UnitHealthUtil from "#SRC/js/utils/UnitHealthUtil";
import Node from "#SRC/js/structs/Node";
// TODO: DCOS-39079
// import { IWidthArgs as WidthArgs } from "@dcos/ui-kit/packages/table/components/Column";
import { IWidthArgs as WidthArgs } from "../types/IWidthArgs";
import {
  SortDirection,
  directionAwareComparators
} from "../types/SortDirection";
import { TextCell } from "@dcos/ui-kit";

export function healthRenderer(data: Node): React.ReactNode {
  const health = data.getHealth();
  return (
    <TextCell>
      <span className={health.classNames}>{health.title}</span>
    </TextCell>
  );
}

export const comparators = [UnitHealthUtil.getHealthSortFunction];
export function healthSorter(
  data: Node[],
  sortDirection: SortDirection
): Node[] {
  return sort(directionAwareComparators(comparators, sortDirection), data);
}

export function healthSizer(args: WidthArgs): number {
  // TODO: DCOS-38827
  return Math.max(100, args.width / args.totalColumns);
}
