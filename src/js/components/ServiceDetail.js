import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import InternalStorageMixin from '../mixins/InternalStorageMixin';
import Service from '../structs/Service';
import ServiceDetailTaskTab from './ServiceDetailTaskTab';
import ServiceInfo from './ServiceInfo';
import ServiceOptions from './ServiceOptions';
import ServicePlanProgressModal from './modals/ServicePlanProgressModal';
import ServicePlanStore from '../stores/ServicePlanStore';
import ServicesBreadcrumb from './ServicesBreadcrumb';
import TabsMixin from '../mixins/TabsMixin';

const METHODS_TO_BIND = [
  'handleViewProgressDetailsClick',
  'handleProgressDetailModalClose',
  'onServicePlanStoreChange'
];

class ServiceDetail extends mixin(InternalStorageMixin, TabsMixin, StoreMixin) {

  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      tasks: 'Tasks',
      configuration: 'Configuration',
      debug: 'Debug',
      logs: 'Logs'
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift(),
      progressDetailModalOpen: false,
      servicePlan: null
    };

    this.store_listeners = [{
      name: 'servicePlan',
      events: [
        'error'
      ]
    }];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    ServicePlanStore.addPlanChangeListener(this.props.service.id, this.onServicePlanStoreChange);
  }

  onServicePlanStoreChange() {
    this.setState({
      servicePlan: ServicePlanStore.getServicePlan(this.props.service.id)
    });
  }

  onServicePlanStoreError() {
    this.setState({
      servicePlan: null
    });
  }

  handleProgressDetailModalClose() {
    this.setState({progressDetailModalOpen: false});
  }

  handleViewProgressDetailsClick() {
    this.setState({progressDetailModalOpen: true});
  }

  renderConfigurationTabView() {
    return (<span>Configuration Placeholder</span>);
  }

  renderDebugTabView() {
    return (<span>Debug Placeholder</span>);
  }

  renderLogsTabView() {
    return (<span>Logs Placeholder</span>);
  }

  renderTasksTabView() {
    return (
      <ServiceDetailTaskTab service={this.props.service}/>
    );
  }

  render() {
    const {service} = this.props;
    let {servicePlan} = this.state;

    return (
      <div className="flex-container-col">
        <div className="container-pod container-pod-divider-bottom
          container-pod-divider-bottom-align-right
          container-pod-short-top flush-bottom flush-top
          service-detail-header media-object-spacing-wrapper
          media-object-spacing-narrow container-pod-divider-inverse">
          <ServicesBreadcrumb serviceTreeItem={service} />
          <ServiceInfo service={service} servicePlan={servicePlan}
            onViewProgressDetailsClick={this.handleViewProgressDetailsClick} />
          <ServiceOptions service={service} servicePlan={servicePlan} />
          <ul className="tabs list-inline flush-bottom container-pod
            container-pod-short-top inverse">
            {this.tabs_getUnroutedTabs()}
          </ul>
        </div>
        <div className="side-panel-tab-content side-panel-section container
          container-pod container-pod-short container-fluid
          container-fluid-flush flex-container-col flex-grow">
          {this.tabs_getTabView()}
        </div>
        <ServicePlanProgressModal open={this.state.progressDetailModalOpen}
          onClose={this.handleProgressDetailModalClose} service={service}
          servicePlan={servicePlan} />
      </div>

    );
  }
}

ServiceDetail.contextTypes = {
  router: React.PropTypes.func
};

ServiceDetail.propTypes = {
  service: React.PropTypes.instanceOf(Service)
};

module.exports = ServiceDetail;
