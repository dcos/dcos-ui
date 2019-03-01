import React from "react";
import prettycron from "prettycron";
import PropTypes from "prop-types";
import { Tooltip } from "reactjs-components";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import BreadcrumbSupplementalContent from "#SRC/js/components/BreadcrumbSupplementalContent";

export default function ItemSchedule({ schedule }) {
  const { cron } = schedule;

  return (
    <BreadcrumbSupplementalContent>
      <Tooltip
        content={prettycron.toString(cron)}
        maxWidth={250}
        wrapText={true}
      >
        <Icon color={greyDark} shape={SystemIcons.Repeat} size={iconSizeXs} />
      </Tooltip>
    </BreadcrumbSupplementalContent>
  );
}

ItemSchedule.propTypes = {
  schedule: PropTypes.shape({
    enabled: PropTypes.bool.isRequired,
    cron: PropTypes.string.isRequired
  })
};
