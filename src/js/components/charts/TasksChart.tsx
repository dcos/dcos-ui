import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";

import classNames from "classnames";
import isEqual from "lodash.isequal";
import PropTypes from "prop-types";
import * as React from "react";
import createReactClass from "create-react-class";

import Chart from "./Chart";
import DialChart from "./DialChart";

const TASKS_PER_ROW = 3;
const TASK_INFO = {
  TASK_RUNNING: { label: i18nMark("Tasks running"), colorIndex: 4 },
  TASK_STAGING: { label: i18nMark("Tasks staging"), colorIndex: 1 },
};
const DISPLAYED_TASK_KEYS = Object.keys(TASK_INFO);

function getEmptyTaskData() {
  return DISPLAYED_TASK_KEYS.map((key) => ({
    name: key,
    colorIndex: TASK_INFO[key].colorIndex,
    value: 0,
  }));
}

const TasksChart = createReactClass({
  displayName: "TasksChart",

  propTypes: {
    // {TASK_RUNNING: 0, TASK_STAGING: 4}
    tasks: PropTypes.object.isRequired,
  },

  shouldComponentUpdate(nextProps) {
    const previousTasks = this.getTasks(this.props.tasks);
    const newTasks = this.getTasks(nextProps.tasks);

    // If equal, do not update
    return !isEqual(previousTasks, newTasks);
  },

  getTaskInfo(tasks) {
    if (tasks.length === 0) {
      tasks = getEmptyTaskData();
    }

    const numberOfTasks = DISPLAYED_TASK_KEYS.length;

    return DISPLAYED_TASK_KEYS.map((key) => {
      const info = TASK_INFO[key];
      let task = tasks.find((task) => task.name === key);
      if (task === undefined) {
        task = { value: 0 };
      }
      const classes = {
        "unit-bordered-horizontal-small text-align-center column-12": true,
      };
      // equalize columns for units
      if (numberOfTasks > TASKS_PER_ROW) {
        classes["column-small-4"] = true;
      } else {
        classes["column-small-" + 12 / numberOfTasks] = true;
      }
      const classSet = classNames(classes);

      return (
        <div key={key} className={classSet}>
          <p className="h1 unit flush-top">{task.value}</p>
          <Trans
            render={
              <p
                className={
                  "unit-label short-top flush-bottom path-color-" +
                  info.colorIndex
                }
              />
            }
            id={info.label}
          />
        </div>
      );
    });
  },

  getTotal(tasks: any[]) {
    return tasks.reduce((acc, task) => acc + task.value, 0);
  },

  getTasks(tasks = {}) {
    return DISPLAYED_TASK_KEYS.map((key) => ({
      colorIndex: TASK_INFO[key].colorIndex,
      name: key,
      value: tasks[key],
    }));
  },

  getDialChart(tasks) {
    const total = this.getTotal(tasks);

    if (tasks.length === 0) {
      tasks = getEmptyTaskData();
    }

    return (
      <DialChart data={tasks} slices={getEmptyTaskData()}>
        {this.getDialChartChildren(total)}
      </DialChart>
    );
  },

  getDialChartChildren(total: React.ReactNode) {
    return (
      <div className="description">
        <span className="unit unit-primary">{total}</span>
        <Trans
          render="span"
          className="unit-label h3 flush text-muted"
          id="Total Tasks"
        />
      </div>
    );
  },

  render() {
    const tasks = this.getTasks(this.props.tasks);

    return (
      <div className="chart">
        <Chart>{this.getDialChart(tasks)}</Chart>
        <div className="row">{this.getTaskInfo(tasks)}</div>
      </div>
    );
  },
});

export default TasksChart;
