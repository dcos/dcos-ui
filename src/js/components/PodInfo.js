import classNames from 'classnames';
import {Dropdown} from 'reactjs-components';
import React from 'react';

import HealthBar from './HealthBar';
import PageHeader from './PageHeader';
import Pod from '../structs/Pod';
import ServiceActionItem from '../constants/ServiceActionItem';
import StatusMapping from '../constants/StatusMapping';
import StringUtil from '../utils/StringUtil';

class PodInfo extends React.Component {
  constructor() {
    super();
  }

  getActionButtons() {
    const {pod} = this.props;

    const dropdownItems = [{
      className: 'hidden',
      id: ServiceActionItem.MORE,
      html: '',
      selectedHtml: 'More'
    }, {
      className: classNames({
        hidden: pod.getInstancesCount() === 0
      }),
      id: ServiceActionItem.RESTART,
      html: 'Restart'
    }, {
      className: classNames({
        hidden: pod.getInstancesCount() === 0
      }),
      id: ServiceActionItem.SUSPEND,
      html: 'Suspend'
    }, {
      id: ServiceActionItem.DESTROY,
      html: <span className="text-danger">Destroy</span>
    }];

    let actionButtons = [
      <button className="button flush-bottom button-stroke button-inverse"
        key="action-button-edit"
        onClick={() =>
          this.props.onActionsItemSelection({id: ServiceActionItem.EDIT})}>
        Edit
      </button>,
      <Dropdown
        key="actions-dropdown"
        anchorRight={true}
        buttonClassName="button button-stroke button-inverse dropdown-toggle"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        wrapperClassName="dropdown flush-bottom"
        items={dropdownItems}
        persistentID={ServiceActionItem.MORE}
        onItemSelection={this.props.onActionsItemSelection}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        transitionName="dropdown-menu" />
    ];

    let webURL = pod.getWebURL();
    if (webURL) {
      actionButtons.unshift(
        <a className="button button-primary flush-bottom"
          key="service-link"
          href={webURL}
          target="_blank"
          title="Open in a new window">
          Open Service
        </a>
      );
    }

    return actionButtons;
  }

  getSubHeader(pod) {
    let serviceHealth = pod.getHealth();
    let serviceStatus = pod.getStatus();
    let tasksSummary = pod.getTasksSummary();
    let serviceStatusClassSet = StatusMapping[serviceStatus] || '';
    let runningTasksCount = tasksSummary.tasksRunning;
    let instancesCount = pod.getInstancesCount();
    let runningTasksSubHeader = StringUtil.pluralize('Task', runningTasksCount);
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
      <ul className="tabs list-inline flush-bottom container-pod
        container-pod-short-top inverse">
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
  onActionsItemSelection: React.PropTypes.func.isRequired,
  pod: React.PropTypes.instanceOf(Pod).isRequired,
  tabs: React.PropTypes.array
};

module.exports = PodInfo;
