import * as React from "react";
import PropTypes from "prop-types";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  textColorSecondary,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import BreadcrumbSupplementalContent from "#SRC/js/components/BreadcrumbSupplementalContent";

const JobsCronTooltip = React.lazy(() =>
  import(
    /* webpackChunkName: "JobsCronTooltip" */ "#SRC/js/components/JobsCronTooltip"
  )
);

export default function ItemSchedule({ schedule }) {
  const { cron } = schedule;

  return (
    <BreadcrumbSupplementalContent>
      <React.Suspense
        fallback={
          <Icon
            shape={SystemIcons.Repeat}
            color={textColorSecondary}
            size={iconSizeXs}
          />
        }
      >
        <JobsCronTooltip content={cron} />
      </React.Suspense>
    </BreadcrumbSupplementalContent>
  );
}

ItemSchedule.propTypes = {
  schedule: PropTypes.shape({
    enabled: PropTypes.bool.isRequired,
    cron: PropTypes.string.isRequired
  })
};
