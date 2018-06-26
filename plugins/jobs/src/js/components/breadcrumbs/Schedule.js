import React from "react";
import prettycron from "prettycron";
import PropTypes from "prop-types";
import { Tooltip } from "reactjs-components";

import Icon from "#SRC/js/components/Icon";
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
        <Icon color="grey" id="repeat" size="mini" />
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
