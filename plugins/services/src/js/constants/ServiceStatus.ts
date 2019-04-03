import { i18nMark } from "@lingui/react";

interface ServiceStatus {
  key: number;
  displayName: string;
}

const Status = (key: number, displayName: string): ServiceStatus => ({
  key,
  displayName
});

const ServiceStatus = {
  DELAYED: Status(7, i18nMark("Delayed")),
  DELETING: Status(6, i18nMark("Deleting")),
  DEPLOYING: Status(3, i18nMark("Deploying")),
  NA: Status(0, i18nMark("N/A")),
  RECOVERING: Status(5, i18nMark("Recovering")),
  RUNNING: Status(2, i18nMark("Running")),
  STOPPED: Status(1, i18nMark("Stopped")),
  WAITING: Status(4, i18nMark("Waiting")),
  WARNING: Status(8, i18nMark("Warning"))
};

export default ServiceStatus;
