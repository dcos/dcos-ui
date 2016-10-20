import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Loader from '../../../../../src/js/components/Loader';
import MesosStateStore from '../../../../../src/js/stores/MesosStateStore';
import RequestErrorMsg from '../../../../../src/js/components/RequestErrorMsg';
import Service from '../structs/Service';
import TasksContainer from './TasksContainer';

const METHODS_TO_BIND = [
  'onStateStoreSuccess',
  'onStateStoreError'
];

class ServiceTasksContainer extends mixin(StoreMixin) {

  constructor() {
    super(...arguments);

    this.state = {
      mesosStateErrorCount: 0
    };

    this.store_listeners = [
      {name: 'state', events: ['success', 'error']}
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onStateStoreSuccess() {
    if (this.state.mesosStateErrorCount !== 0) {
      this.setState({mesosStateErrorCount: 0});
    }
  }

  onStateStoreError() {
    this.setState({
      mesosStateErrorCount: this.state.mesosStateErrorCount + 1
    });
  }

  render() {
    const isLoading = Object.keys(
      MesosStateStore.get('lastMesosState')
    ).length === 0;

    const hasError = this.state.mesosStateErrorCount > 3;

    if (isLoading) {
      return <Loader />;
    }

    if (hasError) {
      return <RequestErrorMsg />;
    }

    let tasks = MesosStateStore.getTasksByService(this.props.service);

    return <TasksContainer tasks={tasks} />;
  }
}

ServiceTasksContainer.propTypes = {
  service: React.PropTypes.instanceOf(Service)
};

module.exports = ServiceTasksContainer;
