import React from 'react';
import {Link} from 'react-router';

import PageHeaderBreadcrumbs from '../../../../../src/js/components/NewPageHeaderBreadcrumbs';

const ServiceBreadcrumbs = ({serviceID, taskID, taskName}) => {
  const trimmedServiceID = decodeURIComponent(serviceID).replace(/^\//, '');
  const ids = trimmedServiceID.split('/');
  let aggregateIDs = '';

  const crumbs = [<Link to="services" key={-1}>Services</Link>];

  if (serviceID != null && trimmedServiceID.length > 0) {
    let serviceCrumbs = ids.map(function (id, index) {
      aggregateIDs += encodeURIComponent(`/${id}`);

      return (
        <Link to={`/services/overview/${aggregateIDs}`} key={index}>{id}</Link>
      );
    });

    crumbs.push(...serviceCrumbs);
  }

  if (taskID != null && taskName != null) {
    let encodedTaskID = encodeURIComponent(taskID);
    crumbs.push(
      <Link to={`services/overview/${aggregateIDs}/tasks/${encodedTaskID}`} index={taskID}>{taskName}</Link>
    );
  }

  return <PageHeaderBreadcrumbs iconID="services" breadcrumbs={crumbs} />;

};

module.exports = ServiceBreadcrumbs;
