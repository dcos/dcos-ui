import {Link} from 'react-router';
import React from 'react';

import PageHeaderBreadcrumbs from '../../components/NewPageHeaderBreadcrumbs';

const JobsBreadcrumbs = ({jobID, taskID, taskName}) => {
  let aggregateIDs = '';
  const crumbs = [
    <Link to="/jobs">Jobs</Link>
  ];

  if (jobID != null && jobID.length > 0) {
    const ids = jobID.split('.');
    const jobsCrumbs = ids.map(function (id, index) {
      if (aggregateIDs !== '') {
        aggregateIDs += '.';
      }
      aggregateIDs += id;

      return <Link to={`/jobs/${aggregateIDs}`} key={index}>{id}</Link>;
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
