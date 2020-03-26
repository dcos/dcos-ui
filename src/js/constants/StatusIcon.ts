import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import * as Color from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

interface StatusIcon {
  shape: SystemIcons;
  color: string;
}

const SUCCESS: StatusIcon = {
  shape: SystemIcons.CircleCheck,
  color: Color.green,
};
const LOADING: StatusIcon = {
  shape: SystemIcons.Spinner,
  color: Color.greyDark,
};
const STOPPED: StatusIcon = {
  shape: SystemIcons.CircleMinus,
  color: Color.greyLightDarken1,
};
const WARNING: StatusIcon = {
  shape: SystemIcons.Yield,
  color: Color.yellow,
};
const ERROR: StatusIcon = {
  shape: SystemIcons.CircleClose,
  color: Color.red,
};

const StatusIcon = { SUCCESS, LOADING, STOPPED, WARNING, ERROR };

export default StatusIcon;
