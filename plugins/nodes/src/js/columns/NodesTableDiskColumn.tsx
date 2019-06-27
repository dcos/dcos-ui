import * as React from "react";
import { Cell } from "@dcos/ui-kit";

import Node from "#SRC/js/structs/Node";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import ProgressBar from "#SRC/js/components/ProgressBar";

export function getDiskUsage(data: Node) {
  return data.getUsageStats("disk").percentage;
}

const className = `color-${ResourcesUtil.getResourceColor("disk")}`;

export function diskRenderer(data: Node): React.ReactNode {
  return (
    <Cell>
      <div>
        <ProgressBar
          data={ProgressBar.getDataFromValue(getDiskUsage(data), className)}
          total={100}
        />

        <span className="table-content-spacing-left">
          {getDiskUsage(data)}%
        </span>
      </div>
    </Cell>
  );
}
