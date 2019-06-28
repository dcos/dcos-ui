import * as React from "react";
import { Trans } from "@lingui/macro";
import { Cell, Tooltip } from "@dcos/ui-kit";

import { ServiceGroup } from "#PLUGINS/services/src/js/types/ServiceGroup";
import ProgressBar from "#SRC/js/components/ProgressBar";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

const className = `color-${ResourcesUtil.getResourceColor("cpus")}`;

interface Quota {
  guarantee: number;
  limit: number;
  consumed: number;
}

function getCPUConsumedPercent(cpuQuota: Quota) {
  return (cpuQuota.consumed / cpuQuota.limit) * 100;
}

function getCPUConsumedText(cpuQuota: Quota) {
  return (
    <Trans render="span">
      {cpuQuota.consumed} of {cpuQuota.limit} Cores
    </Trans>
  );
}

function noLimit() {
  return <Trans>No Limit</Trans>;
}

export function cpuRenderer(group: ServiceGroup) {
  const cpuQuota: Quota | undefined = findNestedPropertyInObject(
    group.quota,
    "cpus"
  );
  return (
    <Cell>
      {cpuQuota && cpuQuota.limit ? (
        <div>
          <ProgressBar
            data={ProgressBar.getDataFromValue(
              getCPUConsumedPercent(cpuQuota),
              className
            )}
            total={100}
          />
          <div className="table-content-spacing-left">
            <Tooltip
              id="quota-cpu-tooltip"
              trigger={<span>{getCPUConsumedPercent(cpuQuota)}%</span>}
            >
              {getCPUConsumedText(cpuQuota)}
            </Tooltip>
          </div>
        </div>
      ) : (
        <div>{noLimit()}</div>
      )}
    </Cell>
  );
}
