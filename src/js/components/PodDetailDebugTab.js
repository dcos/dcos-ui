import React from 'react';

import DescriptionList from './DescriptionList';
import Pod from '../structs/Pod';
import TimeAgo from './TimeAgo';

class PodDetailDebugTab extends React.Component {
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
    let lastTaskFailure = this.props.pod.getLastUpdated();
    if (lastTaskFailure == null) {
      return (
        <p>This app does not have failed tasks</p>
      );
    }

    const {version, timestamp, taskId, state, message, host} = lastTaskFailure;
    let taskFailureValueMapping = {
      'Task ID': this.getValueText(taskId),
      'State': this.getValueText(state),
      'Message': this.getValueText(message),
      'Host': this.getValueText(host),
      'Timestamp': (
        <span>
          {timestamp} (<TimeAgo time={new Date(timestamp)} />)
        </span>
      ),
      'Version': <span>{version} (<TimeAgo time={new Date(version)} />)</span>
    };

    return <DescriptionList hash={taskFailureValueMapping} />;
  }

  getLastVersionChange() {
    let {pod} = this.props;
    let podSpec = pod.getSpec();
    let lastConfigChangeAt = podSpec.getVersion();
    let lastScalingAt = pod.getLastUpdated();

    let lastScaling = 'No operation since last config change';
    if (lastScalingAt !== lastConfigChangeAt) {
      lastScaling = (
        <span>
          {lastScalingAt.toLocaleString()} (<TimeAgo time={new Date(lastScalingAt)} />)
        </span>
      );
    }

    let LastVersionChangeValueMapping = {
      'Scale or Restart': lastScaling,
      'Configuration': (
        <span>
          {lastConfigChangeAt.toLocaleString()} (<TimeAgo time={new Date(lastConfigChangeAt)} />)
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
      </div>
    );
  }
}

PodDetailDebugTab.contextTypes = {
  router: React.PropTypes.func
};

PodDetailDebugTab.propTypes = {
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodDetailDebugTab;
