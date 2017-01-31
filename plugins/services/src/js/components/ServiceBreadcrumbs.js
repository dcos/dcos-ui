import React from 'react';
import {Link} from 'react-router';

import {DCOSStore} from 'foundation-ui';
import HealthBar from './HealthBar';
import PageHeaderBreadcrumbs from '../../../../../src/js/components/PageHeaderBreadcrumbs';
import ServiceStatusWarningWithDebugInformation from './ServiceStatusWarningWithDebugInstruction';
import ServiceTree from '../structs/ServiceTree';

function getServiceImage(service) {
  if (service == null || service instanceof ServiceTree) {
    return null;
  }

  return (
    <span className="icon icon-small icon-image-container icon-app-container page-header-breadcrumb-item-icon">
      <img src={service.getImages()['icon-small']}/>
    </span>
  );
}

function getHealthStatus(service) {
  if (service == null) {
    return null;
  }

  const serviceStatus = service.getStatus();
  const tasksSummary = service.getTasksSummary();
  const runningTasksCount = tasksSummary.tasksRunning;
  const instancesCount = service.getInstancesCount();
  const isDeploying = serviceStatus === 'Deploying';

  if (instancesCount === 0) {
    return null;
  }

  return (
    <div className="service-page-header-status page-header-breadcrumb-content-secondary muted">
      {`${serviceStatus} (${runningTasksCount} of ${instancesCount})`}
      <ServiceStatusWarningWithDebugInformation item={service} />
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
      let serviceIDNode = id;
      let breadcrumbHealth = null;
      let serviceImage = null;

      if (index === ids.length - 1) {
        const service = DCOSStore.serviceTree.findItemById(serviceID);

        breadcrumbHealth = getHealthStatus(service);
        serviceImage = getServiceImage(service);
      }

      if (serviceImage != null) {
        serviceIDNode = (
          <span className="page-header-breadcrumb-item-icon-container">
            {serviceImage}
            {id}
          </span>
        );
      }

      aggregateIDs += encodeURIComponent(`/${id}`);

      return (
        <div>
          <Link to={`/services/overview/${aggregateIDs}`} key={index}>
            {serviceIDNode}
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
