import PropTypes from "prop-types";
import React from "react";
import TaskStates from "#PLUGINS/services/src/js/constants/TaskStates";
import BreadcrumbSupplementalContent from "#SRC/js/components/BreadcrumbSupplementalContent";

export default function ItemStatus({ item: { jobRuns } }) {
  if (!jobRuns) {
    return null;
  }
  const { longestRunningActiveRun } = jobRuns;
  if (
    !longestRunningActiveRun ||
    !longestRunningActiveRun.tasks.longestRunningTask
  ) {
    return null;
  }
  const { status } = longestRunningActiveRun.tasks.longestRunningTask;

  return (
    <BreadcrumbSupplementalContent>
      <div className="service-page-header-status muted">
        ({TaskStates[status].displayName})
      </div>
    </BreadcrumbSupplementalContent>
  );
}

ItemStatus.propTypes = {
  item: PropTypes.shape({
    jobRuns: PropTypes.shape({
      longestRunningActiveRun: PropTypes.shape({
        tasks: PropTypes.shape({
          longestRunningTask: PropTypes.shape({
            status: PropTypes.string.isRequired
          })
        }).isRequired
      })
    }).isRequired
  })
};
