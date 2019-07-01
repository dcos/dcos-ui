import { i18nMark } from "@lingui/react";
import StatusIcon from "#SRC/js/constants/StatusIcon";

export type Status = {
  displayName: string;
  icon: StatusIcon;
  priority: number;
};

const Status = (priority: number, icon: StatusIcon, name: string): Status => ({
  priority,
  icon,
  displayName: i18nMark(name)
});

export const active = Status(2, StatusIcon.SUCCESS, "Active");
export const deactivated = Status(3, StatusIcon.STOPPED, "Deactivated");
export const drained = Status(5, StatusIcon.STOPPED, "Drained");
export const draining = Status(4, StatusIcon.LOADING, "Draining");
export const unknown = Status(1, StatusIcon.ERROR, "Unknown");
