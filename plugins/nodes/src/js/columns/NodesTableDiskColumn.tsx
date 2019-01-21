import * as React from "react";
import sort from "array-sort";
import { Cell } from "@dcos/ui-kit";

import Node from "#SRC/js/structs/Node";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import ProgressBar from "#SRC/js/components/ProgressBar";

function getDiskUsage(data: Node) {
  return data.getUsageStats("disk").percentage;
}

export function diskRenderer(data: Node): React.ReactNode {
  return (
    <Cell>
      <div>
        <ProgressBar
          data={[
            {
              value: data.getUsageStats("disk").percentage,
              className: `color-${ResourcesUtil.getResourceColor("disk")}`
            }
          ]}
          total={100}
        />

        <span className="table-content-spacing-left">
          {getDiskUsage(data)}%
        </span>
      </div>
    </Cell>
  );
}

function compareNodesByDiskUsage(a: Node, b: Node): number {
  return getDiskUsage(a) - getDiskUsage(b);
}

function compareNodesByHostname(a: Node, b: Node): number {
  return a
    .getHostName()
    .toLowerCase()
    .localeCompare(b.getHostName().toLowerCase());
}

const comparators = [compareNodesByDiskUsage, compareNodesByHostname];
export function diskSorter(data: Node[], sortDirection: SortDirection): Node[] {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}
