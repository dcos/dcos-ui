import React from "react";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import Breadcrumb from "./Breadcrumb";

function BreadcrumbCaret() {
  return (
    <Breadcrumb isCaret={true} title="Caret">
      <Icon color={greyDark} shape={SystemIcons.CaretRight} size={iconSizeXs} />
    </Breadcrumb>
  );
}

export default BreadcrumbCaret;
