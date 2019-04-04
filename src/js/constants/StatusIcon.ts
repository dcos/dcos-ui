import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import * as Color from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

type StatusIcon = {
  shape: SystemIcons;
  color: string;
  name: string;
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

const StatusIcon = { SUCCESS, LOADING, STOPPED, WARNING, ERROR };

export default StatusIcon;
