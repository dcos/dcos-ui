import classNames from "classnames";
import React from "react";
import { Tooltip } from "reactjs-components";

import HealthBarStates from "../constants/HealthBarStates";
import StatusBar from "../../../../../src/js/components/StatusBar";

class HealthBar extends React.Component {
  getMappedTasksSummary(tasksSummary) {
    return Object.keys(tasksSummary)
      .filter(function(task) {
        return task !== "tasksRunning";
      })
      .map(function(taskStatus) {
        return {
          className: HealthBarStates[taskStatus].className,
          value: tasksSummary[taskStatus]
        };
      });
  }

  getTaskList(tasksSummary, instancesCount) {
    return Object.keys(tasksSummary)
      .filter(function(task) {
        return tasksSummary[task] !== 0 && task !== "tasksRunning";
      })
      .map(function(task, index) {
        const percentage = parseInt(
          tasksSummary[task] / instancesCount * 100,
          10
        );

        const classSet = classNames(
          HealthBarStates[task].className,
          "dot icon"
        );

        return (
          <div key={index} className="tooltip-line-item">
            <span className={classSet} />
            {` ${tasksSummary[task]} ${HealthBarStates[task].label} `}
            <span className="health-bar-tooltip-instances-total">
              of {instancesCount}
            </span>
            {` (${percentage}%)`}
          </div>
        );
      });
  }

  renderToolTip() {
    let { tasksSummary, instancesCount } = this.props;

    tasksSummary = this.getTaskList(
      tasksSummary,
      Math.max(tasksSummary.tasksRunning, instancesCount)
    );

    if (tasksSummary.length === 0) {
      return "No Running Tasks";
    }

    return tasksSummary;
  }

  render() {
    let { tasksSummary, instancesCount, isDeploying } = this.props;

    if (tasksSummary == null) {
      return null;
    }

    // This filters overCapacity ou
    tasksSummary = Object.keys(tasksSummary)
      .filter(function(key) {
        return key !== "tasksOverCapacity";
      })
      .reduce(function(memo, key) {
        memo[key] = tasksSummary[key];

        return memo;
      }, {});

    if (isDeploying) {
      tasksSummary = {
        tasksStaged: instancesCount
      };
    }

    return (
      <Tooltip interactive={true} content={this.renderToolTip()}>
        <StatusBar
          className="status-bar--large"
          data={this.getMappedTasksSummary(tasksSummary)}
          scale={instancesCount}
        />
      </Tooltip>
    );
  }
}

HealthBar.defaultProps = {
  isDeploying: false,
  instancesCount: null
};

HealthBar.propTypes = {
  isDeploying: React.PropTypes.bool,
  instancesCount: React.PropTypes.number,
  tasksSummary: React.PropTypes.shape({
    tasksRunning: React.PropTypes.number,
    tasksHealthy: React.PropTypes.number,
    tasksOverCapacity: React.PropTypes.number,
    tasksStaged: React.PropTypes.number,
    tasksUnhealthy: React.PropTypes.number,
    tasksUnknown: React.PropTypes.number
  }).isRequired
};

module.exports = HealthBar;
