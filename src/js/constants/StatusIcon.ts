import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import * as Color from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { i18nMark } from "@lingui/react";

export type StatusIconNames =
  | "SUCCESS"
  | "LOADING"
  | "STOPPED"
  | "WARNING"
  | "ERROR";

type StatusIcon = {
  shape: SystemIcons;
  color: string;
  name: StatusIconNames;
};

const SUCCESS: StatusIcon = {
  shape: SystemIcons.CircleCheck,
  color: Color.green,
  name: "SUCCESS"
};
const LOADING: StatusIcon = {
  shape: SystemIcons.Spinner,
  color: Color.greyDark,
  name: "LOADING"
};
const STOPPED: StatusIcon = {
  shape: SystemIcons.CircleMinus,
  color: Color.greyLightDarken1,
  name: "STOPPED"
};
const WARNING: StatusIcon = {
  shape: SystemIcons.Yield,
  color: Color.yellow,
  name: "WARNING"
};
const ERROR: StatusIcon = {
  shape: SystemIcons.CircleClose,
  color: Color.red,
  name: "ERROR"
};

export const StatusIconPriority: Record<StatusIconNames, number> = {
  STOPPED: 0,
  SUCCESS: 1,
  LOADING: 2,
  WARNING: 3,
  ERROR: 4
};

export const StatusIconText: Record<StatusIconNames, string> = {
  STOPPED: i18nMark("Stopped"),
  SUCCESS: i18nMark("Running"),
  LOADING: i18nMark("Processing"),
  WARNING: i18nMark("Warning"),
  ERROR: i18nMark("Error")
};

const StatusIcon = { SUCCESS, LOADING, STOPPED, WARNING, ERROR };

export default StatusIcon;
