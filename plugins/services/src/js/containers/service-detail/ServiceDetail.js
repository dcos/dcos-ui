import mixin from 'reactjs-mixin';
import React, {PropTypes} from 'react';

import Page from '../../../../../../src/js/components/Page';
import ServiceBreadcrumbs from '../../components/ServiceBreadcrumbs';
import Service from '../../structs/Service';
import ServiceActionItem from '../../constants/ServiceActionItem';
import ServiceConfigurationContainer from '../service-configuration/ServiceConfigurationContainer';
import ServiceDebugContainer from '../service-debug/ServiceDebugContainer';
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

  hasVolumes() {
    return !!this.props.service &&
        this.props.service.getVolumes().getItems().length > 0;
  }

  checkForVolumes() {
    // Add the Volumes tab if it isn't already there and the service has
    // at least one volume.
    if (this.tabs_tabs.volumes == null && this.hasVolumes()) {
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
    const {modals, service} = this.props;
    let {id} = service;

    const breadcrumbs = <ServiceBreadcrumbs serviceID={id} />;

    const routePrefix = `/services/overview/${encodeURIComponent(id)}`;
    const tabs = [
      {label: 'Instances', callback: () => { this.setState({currentTab: 'tasks'}); }},
      {label: 'Configuration', callback: () => { this.setState({currentTab: 'configuration'}); }},
      {label: 'Debug', callback: () => { this.setState({currentTab: 'debug'}); }}
    ];

    if (this.hasVolumes()) {
      tabs.push({
        label: 'Volumes', routePath: routePrefix + '/volumes',
        callback: this.tabs_handleTabClick.bind('volumes')
      });
    }

    // TODO add ServiceInfo to header actions
    /* <ServiceInfo onActionsItemSelection={this.onActionsItemSelection}
         service={service} tabs={this.tabs_getUnroutedTabs()} />*/
    return (
      <Page>
        <Page.Header tabs={tabs} breadcrumbs={breadcrumbs} iconID="services" />
        {this.tabs_getTabView()}
        {modals}
      </Page>
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
  service: PropTypes.instanceOf(Service),
  modals: PropTypes.node
};

module.exports = ServiceDetail;
