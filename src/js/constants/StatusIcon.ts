import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  green,
  yellow,
  greyLightDarken1,
  greyDark
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

const STATUS_ICON = {
  SUCCESS: {
    shape: SystemIcons.CircleCheck,
    color: green
  },
  LOADING: {
    shape: SystemIcons.Spinner,
    color: greyDark
  },
  STOPPED: {
    shape: SystemIcons.CircleMinus,
    color: greyLightDarken1
  },
  WARNING: {
    shape: SystemIcons.Yield,
    color: yellow
  }
};

export default STATUS_ICON;
