import React from 'react';

import HealthBar from './HealthBar';
import HealthStatus from '../constants/HealthStatus';
import HealthLabels from '../constants/HealthLabels';
import Service from '../structs/Service';
import ServicePlan from '../structs/ServicePlan';
import StringUtil from '../utils/StringUtil';

class ServiceInfo extends React.Component {

  getSubHeader(service) {
    if (this.props.servicePlan) {
      console.log('yep plan');
    }
    let serviceHealth = service.getHealth();
    let tasksSummary = service.getTasksSummary();
    let runningTasksCount = tasksSummary.tasksRunning;
    let instancesCount = service.getInstancesCount();
    let runningTasksSubHeader = StringUtil.pluralize('Task', runningTasksCount);
    let subHeaderItems = [
      {
        classes: `media-object-item ${HealthStatus[serviceHealth.key].classNames}`,
        label: HealthLabels[HealthStatus[serviceHealth.key].key],
        shouldShow: serviceHealth.key != null
      },
      {
        classes: 'media-object-item',
        label: `${runningTasksCount} Running ${runningTasksSubHeader}`,
        shouldShow: runningTasksCount != null && runningTasksSubHeader != null
      },
      {
        label: (
          <HealthBar
            tasksSummary={tasksSummary}
            instancesCount={instancesCount} />
        ),
        shouldShow: true
      }
    ];

    return subHeaderItems.map(function (item, index) {
      if (!item.shouldShow) {
        return null;
      }

      return (
        <span className={item.classes} key={index}>
          {item.label}
        </span>
      );
    });
  }

  render() {
    let service = this.props.service;
    let imageTag = null;
    let serviceImages = service.getImages();
    if (serviceImages && serviceImages['icon-large']) {
      imageTag = (
        <div
          className="icon icon-large icon-image-container icon-app-container">
          <img src={serviceImages['icon-large']} />
        </div>
      );
    }

    return (
      <div className="media-object flex-box
        flex-box-align-vertical-center">
        <div className="media-object-item">
          {imageTag}
        </div>
        <div className="media-object-item">
          <h1 className="flush inverse">
            {service.getName()}
          </h1>
          <div>
            {this.getSubHeader(service)}
          </div>
        </div>
      </div>
    );
  }
}

ServiceInfo.propTypes = {
  service: React.PropTypes.instanceOf(Service).isRequired,
  servicePlan: React.PropTypes.instanceOf(ServicePlan)
};

module.exports = ServiceInfo;
