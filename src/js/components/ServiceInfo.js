import classNames from 'classnames';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CosmosPackagesStore from '../stores/CosmosPackagesStore';
import Framework from '../structs/Framework';
import HealthBar from './HealthBar';
import HealthStatus from '../constants/HealthStatus';
import HealthLabels from '../constants/HealthLabels';
import PageHeader from './PageHeader';
import Service from '../structs/Service';
import ServicePlan from '../structs/ServicePlan';
import ServicePlanProgressBar from './ServicePlanProgressBar';
import StringUtil from '../utils/StringUtil';
import UpdateConfigModal from './modals/UpdateConfigModal';

const METHODS_TO_BIND = [
  'handleEditConfigClick',
  'handleConfigModalClose'
];

class ServiceInfo extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      editConfigModalOpen: false,
      packageFetched: false
    };

    this.store_listeners = [{
      name: 'cosmosPackages',
      events: [
        'descriptionError',
        'descriptionSuccess'
      ]
    }];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    let {service} = this.props;

    if (service instanceof Framework) {
      let {name, version} = service.getMetadata();
      CosmosPackagesStore.fetchPackageDescription(name, version);
    }
  }

  onCosmosPackagesStoreDescriptionError() {
    this.setState({packageFetched: false});
  }

  onCosmosPackagesStoreDescriptionSuccess() {
    this.setState({packageFetched: true});
  }

  handleConfigModalClose() {
    this.setState({editConfigModalOpen: false});
  }

  handleEditConfigClick() {
    if (CosmosPackagesStore.getPackageDetails() != null) {
      this.setState({editConfigModalOpen: true});
    }
  }

  getActionButtons() {
    let {props, state} = this;

    let editButtonClasses = classNames('button button-inverse button-stroke', {
      'disabled': !state.packageFetched
    });

    let buttons = [
      <a
        className={editButtonClasses}
        key="edit-config"
        onClick={this.handleEditConfigClick}>
        Edit
        <UpdateConfigModal
          onClose={this.handleConfigModalClose}
          open={state.editConfigModalOpen}
          service={props.service}
          servicePlan={props.servicePlan}
          servicePackage={CosmosPackagesStore.getPackageDetails()} />
      </a>
    ];

    if (props.service instanceof Framework && props.service.getWebURL()) {
      buttons.unshift(
        <a
          className="button button-primary"
          href={props.service.getWebURL()}
          key="open-service"
          target="_blank">
          Open Service
        </a>
      );
    }

    return buttons;
  }

  getSubHeader(service) {
    let {servicePlan} = this.props;

    if (servicePlan && !servicePlan.isComplete()) {
      return (
        <ServicePlanProgressBar servicePlan={servicePlan} stacked={false}
          onViewDetailsClick={this.props.onViewProgressDetailsClick} />
      );
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
    let {service} = this.props;
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
  onViewProgressDetailsClick: React.PropTypes.func,
  service: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(Framework),
    React.PropTypes.instanceOf(Service)
  ]).isRequired,
  servicePlan: React.PropTypes.instanceOf(ServicePlan)
};

module.exports = ServiceInfo;
