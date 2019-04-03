import { i18nMark } from "@lingui/react";

import { Status } from "./ServiceStatus";
import StatusIcon from "#SRC/js/constants/StatusIcon";

// prettier-ignore
const StatusMap: Record<number, Status> = {
  200: Status(1, i18nMark("Running"), StatusIcon.SUCCESS),
  202: Status(2, i18nMark("Deploying"), StatusIcon.LOADING),
  203: Status(4, i18nMark("Degraded (Awaiting Resources)"), StatusIcon.ERROR),
  204: Status(2, i18nMark("Deploying (Awaiting Resources)"), StatusIcon.WARNING),
  205: Status(4, i18nMark("Degraded (Recovering)"), StatusIcon.WARNING),
  206: Status(3, i18nMark("Degraded"), StatusIcon.WARNING),
  418: Status(1, i18nMark("Initializing"), StatusIcon.LOADING),
  420: Status(5, i18nMark("Backing up"), StatusIcon.LOADING),
  421: Status(5, i18nMark("Restoring"), StatusIcon.LOADING),
  426: Status(6, i18nMark("Upgrade / Rollback / Downgrade"), StatusIcon.LOADING),
  500: Status(1, i18nMark("Error Creating Service"), StatusIcon.ERROR),
  503: Status(0, i18nMark("Service Unavailable"), StatusIcon.ERROR)
};

const fromHttpCode = (code: number): Status | null => StatusMap[code];
const toStatusIcon = (status: Status) => status.icon;

export { fromHttpCode, toStatusIcon };
