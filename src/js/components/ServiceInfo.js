import classNames from 'classnames';
import {Dropdown} from 'reactjs-components';
import React from 'react';

import Cluster from '../utils/Cluster';
import Framework from '../structs/Framework';
import HealthBar from './HealthBar';
import HealthStatus from '../constants/HealthStatus';
import HealthLabels from '../constants/HealthLabels';
import PageHeader from './PageHeader';
import Service from '../structs/Service';
import ServiceActionItem from '../constants/ServiceActionItem';
import StringUtil from '../utils/StringUtil';

class ServiceInfo extends React.Component {
  constructor() {
    super();
  }

  getActionButtons() {
    const {service} = this.props;

    const dropdownItems = [{
      className: 'hidden',
      id: ServiceActionItem.MORE,
      html: '',
      selectedHtml: 'More'
    }, {
      id: ServiceActionItem.SCALE,
      html: 'Scale'
    }, {
      className: classNames({
        hidden: service.getInstancesCount() === 0
      }),
      id: ServiceActionItem.SUSPEND,
      html: 'Suspend'
    }, {
      id: ServiceActionItem.DESTROY,
      html: <span className="text-danger">Destroy</span>
    }];

    let actionButtons = [(
      <button className="button flush-bottom button-stroke button-inverse"
        key="action-button-edit"
        onClick={() =>
          this.props.onActionsItemSelection({id: ServiceActionItem.EDIT})}>
        Edit
      </button>
    ), (
      <Dropdown
        key="actions-dropdown"
        buttonClassName="button button-stroke button-inverse dropdown-toggle"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        wrapperClassName="dropdown anchor-right flush-bottom"
        items={dropdownItems}
        persistentID={ServiceActionItem.MORE}
        onItemSelection={this.props.onActionsItemSelection}
        transition={true}
        transitionName="dropdown-menu" />
    )];

    if (service instanceof Framework && service.getWebURL()) {
      actionButtons.unshift(
        <a className="button button-primary flush-bottom"
          key="service-link"
          href={Cluster.getServiceLink(service.getName())} target="_blank"
          title="Open in a new window">
          Open Service
        </a>
      );
    }

    return actionButtons;
  }

  getSubHeader(service) {
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
    let serviceIcon = null;
    let serviceImages = service.getImages();
    if (serviceImages && serviceImages['icon-large']) {
      serviceIcon = (
        <img src={serviceImages['icon-large']} />
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
        icon={serviceIcon}
        iconClassName="icon-app-container"
        subTitle={this.getSubHeader(service)}
        navigationTabs={tabs}
        title={service.getName()} />
    );
  }
}

ServiceInfo.propTypes = {
  onActionsItemSelection: React.PropTypes.func.isRequired,
  service: React.PropTypes.instanceOf(Service).isRequired,
  tabs: React.PropTypes.array
};

module.exports = ServiceInfo;
