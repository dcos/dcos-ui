import { Link } from "react-router";
import prettycron from "prettycron";
import PropTypes from "prop-types";
import React from "react";
import { Tooltip } from "reactjs-components";

import TaskStates from "#PLUGINS/services/src/js/constants/TaskStates";
import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbSupplementalContent from "#SRC/js/components/BreadcrumbSupplementalContent";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import Icon from "#SRC/js/components/Icon";
import PageHeaderBreadcrumbs from "#SRC/js/components/PageHeaderBreadcrumbs";

function ItemStatus({ item: { jobRuns } }) {
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

function ItemSchedule({ item: { schedules } }) {
  if (!schedules || !schedules.nodes.length || !schedules.nodes[0].enabled) {
    return null;
  }
  const { cron } = schedules.nodes[0];

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

function getBreadcrumb(item, id = "", name = "") {
  const isDetailPage = [...item.path, item.id].join(".") === id;
  const link = isDetailPage ? `/jobs/detail/${id}` : `/jobs/overview/${id}`;

  return (
    <Breadcrumb key={id} title="Jobs">
      <BreadcrumbTextContent>
        <Link to={link}>{name === "" ? "Jobs" : name}</Link>
      </BreadcrumbTextContent>
      {isDetailPage ? <ItemSchedule item={item} /> : null}
      {isDetailPage ? <ItemStatus item={item} /> : null}
    </Breadcrumb>
  );
}

function getBreadcrumbList(item) {
  if (item == null) {
    return [];
  }

  const pathSegments = [...item.path, item.name];
  const segments = pathSegments.map((_, index) =>
    pathSegments.slice(0, index + 1)
  );

  return segments.map(segment =>
    getBreadcrumb(item, segment.join("."), segment[segment.length - 1])
  );
}

export default function Breadcrumbs({ item, children }) {
  let breadcrumbs = [];

  if (item) {
    breadcrumbs = [].concat(
      getBreadcrumb(item),
      getBreadcrumbList(item),
      React.Children.toArray(children)
    );
  }

  return <PageHeaderBreadcrumbs iconID="jobs" breadcrumbs={breadcrumbs} />;
}

Breadcrumbs.propTypes = {
  item: PropTypes.shape({
    path: PropTypes.arrayOf(PropTypes.string).isRequired,
    schedules: PropTypes.shape({
      nodes: PropTypes.arrayOf(
        PropTypes.shape({
          enabled: PropTypes.bool.isRequired,
          cron: PropTypes.string.isRequired
        })
      ).isRequired
    }),
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
