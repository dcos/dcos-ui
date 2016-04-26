import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import InternalStorageMixin from '../mixins/InternalStorageMixin';
import MesosStateStore from '../stores/MesosStateStore';
import Service from '../structs/Service';
import ServiceInfo from './ServiceInfo';
import TabsMixin from '../mixins/TabsMixin';
import TaskView from './TaskView';

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
    let tasks = MesosStateStore.getTasksByServiceId(this.props.service.getId());

    return (
      <TaskView tasks={tasks} inverseStyle={true}
        parentRouter={this.context.router} />
    );
  }

  render() {
    return (
      <div className="flex-container-col">
        <div className="container-pod container-pod-divider-bottom
          container-pod-divider-bottom-align-right
          container-pod-short-top flush-bottom flush-top
          service-detail-header media-object-spacing-wrapper
          media-object-spacing-narrow container-pod-divider-inverse">
          <ServiceInfo service={this.props.service} />
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
