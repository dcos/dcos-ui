import deepEqual from 'deep-equal';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import LogView from '../../components/LogView';
import SystemLogStore from '../../../../../../src/js/stores/SystemLogStore';

const METHODS_TO_BIND = [
  'handleAtBottomChange',
  'handleFetchPreviousLog'
];

class TaskLogsTab extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: 'systemLog',
        events: ['success', 'error'],
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    let subscriptionID = SystemLogStore.startTailing(this.props.task.slave_id, {
      limit: 0,
      skip_prev: 11,
      params: {_TRANSPORT: 'syslog'}
    });

    this.setState({subscriptionID});
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !deepEqual(this.props, nextProps) ||
      !deepEqual(this.state, nextState);
  }

  componentWillUnmount() {
    SystemLogStore.stopTailing(this.state.subscriptionID);
  }

  handleFetchPreviousLog() {
    let {subscriptionID} = this.state;
    SystemLogStore.fetchLogRange(this.props.task.slave_id, {
      limit: 10,
      skip_prev: 11,
      params: {_TRANSPORT: 'syslog'},
      subscriptionID
    });
  }

  handleHasLoadedTop() {
    return SystemLogStore.hasLoadedTop();
  }

  handleAtBottomChange(isAtBottom) {
    let {subscriptionID} = this.state;
    if (isAtBottom) {
      SystemLogStore.startTailing(this.props.task.slave_id, {
        limit: 0,
        skip_prev: 11,
        params: {_TRANSPORT: 'syslog'},
        subscriptionID
      });
    } else {
      SystemLogStore.stopTailing(this.state.subscriptionID);
    }
  }

  render() {
    return (
      <LogView
        fullLog={SystemLogStore.getFullLog(this.state.subscriptionID)}
        fetchPreviousLogs={this.handleFetchPreviousLog}
        onAtBottomChange={this.handleAtBottomChange}
        hasLoadedTop={this.handleHasLoadedTop} />
    );
  }
}

module.exports = TaskLogsTab;
