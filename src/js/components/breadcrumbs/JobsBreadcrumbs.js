import { Link } from "react-router";
import prettycron from "prettycron";
import React from "react";
import { Tooltip } from "reactjs-components";

import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbSupplementalContent
  from "../../components/BreadcrumbSupplementalContent";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import Icon from "../Icon";
import PageHeaderBreadcrumbs from "../../components/PageHeaderBreadcrumbs";

function getJobStatus(jobStatus) {
  if (jobStatus != null) {
    return (
      <BreadcrumbSupplementalContent>
        <div className="service-page-header-status muted">
          ({jobStatus})
        </div>
      </BreadcrumbSupplementalContent>
    );
  }

  return null;
}

function getJobSchedule(jobSchedules) {
  if (jobSchedules && jobSchedules.length !== 0) {
    const schedule = jobSchedules[0];

    if (schedule.enabled) {
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
  }

  return null;
}

const JobsBreadcrumbs = props => {
  const { jobID, taskID, taskName, jobSchedules, jobStatus } = props;
  let aggregateIDs = "";
  const crumbs = [
    <Breadcrumb key={0} title="Jobs">
      <BreadcrumbTextContent>
        <Link to="/jobs">Jobs</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  if (jobID != null && jobID.length > 0) {
    const ids = jobID.split(".");

    const jobsCrumbs = ids.map(function(id, index) {
      let status;
      let scheduleIcon;

      if (aggregateIDs !== "") {
        aggregateIDs += ".";
      }
      aggregateIDs += id;

      if (index === ids.length - 1) {
        status = getJobStatus(jobStatus);
        scheduleIcon = getJobSchedule(jobSchedules);
      }

      return (
        <Breadcrumb key={index + 1} title="Identity Providers">
          <BreadcrumbTextContent>
            <Link to={`/jobs/${aggregateIDs}`} key={index}>{id}</Link>
          </BreadcrumbTextContent>
          {scheduleIcon}
          {status}
        </Breadcrumb>
      );
    });
    crumbs.push(...jobsCrumbs);
  }

  if (taskID != null && taskName != null) {
    const encodedTaskID = encodeURIComponent(taskID);
    crumbs.push(
      <Breadcrumb key="task-name" title={taskName}>
        <BreadcrumbTextContent>
          <Link to={`/jobs/${aggregateIDs}/tasks/${encodedTaskID}`}>
            {taskName}
          </Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    );
  }

  return <PageHeaderBreadcrumbs iconID="jobs" breadcrumbs={crumbs} />;
};

module.exports = JobsBreadcrumbs;
