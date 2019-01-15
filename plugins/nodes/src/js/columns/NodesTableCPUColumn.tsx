import * as React from "react";
import sort from "array-sort";
import { Cell } from "@dcos/ui-kit";

import Node from "#SRC/js/structs/Node";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import ProgressBar from "#SRC/js/components/ProgressBar";

function getCpuUsage(data: Node): number {
  return data.getUsageStats("cpus").percentage;
}

export function cpuRenderer(data: Node): React.ReactNode {
  return (
    <Cell>
      <div>
        <ProgressBar
          data={[
            {
              value: data.getUsageStats("cpus").percentage,
              className: `color-${ResourcesUtil.getResourceColor("cpus")}`
            }
          ]}
          total={100}
        />

        <span className="table-content-spacing-left">{getCpuUsage(data)}%</span>
      </div>
    </Cell>
  );
}

function compareNodesByCpuUsage(a: Node, b: Node): number {
  return getCpuUsage(a) - getCpuUsage(b);
}

function compareNodesByHostname(a: Node, b: Node): number {
  return a
    .getHostName()
    .toLowerCase()
    .localeCompare(b.getHostName().toLowerCase());
}

const comparators = [compareNodesByCpuUsage, compareNodesByHostname];
export function cpuSorter(data: Node[], sortDirection: SortDirection): Node[] {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}
