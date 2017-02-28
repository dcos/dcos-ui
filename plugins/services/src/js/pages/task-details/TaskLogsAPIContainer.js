import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import ConfigStore from '../../../../../../src/js/stores/ConfigStore';
import Loader from '../../../../../../src/js/components/Loader';
import {SYSTEM_LOGS} from '../../../../../../src/js/constants/MesosLoggingStrategy';
import TaskSystemLogsContainer from './TaskSystemLogsContainer';
import TaskFileViewer from './TaskFileViewer';
import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';

class TaskLogsAPIContainer extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);
    this.state = {
      isLoading: true
    };

    this.store_listeners = [{
      name: 'config',
      events: ['success', 'error'],
      listenAlways: false
    }];
  }

  componentWillMount() {
    // We already have a configuration, so stop loading. No need to fetch
    if (this.state.isLoading && ConfigStore.get('config') != null) {
      this.setState({isLoading: false});
    }
  }

  componentDidMount() {
    // We did not already receive the configuration
    if (this.state.isLoading && ConfigStore.get('config') == null) {
      ConfigStore.fetch();
    }
  }

  onConfigStoreSuccess() {
    this.setState({isLoading: false});
  }

  onConfigStoreError() {
    this.setState({isLoading: false});
  }

  render() {
    if (this.state.isLoading) {
      return <Loader />;
    }

    const {props} = this;
    const config = ConfigStore.get('config');
    const useSystemLogsAPI = findNestedPropertyInObject(
      config,
      'uiConfiguration.plugins.mesos.logging-strategy'
    ) === SYSTEM_LOGS;

    if (useSystemLogsAPI) {
      return <TaskSystemLogsContainer {...props} />;
    }

    return <TaskFileViewer limitLogFiles={['stdout', 'stderr']} {...props} />;
  }
}

module.exports = TaskLogsAPIContainer;
