import { i18nMark } from "@lingui/react";
import StatusIcon from "#SRC/js/constants/StatusIcon";
import Node from "#SRC/js/structs/Node";

const build = (priority: number, icon: StatusIcon, name: string): Status => ({
  priority,
  icon,
  displayName: i18nMark(name)
});

const active = build(2, StatusIcon.SUCCESS, "Active");
const deactivated = build(3, StatusIcon.STOPPED, "Deactivated");
const drained = build(5, StatusIcon.STOPPED, "Drained");
const draining = build(4, StatusIcon.LOADING, "Draining");
const unknown = build(1, StatusIcon.ERROR, "Unknown");

const fromNode = (n: Node) => {
  if (!n.isDeactivated()) {
    return active;
  }

  const info = n.getDrainInfo();
  if (info === undefined) {
    return deactivated;
  }

  switch (info.state) {
    case "DRAINING":
      return draining;
    case "DRAINED":
      return drained;
    case "UNKNOWN":
      return unknown;
  }
};

export type Status = {
  displayName: string;
  icon: StatusIcon;
  priority: number;
};

export const Status = {
  fromNode
};
