import {Link} from 'react-router';
import prettycron from 'prettycron';
import React from 'react';
import {Tooltip} from 'reactjs-components';

import Icon from '../Icon';
import PageHeaderBreadcrumbs from '../../components/PageHeaderBreadcrumbs';

function getJobStatus(jobStatus) {
  if (jobStatus != null) {
    return (
      <div className="service-page-header-status page-header-breadcrumb-content-secondary muted">
        {`(${jobStatus})`}
      </div>
    );
  }

  return null;
}

function getJobSchedule(jobSchedules) {
  if (jobSchedules && jobSchedules.length !== 0) {
    const schedule = jobSchedules[0];

    if (schedule.enabled) {
      return (
        <Tooltip
          wrapperClassName="tooltip-wrapper icon icon-margin-left"
          content={prettycron.toString(schedule.cron)}
          maxWidth={250}
          wrapText={true}>
          <Icon
            color="grey"
            id="repeat"
            size="mini" />
        </Tooltip>
      );
    }
  }

  return null;
}

const JobsBreadcrumbs = (props) => {
  const {jobID, taskID, taskName, jobSchedules, jobStatus} = props;
  let aggregateIDs = '';
  const crumbs = [
    <Link to="/jobs">Jobs</Link>
  ];

  if (jobID != null && jobID.length > 0) {
    const ids = jobID.split('.');

    const jobsCrumbs = ids.map(function (id, index) {
      let status;
      let scheduleIcon;

      if (aggregateIDs !== '') {
        aggregateIDs += '.';
      }
      aggregateIDs += id;

      if (index === ids.length - 1) {
        status = getJobStatus(jobStatus);
        scheduleIcon = getJobSchedule(jobSchedules);
      }

      return (
        <div>
          <Link to={`/jobs/${aggregateIDs}`} key={index}>{id}</Link>
          {scheduleIcon}
          {status}
        </div>
      );
    });
    crumbs.push(...jobsCrumbs);
  }

  if (taskID != null && taskName != null) {
    const encodedTaskID = encodeURIComponent(taskID);
    crumbs.push(
      <Link to={`/jobs/${aggregateIDs}/tasks/${encodedTaskID}`}>
        {taskName}
      </Link>
    );
  }

  return <PageHeaderBreadcrumbs iconID="jobs" breadcrumbs={crumbs} />;
};

module.exports = JobsBreadcrumbs;
