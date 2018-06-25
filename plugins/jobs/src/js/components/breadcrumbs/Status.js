import PropTypes from "prop-types";
import React from "react";
import TaskStates from "#PLUGINS/services/src/js/constants/TaskStates";
import BreadcrumbSupplementalContent from "#SRC/js/components/BreadcrumbSupplementalContent";

export default function Status({ status }) {
  return (
    <BreadcrumbSupplementalContent>
      <div className="service-page-header-status muted">
        ({TaskStates[status].displayName})
      </div>
    </BreadcrumbSupplementalContent>
  );
}

Status.propTypes = {
  status: PropTypes.string.isRequired
};
