import classNames from 'classnames';
import moment from 'moment';
import React from 'react';
import {Table} from 'reactjs-components';

const taskStatus = ['running','healthy','unhealthy','staged'];
const keyCaptionMap = {
  startedAfterLastScaling: 'Started After Last Scaling',
  withLatestConfig: 'With Latest Config',
  withOutdatedConfig: 'With Outdated Config',
  totalSummary: 'Total Summary'
};

class TaskStatsTable extends React.Component {
  getTaskStats() {
    let {taskStats} = this.props;

    let data = [];
    Object.keys(keyCaptionMap).forEach(function (key) {
      if (!taskStats[key]) {
        return;
      }

      data.push(Object.assign({}, {caption: keyCaptionMap[key]}, taskStats[key].stats));
    });

    return data;
  }

  getClassName(prop, sortBy, row) {
    return classNames({
      'highlight': prop === sortBy.prop,
      'clickable': row == null, // this is a header
      'text-align-right': taskStatus.includes(prop),
      'hidden-mini': taskStatus.includes(prop)
    });
  }

  getColumns() {
    let getClassName = this.getClassName;
    let heading = this.renderHeading({
      caption: '',
      running: 'Running',
      healthy: 'Healthy',
      unhealthy: 'Unhealthy',
      staged: 'Staged',
      averageSeconds: 'Average Seconds',
      medianSeconds: 'Median Seconds'
    });

    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'caption',
        render: function (prop, taskStats) {
          return taskStats[prop];
        },
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'running',
        render: this.getStatus,
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'healthy',
        render: this.getStatus,
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'unhealthy',
        render: this.getStatus,
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'staged',
        render: this.getStatus,
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'averageSeconds',
        render: this.renderTime,
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'medianSeconds',
        render: this.renderTime,
        sortable: false
      }
    ];
  }

  renderHeading(config) {
    return function (prop, order, sortBy) {
      let title = config[prop];
      let caret = {
        before: null,
        after: null
      };
      let caretClassSet = classNames(
        `caret caret--${order}`,
        {'caret--visible': prop === sortBy.prop}
      );

      if (taskStatus.includes(prop)) {
        caret.before = <span className={caretClassSet} />;
      } else {
        caret.after = <span className={caretClassSet} />;
      }

      return (
        <span>
          {caret.before}
          <span className="table-header-title">{title}</span>
          {caret.after}
        </span>
      );
    };
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '20%'}} />
        <col style={{width: '95px'}} className="hidden-mini" />
        <col style={{width: '90px'}} className="hidden-mini" />
        <col style={{width: '105px'}} className="hidden-mini" />
        <col style={{width: '90px'}} className="hidden-mini" />
        <col />
        <col />
      </colgroup>
    );
  }

  getStatus(prop, taskStats) {
    return taskStats.counts[prop];
  }

  renderTime(prop, taskStats) {
    let lifeTimeSeconds = taskStats.lifeTime[prop];
    let seconds = new Number(parseFloat(lifeTimeSeconds).toFixed(2))
      .toLocaleString();
    let humanReadable = moment.duration(
      parseInt(lifeTimeSeconds),
      'seconds'
    ).humanize();

    return `${seconds} sec (${humanReadable})`;
  }

  render() {
    return (
      <Table
        className="table inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        data={this.getTaskStats()} />
    );
  }
}

module.exports = TaskStatsTable;
