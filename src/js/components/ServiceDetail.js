import mixin from 'reactjs-mixin';
import React from 'react';

import Breadcrumbs from './Breadcrumbs';
import InternalStorageMixin from '../mixins/InternalStorageMixin';
import Service from '../structs/Service';
import ServiceActionItem from '../constants/ServiceActionItem';
import ServiceDetailConfigurationTab from './ServiceDetailConfigurationTab';
import ServiceDetailDebugTab from './ServiceDetailDebugTab';
import ServiceDetailTaskTab from './ServiceDetailTaskTab';
import ServiceDetailVolumesTab from './ServiceDetailVolumesTab';
import ServiceFormModal from './modals/ServiceFormModal';
import ServiceInfo from './ServiceInfo';
import TabsMixin from '../mixins/TabsMixin';

const METHODS_TO_BIND = [
  'onActionsItemSelection',
  'onCloseServiceFormModal'
];

class ServiceDetail extends mixin(InternalStorageMixin, TabsMixin) {

  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      tasks: 'Tasks',
      configuration: 'Configuration',
      debug: 'Debug',
      volumes: 'Volumes'
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift(),
      isServiceFormModalShown: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onActionsItemSelection(item) {
    if (item.id === ServiceActionItem.EDIT) {
      this.setState({isServiceFormModalShown: true});
    }
  }

  onCloseServiceFormModal() {
    this.setState({isServiceFormModalShown: false});
  }

  renderConfigurationTabView() {
    return (
      <ServiceDetailConfigurationTab service={this.props.service}/>
    );
  }

  renderDebugTabView() {
    return (
      <ServiceDetailDebugTab service={this.props.service}/>
    );
  }

  renderVolumesTabView() {
    return (
      <ServiceDetailVolumesTab service={this.props.service}/>
    );
  }

  renderTasksTabView() {
    return (
      <ServiceDetailTaskTab service={this.props.service}/>
    );
  }

  render() {
    const {service} = this.props;

    return (
      <div className="flex-container-col">
        <div className="container-pod
          container-pod-divider-bottom-align-right
          container-pod-short-top flush-bottom flush-top
          service-detail-header media-object-spacing-wrapper
          media-object-spacing-narrow">
          <Breadcrumbs />
          <ServiceInfo onActionsItemSelection={this.onActionsItemSelection}
            service={service} tabs={this.tabs_getUnroutedTabs()} />
          {this.tabs_getTabView()}
        </div>
        <ServiceFormModal isEdit={true}
          open={this.state.isServiceFormModalShown}
          service={service}
          onClose={this.onCloseServiceFormModal} />
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
