import DateUtil from "../../../../../src/js/utils/DateUtil";
import ServiceStatusWarning from "./ServiceStatusWarning";

class ServiceStatusWarningWithDebugInstruction extends ServiceStatusWarning {
  getTooltipContent(timeWaiting) {
    const additionalCopy = " See more information in the debug tab.";

    return `DC/OS has been waiting for resources and is unable to complete this deployment for ${DateUtil.getDuration(timeWaiting, null)}.${additionalCopy}`;
  }
}

module.exports = ServiceStatusWarningWithDebugInstruction;
