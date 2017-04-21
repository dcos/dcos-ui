import classNames from "classnames";
import deepEqual from "deep-equal";
import React from "react";

import Chart from "./Chart";
import DialChart from "./DialChart";

const TASKS_PER_ROW = 3;
const TASK_INFO = {
  TASK_RUNNING: { label: "Tasks running", colorIndex: 4 },
  TASK_STAGING: { label: "Tasks staging", colorIndex: 1 }
};
const DISPLAYED_TASK_KEYS = Object.keys(TASK_INFO);

function getEmptyTaskData() {
  return DISPLAYED_TASK_KEYS.map(function(key) {
    return {
      name: key,
      colorIndex: TASK_INFO[key].colorIndex,
      value: 0
    };
  });
}

var TasksChart = React.createClass({
  displayName: "TasksChart",

  propTypes: {
    // {TASK_RUNNING: 0, TASK_STAGING: 4}
    tasks: React.PropTypes.object.isRequired
  },

  shouldComponentUpdate(nextProps) {
    var previousTasks = this.getTasks(this.props.tasks);
    var newTasks = this.getTasks(nextProps.tasks);

    // If equal, do not update
    return !deepEqual(previousTasks, newTasks);
  },

  getTaskInfo(tasks) {
    if (tasks.length === 0) {
      tasks = getEmptyTaskData();
    }

    var numberOfTasks = DISPLAYED_TASK_KEYS.length;

    return DISPLAYED_TASK_KEYS.map(function(key) {
      const info = TASK_INFO[key];
      var task = tasks.find(function(task) {
        return task.name === key;
      });
      if (task === undefined) {
        task = { value: 0 };
      }
      var classes = {
        "unit-bordered-horizontal-small text-align-center column-12": true
      };
      // equalize columns for units
      if (numberOfTasks > TASKS_PER_ROW) {
        classes["column-small-4"] = true;
      } else {
        classes["column-small-" + 12 / numberOfTasks] = true;
      }
      var classSet = classNames(classes);

      return (
        <div key={key} className={classSet}>
          <p className="h1 unit flush-top">
            {task.value}
          </p>
          <p
            className={
              "unit-label short-top flush-bottom path-color-" + info.colorIndex
            }
          >
            {info.label}
          </p>
        </div>
      );
    });
  },

  getTotal(tasks) {
    return tasks.reduce(function(acc, task) {
      return acc + task.value;
    }, 0);
  },

  getTasks(tasks = {}) {
    return DISPLAYED_TASK_KEYS.map(function(key) {
      return {
        colorIndex: TASK_INFO[key].colorIndex,
        name: key,
        value: tasks[key]
      };
    });
  },

  getDialChart(tasks) {
    var total = this.getTotal(tasks);

    if (tasks.length === 0) {
      tasks = getEmptyTaskData();
    }

    return (
      <DialChart data={tasks} slices={getEmptyTaskData()}>
        {this.getDialChartChildren(total)}
      </DialChart>
    );
  },

  getDialChartChildren(total) {
    return (
      <div className="description">
        <span className="unit unit-primary">{total}</span>
        <span className="unit-label h4 flush text-muted">Total Tasks</span>
      </div>
    );
  },

  render() {
    var tasks = this.getTasks(this.props.tasks);

    return (
      <div className="chart">
        <Chart>
          {this.getDialChart(tasks)}
        </Chart>
        <div className="row">
          {this.getTaskInfo(tasks)}
        </div>
      </div>
    );
  }
});

module.exports = TasksChart;
