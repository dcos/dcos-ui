import mixin from 'reactjs-mixin';
import React, {PropTypes} from 'react';

import Breadcrumbs from '../../../../../../src/js/components/Breadcrumbs';
import Service from '../../structs/Service';
import ServiceActionItem from '../../constants/ServiceActionItem';
import ServiceConfigurationContainer from '../service-configuration/ServiceConfigurationContainer';
import ServiceDebugContainer from '../service-debug/ServiceDebugContainer';
import ServiceInfo from './ServiceInfo';
import ServiceTasksContainer from '../tasks/ServiceTasksContainer';
import TabsMixin from '../../../../../../src/js/mixins/TabsMixin';
import VolumeTable from '../../components/VolumeTable';

const METHODS_TO_BIND = [
  'onActionsItemSelection'
];

class ServiceDetail extends mixin(TabsMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      tasks: 'Instances',
      configuration: 'Configuration',
      debug: 'Debug'
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift()
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    this.checkForVolumes();
  }

  componentWillUpdate() {
    super.componentWillUpdate(...arguments);
    this.checkForVolumes();
  }

  onActionsItemSelection(actionItem) {
    const {modalHandlers} = this.context;
    const {service} = this.props;

    switch (actionItem.id) {
      case ServiceActionItem.EDIT:
        modalHandlers.editService({service});
        break;
      case ServiceActionItem.SCALE:
        modalHandlers.scaleService({service});
        break;
      case ServiceActionItem.RESTART:
        modalHandlers.restartService({service});
        break;
      case ServiceActionItem.SUSPEND:
        modalHandlers.suspendService({service});
        break;
      case ServiceActionItem.DESTROY:
        modalHandlers.deleteService({service});
        break;
    };
  }

  checkForVolumes() {
    // Add the Volumes tab if it isn't already there and the service has
    // at least one volume.
    if (this.tabs_tabs.volumes == null && !!this.props.service
      && this.props.service.getVolumes().getItems().length > 0) {
      this.tabs_tabs.volumes = 'Volumes';
      this.forceUpdate();
    }
  }

  renderConfigurationTabView() {
    return (
      <ServiceConfigurationContainer
        actions={this.props.actions}
        service={this.props.service} />
    );
  }

  renderDebugTabView() {
    return (
      <ServiceDebugContainer service={this.props.service}/>
    );
  }

  renderVolumesTabView() {
    return (
      <VolumeTable
        params={this.props.params}
        routes={this.props.routes}
        service={this.props.service}
        volumes={this.props.service.getVolumes().getItems()} />
    );
  }

  renderInstancesTabView() {
    return (
      <ServiceTasksContainer
        params={this.props.params}
        service={this.props.service} />
    );
  }

  render() {
    const {service} = this.props;

    return (
      <div>
        <Breadcrumbs routes={this.props.routes} params={this.props.params} />
        <ServiceInfo onActionsItemSelection={this.onActionsItemSelection}
          service={service} tabs={this.tabs_getUnroutedTabs()} />
        {this.tabs_getTabView()}
      </div>
    );
  }
}

ServiceDetail.contextTypes = {
  modalHandlers: PropTypes.shape({
    scaleService: PropTypes.func,
    restartService: PropTypes.func,
    suspendService: PropTypes.func,
    deleteService: PropTypes.func
  }).isRequired
};

ServiceDetail.propTypes = {
  actions: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  service: PropTypes.instanceOf(Service)
};

module.exports = ServiceDetail;
