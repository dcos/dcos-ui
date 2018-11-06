/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { Trans } from "@lingui/macro";
import DateUtil from "#SRC/js/utils/DateUtil";
import ServiceStatusIcon from "./ServiceStatusIcon";

class ServiceStatusWarningWithDebugInstruction extends ServiceStatusIcon {
  getTooltipContent(timeWaiting) {
    return (
      <Trans render="span">
        DC/OS has been waiting for resources and is unable to complete this
        deployment for {DateUtil.getDuration(timeWaiting, null)}. See more
        information in the debug tab.
      </Trans>
    );
  }
}

module.exports = ServiceStatusWarningWithDebugInstruction;
