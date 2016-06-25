import classNames from 'classnames';
import React from 'react';
import {Tooltip} from 'reactjs-components';

import HealthBarStates from '../constants/HealthBarStates';
import StatusBar from './StatusBar';

class HealthBar extends React.Component {

  getMappedTasksSummary(tasksSummary) {
    return Object.keys(tasksSummary).filter(function (task) {
      return task !== 'tasksRunning';
    }).map(function (taskStatus) {
      return {
        className: HealthBarStates[taskStatus].className,
        value: tasksSummary[taskStatus]
      };
    });
  }

  getTaskList(tasksSummary, instancesCount) {
    return Object.keys(tasksSummary).filter(function (task) {
      return tasksSummary[task] !== 0 && task !== 'tasksRunning';
    }).map(function (task, index) {
      let percentage = parseInt(tasksSummary[task] / instancesCount * 100, 10);

      let classSet = classNames(HealthBarStates[task].className, 'dot icon');

      return (
        <div key={index}>
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
    let {tasksSummary, instancesCount} = this.props;

    tasksSummary = this.getTaskList(tasksSummary, instancesCount)

    if (tasksSummary.length === 0) {
      return 'No Running Tasks';
    }

    return tasksSummary;
  }

  render() {
    let {tasksSummary, instancesCount} = this.props;

    if (tasksSummary == null) {
      return null;
    }

    return (
      <Tooltip interactive={true} content={this.renderToolTip()}>
        <StatusBar
          data={this.getMappedTasksSummary(tasksSummary)}
          scale={instancesCount}/>
      </Tooltip>
    );
  }
}

HealthBar.defaultProps = {
  instancesCount: null
};

HealthBar.propTypes = {
  instancesCount: React.PropTypes.number,
  tasksSummary: React.PropTypes.shape({
    tasksRunning: React.PropTypes.number,
    tasksHealthy: React.PropTypes.number,
    tasksStaged: React.PropTypes.number,
    tasksUnhealthy: React.PropTypes.number,
    tasksUnknown: React.PropTypes.number
  }).isRequired
};

module.exports = HealthBar;
