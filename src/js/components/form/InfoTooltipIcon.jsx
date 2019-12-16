import React from "react";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  iconSizeXs,
  greyLightDarken1
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

const InfoTooltipIcon = () => (
  <span className="info-tooltip-icon-wrap">
    <Icon
      shape={SystemIcons.CircleQuestion}
      size={iconSizeXs}
      color={greyLightDarken1}
    />
  </span>
);

export default InfoTooltipIcon;
