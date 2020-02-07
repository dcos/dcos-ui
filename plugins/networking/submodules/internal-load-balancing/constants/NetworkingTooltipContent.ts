import { i18nMark } from "@lingui/react";

const NetworkingTooltipContent = {
  vip: {
    success: i18nMark(
      "Request successes and failures for all connections to this virtual address in the last hour."
    ),
    "connection-latency": i18nMark(
      "Latency distribution (in milliseconds) for all connections to this virtual address in the last hour."
    ),
    "app-reachability": i18nMark(
      "Application Availability and Reachability for all connections to this virtual address in the last hour."
    ),
    "machine-reachability": i18nMark(
      "Machine Availability and Reachability for all connections to this virtual address in the last hour."
    )
  },
  backend: {
    success: i18nMark(
      "Request successes and failures for all connections to virtual addresses redirected to this backend in the last hour."
    ),
    "connection-latency": i18nMark(
      "Latency distribution (in milliseconds) for all connections to virtual addresses redirected to this backend in the last hour."
    )
  }
};

export default NetworkingTooltipContent;
