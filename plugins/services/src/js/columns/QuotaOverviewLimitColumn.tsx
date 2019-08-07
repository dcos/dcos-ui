import * as React from "react";
import { Trans, Plural } from "@lingui/macro";
import { Icon, TextCell, Tooltip } from "@dcos/ui-kit";
import {
  greyLight,
  blue,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";

import {
  ServiceGroup,
  QuotaLimitStatuses
} from "#PLUGINS/services/src/js/types/ServiceGroup";

import { getQuotaLimit } from "../utils/QuotaUtil";

import ServiceTree from "../structs/ServiceTree";
import Service from "../structs/Service";

function getLimit(limit: string, limitNumber: number) {
  let icon = null;
  switch (limit) {
    case QuotaLimitStatuses.enforced:
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
    case QuotaLimitStatuses.partiallyEnforced:
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
    case QuotaLimitStatuses.notEnforced:
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
    case QuotaLimitStatuses.na:
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

function itemIsServiceGroup(item: any): item is ServiceGroup {
  return item.quota && item.quota.limitStatus;
}

function getLimitAndLimitNumber(
  servicesCount: number,
  groupRoleCount: number
): [string, number] {
  return [
    getQuotaLimit({
      count: servicesCount,
      groupRoleCount
    }),
    servicesCount - groupRoleCount
  ];
}

export function limitRenderer(item: ServiceGroup | ServiceTree | Service) {
  var limit: string = "N/A";
  var limitNumber: number = 0;

  if (itemIsServiceGroup(item)) {
    if (!item.quota || !item.quota.serviceRoles) {
      return <React.Fragment />;
    }

    [limit, limitNumber] = getLimitAndLimitNumber(
      item.quota.serviceRoles.count,
      item.quota.serviceRoles.groupRoleCount
    );
  } else {
    const groupName =
      item instanceof ServiceTree ? item.getName() : item.getRole();
    const roleLength = item.getRoleLength(groupName);

    [limit, limitNumber] = getLimitAndLimitNumber(
      roleLength.servicesCount,
      roleLength.groupRolesCount
    );
  }

  return getLimit(limit, limitNumber);
}
