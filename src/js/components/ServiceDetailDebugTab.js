import moment from 'moment';
import React from 'react';

import DateUtil from '../utils/DateUtil';
import DescriptionList from './DescriptionList';
import Service from '../structs/Service';

class ServiceDetailDebugTab extends React.Component {
  getValueText(value) {
    if (value == null || value === '') {
      return (
        <p>Unspecified</p>
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
        <p>This app does not have failed tasks</p>
      );
    }

    const {version, timestamp, taskId, state, message, host} = lastTaskFailure;
    let timeStampText = 'Just now';
    if (new Date(timestamp) > Date.now()) {
      timeStampText = DateUtil.msToRelativeTime(timestamp);
    }
    let taskFailureValueMapping = {
      'Task ID': this.getValueText(taskId),
      'State': this.getValueText(state),
      'Message': this.getValueText(message),
      'Host': this.getValueText(host),
      'Timestamp': <span>{timestamp} ({timeStampText})</span>,
      'Version': <span>{version} ({DateUtil.msToRelativeTime(version)})</span>
    };

    return <DescriptionList hash={taskFailureValueMapping} />;
  }

  getLastVersionChange() {
    let {versionInfo} = this.props.service;
    if (versionInfo == null) {
      return (
        <p>This app does not have version change information</p>
      );
    }

    const {lastScalingAt, lastConfigChangeAt} = versionInfo;
    let lastScaling = 'No operation since last config change'
    if (lastScalingAt !== lastConfigChangeAt) {
      lastScaling = (
        <span>
          {lastScalingAt} ({DateUtil.msToRelativeTime(lastScalingAt)})
        </span>
      );
    }

    let LastVersionChangeValueMapping = {
      'Scale or Restart': lastScaling,
      'Configuration': (
        <span>
          {lastConfigChangeAt} ({DateUtil.msToRelativeTime(lastConfigChangeAt)})
        </span>
      )
    };

    return <DescriptionList hash={LastVersionChangeValueMapping} />;
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
