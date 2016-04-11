import React from 'react';

import HealthStatus from '../constants/HealthStatus';
import HealthLabels from '../constants/HealthLabels';
import Service from '../structs/Service';
import StringUtil from '../utils/StringUtil';

class ServiceInfo extends React.Component {

  static get propTypes() {
    return {
      service: React.PropTypes.instanceOf(Service).isRequired
    };
  }

  getSubHeader(service) {
    let frameworkHealth = service.getHealth();
    let runningTasksCount = service.getTasksSummary().tasksRunning;
    let runningTasksSubHeader = StringUtil.pluralize('Task', runningTasksCount);
    let subHeaderItems = [
      {
        classes: `media-object-item ${HealthStatus[frameworkHealth.key].classNames}`,
        label: HealthLabels[HealthStatus[frameworkHealth.key].key],
        shouldShow: frameworkHealth.key != null
      },
      {
        classes: 'media-object-item',
        label: `${runningTasksCount} Running ${runningTasksSubHeader}`,
        shouldShow: runningTasksCount != null && runningTasksSubHeader != null
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
        <div className="icon icon-large icon-image-container icon-app-container">
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

module.exports = ServiceInfo;
