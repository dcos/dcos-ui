import classNames from 'classnames';
import React from 'react';

import HealthBar from './HealthBar';
import PageHeader from './PageHeader';
import Pod from '../structs/Pod';
import StatusMapping from '../constants/StatusMapping';
import StringUtil from '../utils/StringUtil';

class PodInfo extends React.Component {
  constructor() {
    super(...arguments);
  }

  getActionButtons() {
    let actionButtons = [
      <button className="button flush-bottom button-stroke button-inverse"
        key="action-button-edit">
        Placeholder
      </button>
    ];

    return actionButtons;
  }

  getSubHeader(pod) {
    let serviceHealth = pod.getHealth();
    let serviceStatus = pod.getStatus();
    let tasksSummary = pod.getTasksSummary();
    let serviceStatusClassSet = StatusMapping[serviceStatus] || '';
    let runningTasksCount = tasksSummary.tasksRunning;
    let instancesCount = pod.getInstancesCount();
    let runningTasksSubHeader = StringUtil.pluralize('Instance',
      runningTasksCount);
    let subHeaderItems = [
      {
        classes: `media-object-item ${serviceStatusClassSet}`,
        label: serviceStatus,
        shouldShow: serviceHealth.key != null
      },
      {
        classes: 'media-object-item',
        label: `${runningTasksCount} ${runningTasksSubHeader}`,
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
    let pod = this.props.pod;
    let podIcon = null;
    let podImages = pod.getImages();
    if (podImages && podImages['icon-large']) {
      podIcon = (
        <img src={podImages['icon-large']} />
      );
    }

    const tabs = (
      <ul className={classNames([
        'tabs',
        'list-inline',
        'flush-bottom',
        'container-pod',
        'container-pod-short-top',
        'inverse'])}>
        {this.props.tabs}
      </ul>
    );

    return (
      <PageHeader
        actionButtons={this.getActionButtons()}
        icon={podIcon}
        iconClassName="icon-image-container icon-app-container"
        subTitle={this.getSubHeader(pod)}
        navigationTabs={tabs}
        title={pod.getName()} />
    );
  }
}

PodInfo.propTypes = {
  pod: React.PropTypes.instanceOf(Pod).isRequired,
  tabs: React.PropTypes.array
};

module.exports = PodInfo;
