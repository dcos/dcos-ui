import React from "react";
import prettycron from "prettycron";
import { Tooltip } from "reactjs-components";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

const JobsCronTooltip = ({ content }: { content: string }) => {
  return (
    <Tooltip
      wrapperClassName="tooltip-wrapper"
      content={prettycron.toString(content)}
      maxWidth={250}
      wrapText={true}
    >
      <Icon color={greyDark} shape={SystemIcons.Repeat} size={iconSizeXs} />
    </Tooltip>
  );
};

export default JobsCronTooltip;
