import mixin from 'reactjs-mixin';
import React from 'react';

import InternalStorageMixin from '../mixins/InternalStorageMixin';
import Service from '../structs/Service';
import ServiceDetailTaskTab from './ServiceDetailTaskTab';
import ServiceInfo from './ServiceInfo';
import ServiceOptions from './ServiceOptions';
import ServicesBreadcrumb from './ServicesBreadcrumb';
import TabsMixin from '../mixins/TabsMixin';

class ServiceDetail extends mixin(InternalStorageMixin, TabsMixin) {

  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      tasks: 'Tasks',
      configuration: 'Configuration',
      debug: 'Debug',
      logs: 'Logs'
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift()
    };
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

    return (
      <div className="flex-container-col">
        <div className="container-pod container-pod-divider-bottom
          container-pod-divider-bottom-align-right
          container-pod-short-top flush-bottom flush-top
          service-detail-header media-object-spacing-wrapper
          media-object-spacing-narrow container-pod-divider-inverse">
          <ServicesBreadcrumb serviceTreeItem={service} />
          <ServiceInfo service={service} />
          <ServiceOptions service={service} />
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
