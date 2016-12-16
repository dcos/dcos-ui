import React from 'react';
import {Link} from 'react-router';

import {DCOSStore} from 'foundation-ui';
import HealthBar from './HealthBar';
import PageHeaderBreadcrumbs from '../../../../../src/js/components/NewPageHeaderBreadcrumbs';

function getHealthStatus(serviceID) {
  if (serviceID == null) {
    return null;
  }

  const service = DCOSStore.serviceTree.findItemById(serviceID);

  if (service == null) {
    return null;
  }

  const serviceStatus = service.getStatus();
  const tasksSummary = service.getTasksSummary();
  const runningTasksCount = tasksSummary.tasksRunning;
  const instancesCount = service.getInstancesCount();
  const isDeploying = serviceStatus === 'Deploying';

  return (
    <div className="service-page-header-status page-header-breadcrumb-content-secondary muted">
      {`${serviceStatus} (${runningTasksCount} of ${instancesCount})`}
      <HealthBar isDeploying={isDeploying}
        tasksSummary={tasksSummary}
        instancesCount={instancesCount}/>
    </div>
  );
}

const ServiceBreadcrumbs = ({serviceID, taskID, taskName}) => {

  const trimmedServiceID = decodeURIComponent(serviceID).replace(/^\//, '');
  const ids = trimmedServiceID.split('/');
  let aggregateIDs = '';

  const crumbs = [
    <Link to="/services" key={-1}>Services</Link>
  ];

  if (serviceID != null && trimmedServiceID.length > 0) {
    const serviceCrumbs = ids.map(function (id, index) {
      let breadcrumbHealth = null;

      if (index === ids.length - 1) {
        breadcrumbHealth = getHealthStatus(serviceID);
      }

      aggregateIDs += encodeURIComponent(`/${id}`);

      return (
        <div>
          <Link to={`/services/overview/${aggregateIDs}`} key={index}>
            {id}
          </Link>
          {breadcrumbHealth}
        </div>
      );
    });

    crumbs.push(...serviceCrumbs);
  }

  if (taskID != null && taskName != null) {
    const encodedTaskID = encodeURIComponent(taskID);
    crumbs.push(
      <Link to={`/services/overview/${aggregateIDs}/tasks/${encodedTaskID}`} index={taskID}>{taskName}</Link>
    );
  }

  return <PageHeaderBreadcrumbs iconID="services" breadcrumbs={crumbs} />;

};

module.exports = ServiceBreadcrumbs;
