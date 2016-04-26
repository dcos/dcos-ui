import classNames from 'classnames';
import React from 'react';
import {Tooltip} from 'reactjs-components';

import HealthBarMap from '../constants/HealthBar';
import StatusBar from './StatusBar';

class HealthBar extends React.Component {
  static get defaultProps() {
    return {
      instancesCount: null
    };
  }

  renderToolTip() {
    let {tasks, instancesCount} = this.props;

    tasks = Object.keys(tasks).filter(function (task) {
      return tasks[task] !== 0 && task !== 'tasksRunning';
    }).map(function (task, index) {
      let percentage = parseInt(tasks[task] / instancesCount * 100, 10);

      let classSet = classNames(HealthBarMap[task].cssName, 'dot icon');

      return (
        <div key={index}>
          <span className={classSet}></span>
          {` ${tasks[task]} ${HealthBarMap[task].label} (${percentage} %)`}
        </div>
      );
    }).filter(function (item) {
      return item != null;
    });

    if (tasks.length === 0) {
      return 'No Running Tasks';
    }

    return tasks;
  }

  render() {
    let {tasks, instancesCount} = this.props;

    if (tasks == null) {
      return null;
    }

    tasks = Object.keys(tasks).filter(function (task) {
      return task !== 'tasksRunning';
    }).map(function (taskStatus) {
      return {className: HealthBarMap[taskStatus].cssName, value: tasks[taskStatus]};
    });

    return (
      <Tooltip content={this.renderToolTip()}>
        <StatusBar
          data={tasks}
          scale={instancesCount}/>
      </Tooltip>
    );
  }
}

HealthBar.propTypes = {
  instancesCount: React.PropTypes.number,
  tasks: React.PropTypes.object.isRequired
}

module.exports = HealthBar;
