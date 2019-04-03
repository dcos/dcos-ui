import { i18nMark } from "@lingui/react";

import StatusIcon from "#SRC/js/constants/StatusIcon";

interface Status {
  key: number;
  displayName: string;
  icon: StatusIcon;
}

const Status = (
  key: number,
  displayName: string,
  icon: StatusIcon
): Status => ({ key, displayName, icon });

const ServiceStatus = {
  DELAYED: Status(7, i18nMark("Delayed"), StatusIcon.WARNING),
  DELETING: Status(6, i18nMark("Deleting"), StatusIcon.LOADING),
  DEPLOYING: Status(3, i18nMark("Deploying"), StatusIcon.LOADING),
  NA: Status(0, i18nMark("N/A"), StatusIcon.LOADING),
  RECOVERING: Status(5, i18nMark("Recovering"), StatusIcon.LOADING),
  RUNNING: Status(2, i18nMark("Running"), StatusIcon.SUCCESS),
  STOPPED: Status(1, i18nMark("Stopped"), StatusIcon.STOPPED),
  WAITING: Status(4, i18nMark("Waiting"), StatusIcon.LOADING),
  WARNING: Status(8, i18nMark("Warning"), StatusIcon.WARNING),
  ERROR: Status(9, i18nMark("Error"), StatusIcon.ERROR)
};

export { ServiceStatus as default, Status };
