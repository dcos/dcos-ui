import DateUtil from "#SRC/js/utils/DateUtil";
import ServiceStatusIcon from "./ServiceStatusIcon";

class ServiceStatusWarningWithDebugInstruction extends ServiceStatusIcon {
  getTooltipContent(timeWaiting) {
    const additionalCopy = " See more information in the debug tab.";

    return `DC/OS has been waiting for resources and is unable to complete this deployment for ${DateUtil.getDuration(
      timeWaiting,
      null
    )}.${additionalCopy}`;
  }
}

module.exports = ServiceStatusWarningWithDebugInstruction;
