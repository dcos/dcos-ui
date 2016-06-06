import {Dropdown} from 'reactjs-components';
import React from 'react';

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

    this.state = {
      isServiceFormModalShown: false
    };

    this.onActionsItemSelection =
      this.onActionsItemSelection.bind(this);
  }

  onActionsItemSelection(item) {
    if (item.id === ServiceActionItem.EDIT) {
      this.setState({
        isServiceFormModalShown: true
      });
    }
  }

  getDropdownItems() {
    return [{
      className: 'hidden',
      id: ServiceActionItem.MORE,
      html: '',
      selectedHtml: 'More'
    }, {
      id: ServiceActionItem.SCALE,
      html: 'Scale'
    }, {
      id: ServiceActionItem.SUSPEND,
      html: 'Suspend'
    }, {
      id: ServiceActionItem.DESTROY,
      html: <span className="text-danger">Destroy</span>
    }];
  }

  getActionButtons() {
    return [(
      <button className="button button-stroke button-inverse flush-bottom"
        key="action-button-edit"
        onClick={() =>
          this.onActionsItemSelection({id: ServiceActionItem.EDIT})}>
        Edit
      </button>
    ), (
      <Dropdown
        key="actions-dropdown"
        buttonClassName="button button-stroke button-inverse dropdown-toggle"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        wrapperClassName="dropdown"
        items={this.getDropdownItems()}
        persistentID={ServiceActionItem.MORE}
        onItemSelection={this.onActionsItemSelection}
        transition={true}
        transitionName="dropdown-menu" />
    )];
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

    const mediaWrapperClassNames = {
      'media-object-spacing-narrow': false,
      'media-object-offset': false
    };

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
        subTitle={this.getSubHeader(service)}
        navigationTabs={tabs}
        mediaWrapperClassName={mediaWrapperClassNames}
        title={service.getName()} />
    );
  }
}

ServiceInfo.propTypes = {
  service: React.PropTypes.instanceOf(Service).isRequired
};

module.exports = ServiceInfo;
