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
      'text-align-right': taskStatus.includes(prop),
      'hidden-mini': taskStatus.includes(prop)
    });
  }

  getColumns() {
    let getClassName = this.getClassName;
    let heading = this.renderHeading;

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

  renderHeading(prop) {
    let headerMapping = {
      caption: '',
      running: 'Running',
      healthy: 'Healthy',
      unhealthy: 'Unhealthy',
      staged: 'Staged',
      averageSeconds: 'Average Seconds',
      medianSeconds: 'Median Seconds'
    }

    return (
      <span className="table-header-title">{headerMapping[prop]}</span>
    );
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
