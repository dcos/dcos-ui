import { DCOSStore } from "foundation-ui";
import React from "react";

import ConfigurationMapHeading
  from "../../../../../src/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel
  from "../../../../../src/js/components/ConfigurationMapLabel";
import ConfigurationMapRow
  from "../../../../../src/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "../../../../../src/js/components/ConfigurationMapSection";
import ConfigurationMapValue
  from "../../../../../src/js/components/ConfigurationMapValue";

class MarathonTaskDetailsList extends React.Component {
  getTaskPorts(task) {
    const { ports } = task;
    if (!ports || !ports.length) {
      return "None";
    }

    return ports.join(", ");
  }

  getTaskStatus(task) {
    if (task == null || task.status == null) {
      return "Unknown";
    }

    return task.status;
  }

  getTimeField(time) {
    let timeString = "Never";

    if (time != null) {
      timeString = new Date(time).toLocaleString();
    }

    return (
      <time dateTime={time} title={time}>
        {timeString}
      </time>
    );
  }

  getMarathonTaskDetails(task) {
    if (task == null) {
      return null;
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>
          Marathon Task Configuration
        </ConfigurationMapHeading>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Host
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {task.host}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Ports
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getTaskPorts(task)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Status
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getTaskStatus(task)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Staged at
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getTimeField(task.stagedAt)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Started at
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {this.getTimeField(task.startedAt)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Version
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {task.version}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getMarathonTaskHealthCheckResults(task) {
    if (task == null || task.healthCheckResults == null) {
      return null;
    }

    return task.healthCheckResults.map((result, i) => {
      let consecutiveFailures = result.consecutiveFailures;
      let alive = "Yes";

      if (consecutiveFailures == null) {
        consecutiveFailures = "None";
      }

      if (!result.alive) {
        alive = "No";
      }

      return (
        <ConfigurationMapSection key={i}>
          <ConfigurationMapHeading>
            Health Check Result {i + 1}
          </ConfigurationMapHeading>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              First success
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              {this.getTimeField(result.firstSuccess)}
            </ConfigurationMapValue>
          </ConfigurationMapRow>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              Last success
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              {this.getTimeField(result.lastSuccess)}
            </ConfigurationMapValue>
          </ConfigurationMapRow>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              Last failure
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              {this.getTimeField(result.lastFailure)}
            </ConfigurationMapValue>
          </ConfigurationMapRow>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              Consecutive failures
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              {consecutiveFailures}
            </ConfigurationMapValue>
          </ConfigurationMapRow>
          <ConfigurationMapRow>
            <ConfigurationMapLabel>
              Alive
            </ConfigurationMapLabel>
            <ConfigurationMapValue>
              {alive}
            </ConfigurationMapValue>
          </ConfigurationMapRow>
        </ConfigurationMapSection>
      );
    });
  }

  render() {
    const marathonTask = DCOSStore.serviceTree.getTaskFromTaskID(
      this.props.taskID
    );
    const taskConfiguration = this.getMarathonTaskDetails(marathonTask);
    const healthCheckResults = this.getMarathonTaskHealthCheckResults(
      marathonTask
    );

    return (
      <ConfigurationMapSection>
        {taskConfiguration}
        {healthCheckResults}
      </ConfigurationMapSection>
    );
  }
}

MarathonTaskDetailsList.propTypes = {
  taskID: React.PropTypes.string.isRequired
};

module.exports = MarathonTaskDetailsList;
