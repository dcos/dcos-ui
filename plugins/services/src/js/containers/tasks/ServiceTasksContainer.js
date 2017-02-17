import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Loader from '../../../../../../src/js/components/Loader';
import MesosStateStore from '../../../../../../src/js/stores/MesosStateStore';
import ContextualXHRError from '../../../../../../src/js/components/ContextualXHRError';
import Service from '../../structs/Service';
import TasksContainer from './TasksContainer';

const METHODS_TO_BIND = [
  'onStateStoreSuccess',
  'onStateStoreError'
];

class ServiceTasksContainer extends mixin(StoreMixin) {

  constructor() {
    super(...arguments);

    this.state = {
      lastUpdate: 0,
      mesosXHRError: null
    };

    this.store_listeners = [
      {name: 'state', events: ['success', 'error'], suppressUpdate: true}
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onStateStoreSuccess() {
    // Throttle updates
    if (Date.now() - this.state.lastUpdate > 1000
      || this.state.mesosXHRError) {

      this.setState({
        lastUpdate: Date.now(),
        mesosXHRError: null
      });
    }
  }

  onStateStoreError(xhr) {
    this.setState({
      mesosXHRError: xhr
    });
  }

  render() {
    const {
      mesosXHRError
    } = this.state;

    const isLoading = Object.keys(
      MesosStateStore.get('lastMesosState')
    ).length === 0;

    if (mesosXHRError) {
      return <ContextualXHRError xhr={mesosXHRError} />;
    }

    if (isLoading) {
      return <Loader />;
    }

    const {service} = this.props;
    const tasks = MesosStateStore.getTasksByService(service);

    return (
      <TasksContainer params={this.props.params}
        service={service}
        tasks={tasks} />
    );
  }
}

ServiceTasksContainer.propTypes = {
  service: React.PropTypes.instanceOf(Service),
  params: React.PropTypes.object.isRequired
};

module.exports = ServiceTasksContainer;
