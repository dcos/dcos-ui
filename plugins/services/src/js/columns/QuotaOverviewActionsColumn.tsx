import * as React from "react";
import { Cell, Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyDark,
  iconSizeXs,
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import { ServiceGroup } from "#PLUGINS/services/src/js/types/ServiceGroup";

export function actionsRenderer(_group: ServiceGroup) {
  return (
    <Cell>
      <span className="icon-margin-right">
        <Icon
          color={greyDark}
          shape={SystemIcons.EllipsisVertical}
          size={iconSizeXs}
        />
      </span>
    </Cell>
  );
}
