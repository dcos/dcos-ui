import { i18nMark } from "@lingui/react";

interface ServiceStatusLabelsInterface {
  RUNNING: string;
  DEPLOYING: string;
  STOPPED: string;
  NA: string;
  DELAYED: string;
  WAITING: string;
  DELETING: string;
  RECOVERING: string;
}

const ServiceStatusLabels: ServiceStatusLabelsInterface = {
  RUNNING: i18nMark("Running"),
  DEPLOYING: i18nMark("Deploying"),
  STOPPED: i18nMark("Stopped"),
  NA: i18nMark("N/A"),
  DELAYED: i18nMark("Delayed"),
  WAITING: i18nMark("Waiting"),
  DELETING: i18nMark("Deleting"),
  RECOVERING: i18nMark("Recovering")
};

export default ServiceStatusLabels;
