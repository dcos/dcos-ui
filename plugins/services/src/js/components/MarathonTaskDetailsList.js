import {DCOSStore} from 'foundation-ui';
import React from 'react';

import DescriptionList from '../../../../../src/js/components/DescriptionList';

class MarathonTaskDetailsList extends React.Component {
  getTaskPorts(task) {
    let {ports} = task;
    if (!ports || !ports.length) {
      return 'None';
    }

    return ports.join(', ');
  }

  getTaskStatus(task) {
    if (task == null || task.status == null) {
      return 'Unknown';
    }
    return task.status;
  }

  getTimeField(time) {
    let timeString = 'Never';

    if (time != null) {
      timeString = new Date(time).toLocaleString();
    }

    return (
      <time dateTime={time} title={time}>
        {timeString}
      </time>
    );
  }

  getMarathonTaskDetailsDescriptionList(task) {
    if (task == null) {
      return null;
    }

    let headerValueMapping = {
      'Host': task.host,
      'Ports': this.getTaskPorts(task),
      'Status': this.getTaskStatus(task),
      'Staged at': this.getTimeField(task.stagedAt),
      'Started at': this.getTimeField(task.startedAt),
      'Version': task.version
    };

    return (
      <DescriptionList
        hash={headerValueMapping}
        headline="Marathon Task Configuration" />
    );
  }

  getMarathonTaskHealthCheckResults(task) {
    if (task == null || task.healthCheckResults == null) {

      return null;
    }

    return task.healthCheckResults.map((result, i) =>{
      let consecutiveFailures = result.consecutiveFailures;
      let alive = 'Yes';

      if (consecutiveFailures == null) {
        consecutiveFailures = 'None';
      }

      if (!result.alive) {
        alive = 'No';
      }

      const headerValueMapping = {
        'First success': this.getTimeField(result.firstSuccess),
        'Last success': this.getTimeField(result.lastSuccess),
        'Last failure': this.getTimeField(result.lastFailure),
        'Consecutive failures': consecutiveFailures,
        'Alive': alive
      };

      return (
        <DescriptionList
          key={i}
          hash={headerValueMapping}
          headline={`Health Check Result ${i+1}`} />
      );
    });
  }

  render() {
    const marathonTask = DCOSStore.serviceTree.getTaskFromTaskID(this.props.taskID);
    const taskConfiguration =
      this.getMarathonTaskDetailsDescriptionList(marathonTask);
    const healthCheckResults =
      this.getMarathonTaskHealthCheckResults(marathonTask);

    return (
      <div>
        {taskConfiguration}
        {healthCheckResults}
      </div>
    );
  }
};

MarathonTaskDetailsList.propTypes = {
  taskID: React.PropTypes.string.isRequired
};

module.exports = MarathonTaskDetailsList;
