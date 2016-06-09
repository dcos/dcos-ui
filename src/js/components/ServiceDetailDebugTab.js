import mixin from 'reactjs-mixin';
import moment from 'moment';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import DescriptionList from './DescriptionList';
import Service from '../structs/Service';

class ServiceDetailDebugTab extends React.Component {
  getValueText(value) {
    if (value == null || value === '') {
      return (
        <span className="text-mute">
          Unspecified
        </span>
      );
    }

    return (
      <span>{value}</span>
    );
  }

  getLastTaskFailureInfo() {
    let {lastTaskFailure} = this.props.service;
    if (lastTaskFailure == null) {
      return (
        <span className="text-mute">
          This app does not have failed tasks
        </span>
      );
    }

    const {version, timestamp, taskId, state, message, host} = lastTaskFailure;
    let timeStampText = 'Just now';
    if (new Date(timestamp) > Date.now()) {
      timeStampText = new moment(timestamp).fromNow();
    }
    let taskFailureValueMapping = {
      'Task id': this.getValueText(taskId),
      'State': this.getValueText(state),
      'Message': this.getValueText(message),
      'Host': this.getValueText(host),
      'Timestamp': <span>{timestamp} ({timeStampText})</span>,
      'Version': <span>{version} ({new moment(version).fromNow()})</span>
    };

    return (<DescriptionList hash={taskFailureValueMapping} />);
  }

  getLastVersionChange() {
    let {versionInfo} = this.props.service;
    if (versionInfo == null) {
      return (
        <span className="text-mute">
          This app does not have version change information
        </span>
      );
    }

    const {lastScalingAt, lastConfigChangeAt} = versionInfo;
    let lastScaling = 'No operation since last config change'
    if (lastScalingAt !== lastConfigChangeAt) {
      lastScaling = (
        <span>{lastScalingAt} ({new moment(lastScalingAt).fromNow()})</span>
      );
    }

    let LastVersionChangeValueMapping = {
      'Scale or Restart': lastScaling,
      'Configuration': (
        <span>
          {lastConfigChangeAt} ({new moment(lastConfigChangeAt).fromNow()})
        </span>
      )
    };

    return (<DescriptionList hash={LastVersionChangeValueMapping} />);
  }

  render() {
    return (
      <div>
        <h5 className="inverse flush-top">
          Last Changes
        </h5>
        {this.getLastVersionChange()}
        <h5 className="inverse flush-top">
          Last Task Failure
        </h5>
        {this.getLastTaskFailureInfo()}
      </div>
    );
  }
}

ServiceDetailDebugTab.contextTypes = {
  router: React.PropTypes.func
};

ServiceDetailDebugTab.propTypes = {
  service: React.PropTypes.instanceOf(Service)
};

module.exports = ServiceDetailDebugTab;
