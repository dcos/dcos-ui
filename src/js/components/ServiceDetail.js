import mixin from 'reactjs-mixin';
import React from 'react';

import InternalStorageMixin from '../mixins/InternalStorageMixin';
import Service from '../structs/Service';
import ServiceDetailConfigurationTab from './ServiceDetailConfigurationTab';
import ServiceDetailTaskTab from './ServiceDetailTaskTab';
import ServiceInfo from './ServiceInfo';
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
    return (
      <ServiceDetailConfigurationTab service={this.props.service}/>
    );
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
        <div className="container-pod
          container-pod-divider-bottom-align-right
          container-pod-short-top flush-bottom flush-top
          service-detail-header media-object-spacing-wrapper
          media-object-spacing-narrow">
          <ServicesBreadcrumb serviceTreeItem={service} />
          <div className="flex-box control-group flex-grow">
            <ServiceInfo service={service} tabs={this.tabs_getUnroutedTabs()} />
            <div className="flex-grow flex-align-right">
              <div className="filter-bar-item">
                <button className="button button-stroke button-inverse">Scale</button>
              </div>
              <div className="filter-bar-item">
                <button className="button button-stroke button-inverse">Edit</button>
              </div>
              <div className="filter-bar-item">
                <button className="button button-stroke button-inverse">Suspend</button>
              </div>
              <div className="filter-bar-item">
                <button className="button button-stroke button-inverse">Destroy</button>
              </div>
            </div>
          </div>
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
