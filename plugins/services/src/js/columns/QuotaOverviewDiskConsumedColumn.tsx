import * as React from "react";
import { Trans } from "@lingui/macro";
import { Cell, Tooltip } from "@dcos/ui-kit";

import {
  ServiceGroup,
  QuotaResources
} from "#PLUGINS/services/src/js/types/ServiceGroup";
import ProgressBar from "#SRC/js/components/ProgressBar";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

const className = `color-${ResourcesUtil.getResourceColor("disk")}`;

function getDiskConsumedPercent(diskQuota: QuotaResources) {
  if (!diskQuota.consumed || !diskQuota.limit) {
    return 0;
  }
  return (diskQuota.consumed / diskQuota.limit) * 100;
}

function getDiskConsumedText(diskQuota: QuotaResources) {
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
  const diskQuota: QuotaResources | undefined = findNestedPropertyInObject(
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
