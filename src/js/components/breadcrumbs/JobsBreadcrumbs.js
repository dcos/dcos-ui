import {Link} from 'react-router';
import React from 'react';

import PageHeaderBreadcrumbs from '../../components/NewPageHeaderBreadcrumbs';

const JobsBreadcrumbs = ({jobID, taskID, taskName, jobStatus}) => {
  let aggregateIDs = '';
  const crumbs = [
    <Link to="/jobs">Jobs</Link>
  ];

  if (jobID != null && jobID.length > 0) {
    const ids = jobID.split('.');

    const jobsCrumbs = ids.map(function (id, index) {
      let status;
      if (aggregateIDs !== '') {
        aggregateIDs += '.';
      }
      aggregateIDs += id;

      if (index === ids.length - 1 && jobStatus != null) {
        status = (
          <div className="service-page-header-status page-header-breadcrumb-content-secondary muted">
            {`(${jobStatus})`}
          </div>
        );
      }

      return (
        <div>
          <Link to={`/jobs/${aggregateIDs}`} key={index}>{id}</Link>
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
