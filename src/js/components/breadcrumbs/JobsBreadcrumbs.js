import { Link } from "react-router";
import prettycron from "prettycron";
import React from "react";
import { Tooltip } from "reactjs-components";

import Job from "#SRC/js/structs/Job";
import JobTree from "#SRC/js/structs/JobTree";
import TaskStates from "#PLUGINS/services/src/js/constants/TaskStates";

import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbSupplementalContent
  from "../../components/BreadcrumbSupplementalContent";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import Icon from "../Icon";
import PageHeaderBreadcrumbs from "../../components/PageHeaderBreadcrumbs";

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

function getBreadcrumb(item, details = true) {
  const id = item.getId();
  const name = item.getName();
  const link = item instanceof Job
    ? `/jobs/detail/${id}`
    : `/jobs/overview/${id}`;

  return (
    <Breadcrumb key={id} title="Jobs">
      <BreadcrumbTextContent>
        <Link to={link}>
          {name === "" ? "Jobs" : name}
        </Link>
      </BreadcrumbTextContent>
      {details ? getItemSchedule(item) : null}
      {details ? getItemStatus(item) : null}
    </Breadcrumb>
  );
}

const JobsBreadcrumbs = ({ tree, item, children, details = true }) => {
  const elements = tree
    .filterItems(function(currentItem) {
      return (
        item != null &&
        item.getId() === currentItem.getId() &&
        item.constructor === currentItem.constructor
      );
    })
    .reduceItems(function(acc, currentItem) {
      return acc.concat(getBreadcrumb(currentItem, details));
    }, []);

  const breadcrumbs = [].concat(
    getBreadcrumb(tree, details),
    elements,
    React.Children.toArray(children)
  );

  return <PageHeaderBreadcrumbs iconID="jobs" breadcrumbs={breadcrumbs} />;
};

JobsBreadcrumbs.propTypes = {
  tree: React.PropTypes.instanceOf(JobTree).isRequired,
  item: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(JobTree),
    React.PropTypes.instanceOf(Job)
  ])
};

module.exports = JobsBreadcrumbs;
