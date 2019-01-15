import * as React from "react";
import sort from "array-sort";
import { Cell } from "@dcos/ui-kit";

import Node from "#SRC/js/structs/Node";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import { SortDirection } from "plugins/nodes/src/js/types/SortDirection";
import ProgressBar from "#SRC/js/components/ProgressBar";

function getMemUsage(data: Node): number {
  return data.getUsageStats("mem").percentage;
}

export function memRenderer(data: Node): React.ReactNode {
  return (
    <Cell>
      <div>
        <ProgressBar
          data={[
            {
              value: data.getUsageStats("mem").percentage,
              className: `color-${ResourcesUtil.getResourceColor("mem")}`
            }
          ]}
          total={100}
        />

        <span className="table-content-spacing-left">{getMemUsage(data)}%</span>
      </div>
    </Cell>
  );
}

function compareNodesByMemUsage(a: Node, b: Node): number {
  return getMemUsage(a) - getMemUsage(b);
}

function compareNodesByHostname(a: Node, b: Node): number {
  return a
    .getHostName()
    .toLowerCase()
    .localeCompare(b.getHostName().toLowerCase());
}

const comparators = [compareNodesByMemUsage, compareNodesByHostname];
export function memSorter(data: Node[], sortDirection: SortDirection): Node[] {
  const reverse = sortDirection !== "ASC";
  return sort(data, comparators, { reverse });
}
