import React from 'react';

import DateUtil from '../utils/DateUtil';
import DescriptionList from './DescriptionList';
import Service from '../structs/Service';
import TaskStatsTable from './TaskStatsTable';

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
    let lastTaskFailure = this.props.service.getLastTaskFailure();
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
    let versionInfo = this.props.service.getVersionInfo();
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

  getTaskStats() {
    let taskStats = this.props.service.getTaskStats();

    if (taskStats.getList().getItems().length === 0) {
      return (
        <p>This app does not have task statistics</p>
      );
    }

    return <TaskStatsTable taskStats={taskStats} />
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
        <h5 className="inverse flush-top">
          Task Statistics
        </h5>
        {this.getTaskStats()}
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
