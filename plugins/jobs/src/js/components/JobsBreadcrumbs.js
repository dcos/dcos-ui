import { Link } from "react-router";
import prettycron from "prettycron";
import PropTypes from "prop-types";
import React from "react";
import { Tooltip } from "reactjs-components";

import Job from "#SRC/js/structs/Job";
import JobTree from "#SRC/js/structs/JobTree";
import TaskStates from "#PLUGINS/services/src/js/constants/TaskStates";
import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbSupplementalContent from "#SRC/js/components/BreadcrumbSupplementalContent";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import Icon from "#SRC/js/components/Icon";
import PageHeaderBreadcrumbs from "#SRC/js/components/PageHeaderBreadcrumbs";

function getLongestRunningTask(item) {
  if (!(item instanceof Job)) {
    return null;
  }

  const longestRunningActiveRun = item
    .getActiveRuns()
    .getLongestRunningActiveRun();

  if (!longestRunningActiveRun) {
    return null;
  }

  return longestRunningActiveRun.getTasks().getLongestRunningTask();
}

function getItemStatus(item) {
  const longestRunningTask = getLongestRunningTask(item);

  if (!longestRunningTask) {
    return null;
  }

  return (
    <BreadcrumbSupplementalContent>
      <div className="service-page-header-status muted">
        ({TaskStates[longestRunningTask.getStatus()].displayName})
      </div>
    </BreadcrumbSupplementalContent>
  );
}

function getItemSchedule(item) {
  if (!(item instanceof Job)) {
    return null;
  }

  const schedule = item.getSchedules()[0];

  if (!schedule || !schedule.enabled) {
    return null;
  }

  return (
    <BreadcrumbSupplementalContent>
      <Tooltip
        content={prettycron.toString(schedule.cron)}
        maxWidth={250}
        wrapText={true}
      >
        <Icon color="grey" id="repeat" size="mini" />
      </Tooltip>
    </BreadcrumbSupplementalContent>
  );
}

function getBreadcrumb(item, id = "", name = "", details = true) {
  console.log("getBreadcrumb", id);
  const link = item.id === id ? `/jobs/detail/${id}` : `/jobs/overview/${id}`;

  return (
    <Breadcrumb key={id} title="Jobs">
      <BreadcrumbTextContent>
        <Link to={link}>{name === "" ? "Jobs" : name}</Link>
      </BreadcrumbTextContent>
      {/* {details ? getItemSchedule(item) : null}
      {details ? getItemStatus(item) : null} */}
    </Breadcrumb>
  );
}

function getBreadcrumbList(item, details) {
  if (item == null) {
    return [];
  }

  return item.id
    .split(".")
    .reduce((memo, segment) => {
      const [first] = memo;
      if (first) {
        return [[...first, segment], ...memo];
      }

      return [[segment]];
    }, [])
    .reverse()
    .map(segment =>
      getBreadcrumb(
        item,
        segment.join("."),
        segment[segment.length - 1],
        details
      )
    );
}

const JobsBreadcrumbs = ({ item, children }) => {
  try {
    console.log("JobsBreadcrumb", item, getBreadcrumbList(item, false));
    let breadcrumbs = [];
    if (item) {
      // TODO: details should be true for only the last item in the tree
      const details = false;
      breadcrumbs = [].concat(
        getBreadcrumb(item),
        getBreadcrumbList(item, details),
        React.Children.toArray(children)
      );
    }

    return <PageHeaderBreadcrumbs iconID="jobs" breadcrumbs={breadcrumbs} />;
  } catch (e) {
    console.error("Breadcrumb", e);

    return null;
  }
};

JobsBreadcrumbs.propTypes = {
  item: PropTypes.object
};

module.exports = JobsBreadcrumbs;
