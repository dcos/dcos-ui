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
        direction: 'append',
        error: null,
        events: ['success', 'error'],
        name: 'systemLog',
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
      skip_prev: 51,
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

  onSystemLogStoreSuccess(subscriptionID, direction) {
    if (subscriptionID !== this.state.subscriptionID) {
      return;
    }

    this.setState({direction});
  }

  onSystemLogStoreError(subscriptionID, data) {
    if (subscriptionID !== this.state.subscriptionID) {
      return;
    }

    this.setState({error: data});
  }

  handleFetchPreviousLog() {
    let {subscriptionID} = this.state;
    SystemLogStore.fetchLogRange(this.props.task.slave_id, {
      limit: 50,
      skip_prev: 51,
      params: {_TRANSPORT: 'syslog'},
      subscriptionID
    });
  }

  handleAtBottomChange(isAtBottom) {
    let {subscriptionID} = this.state;
    if (isAtBottom) {
      SystemLogStore.startTailing(this.props.task.slave_id, {
        limit: 0,
        skip_prev: 51,
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
        direction={this.state.direction}
        fullLog={SystemLogStore.getFullLog(this.state.subscriptionID)}
        fetchPreviousLogs={this.handleFetchPreviousLog}
        onAtBottomChange={this.handleAtBottomChange}
        hasLoadedTop={SystemLogStore.hasLoadedTop(this.state.subscriptionID)} />
    );
  }
}

module.exports = TaskLogsTab;
