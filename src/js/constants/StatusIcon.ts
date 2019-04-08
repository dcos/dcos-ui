import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import * as Color from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { i18nMark } from "@lingui/react";

export type StatusCategories =
  | "SUCCESS"
  | "LOADING"
  | "STOPPED"
  | "WARNING"
  | "ERROR"
  | "NA";

type StatusIcon = {
  shape: SystemIcons;
  color: string;
  category: StatusCategories;
};

const SUCCESS: StatusIcon = {
  shape: SystemIcons.CircleCheck,
  color: Color.green,
  category: "SUCCESS"
};
const LOADING: StatusIcon = {
  shape: SystemIcons.Spinner,
  color: Color.greyDark,
  category: "LOADING"
};
const STOPPED: StatusIcon = {
  shape: SystemIcons.CircleMinus,
  color: Color.greyLightDarken1,
  category: "STOPPED"
};
const WARNING: StatusIcon = {
  shape: SystemIcons.Yield,
  color: Color.yellow,
  category: "WARNING"
};
const ERROR: StatusIcon = {
  shape: SystemIcons.CircleClose,
  color: Color.red,
  category: "ERROR"
};

export const StatusCategoryPriority: Record<StatusCategories, number> = {
  NA: -1,
  STOPPED: 0,
  SUCCESS: 1,
  LOADING: 2,
  WARNING: 3,
  ERROR: 4
};

export const StatusCategoryText: Record<StatusCategories, string> = {
  NA: i18nMark("N/A"),
  STOPPED: i18nMark("Stopped"),
  SUCCESS: i18nMark("Running"),
  LOADING: i18nMark("Processing"),
  WARNING: i18nMark("Warning"),
  ERROR: i18nMark("Error")
};

const StatusIcon = { SUCCESS, LOADING, STOPPED, WARNING, ERROR };

export default StatusIcon;
