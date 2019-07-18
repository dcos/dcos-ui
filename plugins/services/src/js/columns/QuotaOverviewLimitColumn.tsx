import { ServiceGroup } from "#PLUGINS/services/src/js/types/ServiceGroup";
import { Icon, TextCell, Tooltip } from "@dcos/ui-kit";
import {
  greyLight,
  blue,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import * as React from "react";
import { Trans, Plural } from "@lingui/macro";

export function limitRenderer(group: ServiceGroup) {
  const limit = group.quota ? group.quota.limitStatus : "N/A";
  const roles =
    group.quota && group.quota.serviceRoles
      ? group.quota.serviceRoles.count
      : 0;
  const groupRoles =
    group.quota && group.quota.serviceRoles
      ? group.quota.serviceRoles.groupRoleCount
      : 0;
  const limitNumber = roles - groupRoles;

  let icon = null;
  switch (limit) {
    case "Enforced":
      icon = (
        <div className="table-content-spacing-right table-content-inline-block">
          <Icon
            color={blue}
            shape={SystemIcons.CircleCheck}
            size={iconSizeXs}
          />
        </div>
      );
      break;
    case "Partially Enforced":
      icon = (
        <div className="table-content-spacing-right table-content-inline-block">
          <Tooltip
            id="quota-limit-tooltip"
            trigger={
              <Icon
                color={greyLight}
                shape={SystemIcons.CircleMinus}
                size={iconSizeXs}
              />
            }
          >
            <Plural
              value={limitNumber}
              one="# service has no quota limit."
              other="# services have no quota limit."
            />
          </Tooltip>
        </div>
      );
      break;
    case "Not Enforced":
      icon = (
        <div className="table-content-spacing-right table-content-inline-block">
          <Icon
            color={greyLight}
            shape={SystemIcons.CircleMinus}
            size={iconSizeXs}
          />
        </div>
      );
      break;
    case "N/A":
      icon = (
        <div className="table-content-spacing-right table-content-inline-block">
          <Icon
            color={greyLight}
            shape={SystemIcons.CircleMinus}
            size={iconSizeXs}
          />
        </div>
      );
      break;
  }

  return (
    <TextCell>
      <div className="service-table-heading flex-box flex-box-align-vertical-center table-cell-flex-box text-overflow">
        <span className="icon-margin-right">{icon}</span>
        <Trans
          id={limit}
          render="span"
          className="table-cell-value table-cell-flex-box"
        />
      </div>
    </TextCell>
  );
}
