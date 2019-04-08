import { i18nMark } from "@lingui/react";

import StatusIcon from "#SRC/js/constants/StatusIcon";

enum StatusCategory {
  NA = "NA",
  STOPPED = "STOPPED",
  RUNNING = "RUNNING",
  LOADING = "LOADING",
  WARNING = "WARNING",
  ERROR = "ERROR"
}

interface Status {
  displayName: string;
  category: StatusCategory;
  priority: number;
}

///////////////////////////////////////////////////////////////////////////////
//                                   ERRORS                                 //
///////////////////////////////////////////////////////////////////////////////

const CREATION_ERROR: Status = {
  priority: 32,
  displayName: i18nMark("Error Creating Service"),
  category: StatusCategory.ERROR
};
const UNAVAILABLE = {
  priority: 31,
  displayName: i18nMark("Service Unavailable"),
  category: StatusCategory.ERROR
};
const ERROR = {
  priority: 30,
  displayName: i18nMark("Error"),
  category: StatusCategory.ERROR
};

///////////////////////////////////////////////////////////////////////////////
//                                 WARNINGS                                  //
///////////////////////////////////////////////////////////////////////////////

const DEGRADED: Status = {
  priority: 25,
  displayName: i18nMark("Degraded"),
  category: StatusCategory.WARNING
};
const DEGRADED_AWAITING_RESOURCES: Status = {
  priority: 24,
  displayName: i18nMark("Degraded (Awaiting Resources)"),
  category: StatusCategory.WARNING
};
const DEGRADED_RECOVERING: Status = {
  priority: 23,
  displayName: i18nMark("Degraded (Recovering)"),
  category: StatusCategory.WARNING
};
const DEPLOYING_AWAITING_RESOURCES: Status = {
  priority: 22,
  displayName: i18nMark("Deploying (Awaiting Resources)"),
  category: StatusCategory.WARNING
};
const DELAYED: Status = {
  priority: 21,
  displayName: i18nMark("Delayed"),
  category: StatusCategory.WARNING
};
const WARNING: Status = {
  priority: 20,
  displayName: i18nMark("Warning"),
  category: StatusCategory.WARNING
};

///////////////////////////////////////////////////////////////////////////////
//                                PROCESSING                                 //
///////////////////////////////////////////////////////////////////////////////

const RESTORING: Status = {
  priority: 17,
  displayName: i18nMark("Restoring"),
  category: StatusCategory.LOADING
};
const RECOVERING: Status = {
  priority: 16,
  displayName: i18nMark("Recovering"),
  category: StatusCategory.LOADING
};
const UPGRADE_DOWNGRADE_ROLLBACK: Status = {
  priority: 15,
  displayName: i18nMark("Upgrade / Rollback / Downgrade"),
  category: StatusCategory.LOADING
};
const DEPLOYING: Status = {
  priority: 14,
  displayName: i18nMark("Deploying"),
  category: StatusCategory.LOADING
};
const BACKING_UP: Status = {
  priority: 13,
  displayName: i18nMark("Backing up"),
  category: StatusCategory.LOADING
};
const DELETING: Status = {
  priority: 12,
  displayName: i18nMark("Deleting"),
  category: StatusCategory.LOADING
};
const INITIALIZING: Status = {
  priority: 11,
  displayName: i18nMark("Initializing"),
  category: StatusCategory.LOADING
};
const WAITING: Status = {
  priority: 10,
  displayName: i18nMark("Waiting"),
  category: StatusCategory.LOADING
};

///////////////////////////////////////////////////////////////////////////////
//                                 RUNNING                                   //
///////////////////////////////////////////////////////////////////////////////

const STOPPED: Status = {
  priority: 2,
  displayName: i18nMark("Stopped"),
  category: StatusCategory.STOPPED
};
const RUNNING: Status = {
  priority: 1,
  displayName: i18nMark("Running"),
  category: StatusCategory.RUNNING
};
const NA: Status = {
  priority: 0,
  displayName: i18nMark("N/A"),
  category: StatusCategory.NA
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

function showProgressBar(status: Status): boolean {
  return [DEPLOYING, WAITING, DELAYED, RECOVERING, DELETING].includes(status);
}

function toIcon(status: Status | null): StatusIcon | null {
  if (status === null) {
    return null;
  }
  switch (status.category) {
    case StatusCategory.NA:
      return null;
    case StatusCategory.STOPPED:
      return StatusIcon.STOPPED;
    case StatusCategory.RUNNING:
      return StatusIcon.SUCCESS;
    case StatusCategory.LOADING:
      return StatusIcon.LOADING;
    case StatusCategory.WARNING:
      return StatusIcon.WARNING;
    case StatusCategory.ERROR:
      return StatusIcon.ERROR;
  }
  return null;
}

function toCategoryPriority(category: StatusCategory): number {
  switch (category) {
    case StatusCategory.STOPPED:
      return 0;
    case StatusCategory.RUNNING:
      return 1;
    case StatusCategory.LOADING:
      return 2;
    case StatusCategory.WARNING:
      return 3;
    case StatusCategory.ERROR:
      return 4;
  }
  return -1;
}
function toCategoryLabel(category: StatusCategory): string {
  switch (category) {
    case StatusCategory.STOPPED:
      return i18nMark("Stopped");
    case StatusCategory.RUNNING:
      return i18nMark("Running");
    case StatusCategory.LOADING:
      return i18nMark("Processing");
    case StatusCategory.WARNING:
      return i18nMark("Warning");
    case StatusCategory.ERROR:
      return i18nMark("Error");
  }
  return i18nMark("N/A");
}

export {
  Status,
  fromHttpCode,
  toIcon,
  toCategoryPriority,
  toCategoryLabel,
  showProgressBar,
  StatusCategory,
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
