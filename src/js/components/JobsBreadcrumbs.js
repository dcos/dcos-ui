import { Trans } from "@lingui/macro";
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

  const longestRunningTaskState =
    TaskStates[longestRunningTask.getStatus()].displayName;

  return (
    <BreadcrumbSupplementalContent>
      <div className="service-page-header-status muted">
        (<Trans id={longestRunningTaskState} render="span" />)
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

function getBreadcrumb(item, details = true) {
  const id = item.getId();
  const name = item.getName();
  const link =
    item instanceof Job ? `/jobs/detail/${id}` : `/jobs/overview/${id}`;

  return (
    <Breadcrumb key={id} title="Jobs">
      <BreadcrumbTextContent>
        <Link to={link}>{name === "" ? "Jobs" : name}</Link>
      </BreadcrumbTextContent>
      {details ? getItemSchedule(item) : null}
      {details ? getItemStatus(item) : null}
    </Breadcrumb>
  );
}

function getBreadcrumbList(tree, item, details) {
  if (item == null) {
    return [];
  }

  return tree
    .filterItems(function(currentItem) {
      return (
        item.getId() === currentItem.getId() &&
        item.constructor === currentItem.constructor
      );
    })
    .reduceItems(function(acc, currentItem) {
      return acc.concat(getBreadcrumb(currentItem, details));
    }, []);
}

const JobsBreadcrumbs = ({ tree, item, children, details = true }) => {
  const breadcrumbs = [].concat(
    getBreadcrumb(tree, details),
    getBreadcrumbList(tree, item, details),
    React.Children.toArray(children)
  );

  return <PageHeaderBreadcrumbs iconID="jobs" breadcrumbs={breadcrumbs} />;
};

JobsBreadcrumbs.propTypes = {
  tree: PropTypes.instanceOf(JobTree).isRequired,
  item: PropTypes.oneOfType([
    PropTypes.instanceOf(JobTree),
    PropTypes.instanceOf(Job)
  ])
};

module.exports = JobsBreadcrumbs;
