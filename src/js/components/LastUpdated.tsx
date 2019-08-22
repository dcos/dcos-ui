import React from "react";
import { Trans } from "@lingui/macro";
import { Badge, designTokens as dt, Icon, Legacy } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import DateUtil from "../utils/DateUtil";

const YEAR = 31557600000;
const isOutdated = (lastUpdatedAt: string) =>
  DateUtil.strToMs(lastUpdatedAt) < Date.now() - YEAR;

export const warningIcon = (lastUpdatedAt: string) =>
  isOutdated(lastUpdatedAt) ? (
    <Legacy.Tooltip
      content={
        <Trans render="span">
          This service has not been updated for at least 1 year. We recommend
          you update if possible.
        </Trans>
      }
      data-cy="outdated-warning"
      interactive={true}
      maxWidth={250}
      wrapText={true}
    >
      <Icon color={dt.yellow} shape={SystemIcons.Yield} size={dt.iconSizeXs} />
    </Legacy.Tooltip>
  ) : null;

export const render = (lastUpdatedAt: string) => (
  <span data-cy="last-updated">
    <Trans>Last Updated: {lastUpdatedAt}</Trans>{" "}
    {isOutdated(lastUpdatedAt) ? (
      <span className="badge-outline-warning">
        <Badge appearance="outline">
          <span>
            {warningIcon(lastUpdatedAt)} <Trans id="Outdated Version" />
          </span>
        </Badge>
      </span>
    ) : null}
  </span>
);
