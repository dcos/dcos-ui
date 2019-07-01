import * as React from "react";
import { Trans } from "@lingui/macro";
import { Cell, Tooltip } from "@dcos/ui-kit";

import { ServiceGroup } from "#PLUGINS/services/src/js/types/ServiceGroup";
import ProgressBar from "#SRC/js/components/ProgressBar";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

const className = `color-${ResourcesUtil.getResourceColor("disk")}`;

interface Quota {
  guarantee: number;
  limit: number;
  consumed: number;
}

function getDiskConsumedPercent(diskQuota: Quota) {
  return (diskQuota.consumed / diskQuota.limit) * 100;
}

function getDiskConsumedText(diskQuota: Quota) {
  return (
    <Trans render="span">
      {diskQuota.consumed} of {diskQuota.limit} MiB
    </Trans>
  );
}

function noLimit() {
  return <Trans>No Limit</Trans>;
}

export function diskRenderer(group: ServiceGroup) {
  const diskQuota: Quota | undefined = findNestedPropertyInObject(
    group.quota,
    "disk"
  );
  return (
    <Cell>
      {diskQuota && diskQuota.limit ? (
        <div>
          <ProgressBar
            data={ProgressBar.getDataFromValue(
              getDiskConsumedPercent(diskQuota),
              className
            )}
            total={100}
          />
          <div className="table-content-spacing-left">
            <Tooltip
              id="quota-disk-tooltip"
              trigger={<span>{getDiskConsumedPercent(diskQuota)}%</span>}
            >
              {getDiskConsumedText(diskQuota)}
            </Tooltip>
          </div>
        </div>
      ) : (
        <div>{noLimit()}</div>
      )}
    </Cell>
  );
}
