import classNames from 'classnames';
import DateUtil from '../utils/DateUtil';
import React from 'react';
import {Table} from 'reactjs-components';

const taskStatus = [
  'getRunningTaskCount',
  'getHealthyTaskCount',
  'getUnhealthyTaskCount',
  'getStagedTaskCount'
];
const nameMapping = {
  startedAfterLastScaling: 'Started After Last Scaling',
  withLatestConfig: 'With Latest Config',
  withOutdatedConfig: 'With Outdated Config',
  totalSummary: 'Total Summary'
};
const headerMapping = {
  getRunningTaskCount: 'Running',
  getHealthyTaskCount: 'Healthy',
  getUnhealthyTaskCount: 'Unhealthy',
  getStagedTaskCount: 'Staged',
  getAverageLifeTime: 'Average Seconds',
  getMedianLifeTime: 'Median Seconds'
}

class TaskStatsTable extends React.Component {
  getClassName(prop, sortBy) {
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
        prop: 'getName',
        render: function (prop, taskStats) {
          return nameMapping[taskStats.getName()];
        },
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'getRunningTaskCount',
        render: this.getStatus,
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'getHealthyTaskCount',
        render: this.getStatus,
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'getUnhealthyTaskCount',
        render: this.getStatus,
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'getStagedTaskCount',
        render: this.getStatus,
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'getAverageLifeTime',
        render: this.renderTime,
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: 'getMedianLifeTime',
        render: this.renderTime,
        sortable: false
      }
    ];
  }

  renderHeading(prop) {
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
    return taskStats[prop]();
  }

  renderTime(prop, taskStats) {
    let lifeTimeSeconds = taskStats[prop]();
    let seconds = new Number(parseFloat(lifeTimeSeconds).toFixed(2))
      .toLocaleString();
    let humanReadable = DateUtil.getDuration(parseInt(lifeTimeSeconds));

    return `${seconds} sec (${humanReadable})`;
  }

  render() {
    return (
      <Table
        className="table inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        data={this.props.taskStats.getList().getItems()} />
    );
  }
}

module.exports = TaskStatsTable;
