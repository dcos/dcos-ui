var _ = require('underscore');
var classNames = require('classnames');
var React = require('react');

var Chart = require('./Chart');
var DialChart = require('./DialChart');

var tasksPerRow = 3;
var taskInfo = {
  'TASK_RUNNING': {label: 'Tasks running', colorIndex: 4},
  'TASK_STAGING': {label: 'Tasks staging', colorIndex: 1}
};

function getEmptyTaskData() {
  return _.map(taskInfo, function (val, key) {
    return {name: key, colorIndex: val.colorIndex, value: 0};
  });
}

var TasksChart = React.createClass({

  displayName: 'TasksChart',

  propTypes: {
    // {TASK_RUNNING: 0, TASK_STAGING: 4}
    tasks: React.PropTypes.object.isRequired
  },

  shouldComponentUpdate: function (nextProps) {
    var previousTasks = this.getTasks(this.props.tasks);
    var newTasks = this.getTasks(nextProps.tasks);

    // If equal, do not update
    return !_.isEqual(previousTasks, newTasks);
  },

  getTaskInfo: function (tasks) {
    if (tasks.length === 0) {
      tasks = getEmptyTaskData();
    }

    var numberOfTasks = _.size(taskInfo);

    return _.map(taskInfo, function (info, key) {
      var task = _.findWhere(tasks, {name: key});
      if (task === undefined) {
        task = { value: 0 };
      }
      var classes = {
        'text-align-center': true
      };
      // equalize columns for units
      if (numberOfTasks > tasksPerRow) {
        classes['column-small-4'] = true;
      } else {
        classes['column-small-' + 12 / numberOfTasks] = true;
      }
      var classSet = classNames(classes);
      return (
        <div key={key} className={classSet}>
          <p className="h1 unit inverse flush-top">
            {task.value}
          </p>
          <p className={'unit-label short-top tall-bottom path-color-' + info.colorIndex}>
            {info.label}
          </p>
        </div>
      );
    });
  },

  getTotal: function (tasks) {
    return _.reduce(tasks, function (acc, task) {
      return acc + task.value;
    }, 0);
  },

  getTasks: function (_tasks) {
    var validTasks = Object.keys(taskInfo);
    var tasks = _.pick(_tasks, validTasks);

    return _.map(tasks, function (value, key) {
      return {colorIndex: taskInfo[key].colorIndex, name: key, value: value};
    });
  },

  getDialChart: function (tasks) {
    var total = this.getTotal(tasks);

    if (tasks.length === 0) {
      tasks = getEmptyTaskData();
    }

    return (
      <DialChart
        data={tasks}
        slices={getEmptyTaskData()}>
        {this.getDialChartChildren(total)}
      </DialChart>
    );
  },

  getDialChartChildren: function (total) {
    return (
      <div className="description">
        <span className="h1 h1-large inverse flush flush-top unit">{total}</span>
        <span className="h4 unit-label short-top flush-bottom text-muted">{'Total Tasks'}</span>
      </div>
    );
  },

  render: function () {
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
