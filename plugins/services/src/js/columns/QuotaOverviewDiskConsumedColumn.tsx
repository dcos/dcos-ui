import * as React from "react";
import { Trans } from "@lingui/macro";
import { Cell, Tooltip } from "@dcos/ui-kit";

import { ServiceGroup } from "#PLUGINS/services/src/js/types/ServiceGroup";
import ProgressBar from "#SRC/js/components/ProgressBar";
import * as ResourcesUtil from "#SRC/js/utils/ResourcesUtil";

const className = `color-${ResourcesUtil.getResourceColor("disk")}`;

export function diskRenderer(group: ServiceGroup) {
  const quota = ServiceGroup.getQuota(group, "disk");
  return (
    <Cell>
      {quota && quota.limit ? (
        <div>
          <ProgressBar
            data={ProgressBar.getDataFromValue(
              ServiceGroup.getQuotaPercentage(group, "disk"),
              className
            )}
            total={100}
          />
          <div className="table-content-spacing-left">
            <Tooltip
              id="quota-disk-tooltip"
              trigger={
                <span>{ServiceGroup.getQuotaPercentage(group, "disk")}%</span>
              }
            >
              <Trans render="span">
                {quota.consumed} of {quota.limit} MiB
              </Trans>
            </Tooltip>
          </div>
        </div>
      ) : (
        <div>
          <Trans>No Limit</Trans>
        </div>
      )}
    </Cell>
  );
}
