import { i18nMark } from "@lingui/react";

import StatusIcon from "#SRC/js/constants/StatusIcon";

interface Status {
  displayName: string;
  icon: StatusIcon | null;
  priority: number;
}

///////////////////////////////////////////////////////////////////////////////
//                                   ERRORS                                 //
///////////////////////////////////////////////////////////////////////////////

const CREATION_ERROR: Status = {
  priority: 32,
  displayName: i18nMark("Error Creating Service"),
  icon: StatusIcon.ERROR
};
const UNAVAILABLE = {
  priority: 31,
  displayName: i18nMark("Service Unavailable"),
  icon: StatusIcon.ERROR
};
const ERROR = {
  priority: 30,
  displayName: i18nMark("Error"),
  icon: StatusIcon.ERROR
};

///////////////////////////////////////////////////////////////////////////////
//                                 WARNINGS                                  //
///////////////////////////////////////////////////////////////////////////////

const DEGRADED: Status = {
  priority: 25,
  displayName: i18nMark("Degraded"),
  icon: StatusIcon.WARNING
};
const DEGRADED_AWAITING_RESOURCES: Status = {
  priority: 24,
  displayName: i18nMark("Degraded (Awaiting Resources)"),
  icon: StatusIcon.WARNING
};
const DEGRADED_RECOVERING: Status = {
  priority: 23,
  displayName: i18nMark("Degraded (Recovering)"),
  icon: StatusIcon.WARNING
};
const DEPLOYING_AWAITING_RESOURCES: Status = {
  priority: 22,
  displayName: i18nMark("Deploying (Awaiting Resources)"),
  icon: StatusIcon.WARNING
};
const DELAYED: Status = {
  priority: 21,
  displayName: i18nMark("Delayed"),
  icon: StatusIcon.WARNING
};
const WARNING: Status = {
  priority: 20,
  displayName: i18nMark("Warning"),
  icon: StatusIcon.WARNING
};

///////////////////////////////////////////////////////////////////////////////
//                                PROCESSING                                 //
///////////////////////////////////////////////////////////////////////////////

const RESTORING: Status = {
  priority: 17,
  displayName: i18nMark("Restoring"),
  icon: StatusIcon.LOADING
};
const RECOVERING: Status = {
  priority: 16,
  displayName: i18nMark("Recovering"),
  icon: StatusIcon.LOADING
};
const UPGRADE_DOWNGRADE_ROLLBACK: Status = {
  priority: 15,
  displayName: i18nMark("Upgrade / Rollback / Downgrade"),
  icon: StatusIcon.LOADING
};
const DEPLOYING: Status = {
  priority: 14,
  displayName: i18nMark("Deploying"),
  icon: StatusIcon.LOADING
};
const BACKING_UP: Status = {
  priority: 13,
  displayName: i18nMark("Backing up"),
  icon: StatusIcon.LOADING
};
const DELETING: Status = {
  priority: 12,
  displayName: i18nMark("Deleting"),
  icon: StatusIcon.LOADING
};
const INITIALIZING: Status = {
  priority: 11,
  displayName: i18nMark("Initializing"),
  icon: StatusIcon.LOADING
};
const WAITING: Status = {
  priority: 10,
  displayName: i18nMark("Waiting"),
  icon: StatusIcon.LOADING
};

///////////////////////////////////////////////////////////////////////////////
//                                 RUNNING                                   //
///////////////////////////////////////////////////////////////////////////////

const STOPPED: Status = {
  priority: 2,
  displayName: i18nMark("Stopped"),
  icon: StatusIcon.STOPPED
};
const RUNNING: Status = {
  priority: 1,
  displayName: i18nMark("Running"),
  icon: StatusIcon.SUCCESS
};
const NA: Status = {
  priority: 0,
  displayName: i18nMark("N/A"),
  icon: null
};

///////////////////////////////////////////////////////////////////////////////
//                                  HELPERS                                  //
///////////////////////////////////////////////////////////////////////////////

function fromHttpCode(code: number): Status | null {
  const map: Record<number, Status> = {
    200: RUNNING,
    202: DEPLOYING,
    203: DEGRADED_AWAITING_RESOURCES,
    204: DEPLOYING_AWAITING_RESOURCES,
    205: DEGRADED_RECOVERING,
    206: DEGRADED,
    418: INITIALIZING,
    420: BACKING_UP,
    421: RESTORING,
    426: UPGRADE_DOWNGRADE_ROLLBACK,
    500: CREATION_ERROR,
    503: UNAVAILABLE
  };
  return map[code];
}

export {
  Status,
  fromHttpCode,
  BACKING_UP,
  CREATION_ERROR,
  DEGRADED,
  DEGRADED_AWAITING_RESOURCES,
  DEGRADED_RECOVERING,
  DELAYED,
  DELETING,
  DEPLOYING,
  DEPLOYING_AWAITING_RESOURCES,
  ERROR,
  INITIALIZING,
  NA,
  RECOVERING,
  RESTORING,
  RUNNING,
  STOPPED,
  UNAVAILABLE,
  UPGRADE_DOWNGRADE_ROLLBACK,
  WAITING,
  WARNING
};
