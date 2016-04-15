import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import InternalStorageMixin from '../mixins/InternalStorageMixin';
import Service from '../structs/Service';
import ServiceInfo from './ServiceInfo';
import TabsMixin from '../mixins/TabsMixin';

const METHODS_TO_BIND = [];

class ServiceDetail
  extends mixin(InternalStorageMixin, TabsMixin, StoreMixin) {

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

    this.store_listeners = [
      {name: 'state', events: ['success']}
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
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
    return (<span>Tasks Placeholder</span>);
  }

  render() {
    let {service} = this.props;

    return (
      <div className="flex-container-col">
        <div className="container-pod container-pod-divider-bottom
          container-pod-divider-bottom-align-right
          container-pod-short-top flush-bottom flush-top
          service-detail-header media-object-spacing-wrapper
          media-object-spacing-narrow container-pod-divider-inverse">
          <ServiceInfo service={service} />
          <ul className="tabs list-inline flush-bottom container-pod
            container-pod-short-top inverse">
            {this.tabs_getUnroutedTabs()}
          </ul>
        </div>
        {this.tabs_getTabView()}
      </div>

    );
  }
}

ServiceDetail.propTypes = {
  service: React.PropTypes.instanceOf(Service)
};

module.exports = ServiceDetail;
