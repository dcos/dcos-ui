import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import MesosStateStore from '../stores/MesosStateStore';
import Service from '../structs/Service';
import TaskView from './TaskView';

class ServiceDetailTaskTab extends mixin(StoreMixin) {

  constructor() {
    super(...arguments);

    this.store_listeners = [
      {name: 'state', events: ['success']}
    ];
  }

  render() {
    let tasks = MesosStateStore.getTasksByServiceId(this.props.service.getId());

    return (
      <TaskView tasks={tasks} inverseStyle={true}
        parentRouter={this.context.router} />
    );
  }
}

ServiceDetailTaskTab.contextTypes = {
  router: React.PropTypes.func
};

ServiceDetailTaskTab.propTypes = {
  service: React.PropTypes.instanceOf(Service)
};

module.exports = ServiceDetailTaskTab;
