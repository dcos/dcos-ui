import classNames from "classnames";
import React from "react";
import { Table } from "reactjs-components";

import DateUtil from "../../../../../../src/js/utils/DateUtil";

const taskStatus = [
  "getRunningTaskCount",
  "getHealthyTaskCount",
  "getUnhealthyTaskCount",
  "getStagedTaskCount"
];
const nameMapping = {
  startedAfterLastScaling: "Started After Last Scaling",
  withLatestConfig: "With Latest Config",
  withOutdatedConfig: "With Outdated Config",
  totalSummary: "Total Summary"
};
const headerMapping = {
  getRunningTaskCount: "RUNNING",
  getHealthyTaskCount: "HEALTHY",
  getUnhealthyTaskCount: "UNHEALTHY",
  getStagedTaskCount: "STAGED",
  getMedianLifeTime: "MEDIAN LIFETIME"
};

class TaskStatsTable extends React.Component {
  getClassName(prop, sortBy) {
    const shouldAlignRight =
      taskStatus.includes(prop) || prop === "getMedianLifeTime";

    return classNames({
      active: prop === sortBy.prop,
      "text-align-right": shouldAlignRight,
      "hidden-small-down": taskStatus.includes(prop)
    });
  }

  getColumns() {
    const getClassName = this.getClassName;
    const heading = this.renderHeading;

    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: "getName",
        render(prop, taskStats) {
          return nameMapping[taskStats.getName()];
        },
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: "getRunningTaskCount",
        render: this.getStatus,
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: "getHealthyTaskCount",
        render: this.getStatus,
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: "getUnhealthyTaskCount",
        render: this.getStatus,
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: "getStagedTaskCount",
        render: this.getStatus,
        sortable: false
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        heading,
        prop: "getMedianLifeTime",
        render: this.renderTime,
        sortable: false
      }
    ];
  }

  renderHeading(prop) {
    return <span className="table-header-title">{headerMapping[prop]}</span>;
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{ width: "20%" }} />
        <col style={{ width: "95px" }} className="hidden-small-down" />
        <col style={{ width: "90px" }} className="hidden-small-down" />
        <col style={{ width: "105px" }} className="hidden-small-down" />
        <col style={{ width: "90px" }} className="hidden-small-down" />
        <col />
      </colgroup>
    );
  }

  getStatus(prop, taskStats) {
    return taskStats[prop]();
  }

  renderTime(prop, taskStats) {
    let label = "seconds";
    const lifeTimeSeconds = taskStats[prop]();
    let timeValue = lifeTimeSeconds;

    if (lifeTimeSeconds > 3600) {
      label = "minutes";
      timeValue = timeValue / 60;
    }

    timeValue = new Number(parseFloat(timeValue).toFixed()).toLocaleString();

    const humanReadable = DateUtil.getDuration(parseInt(lifeTimeSeconds, 10));

    return `${timeValue} ${label} (${humanReadable})`;
  }

  render() {
    return (
      <Table
        className="table table-simple table-borderless-outer table-borderless-inner-columns flush-bottom"
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        data={this.props.taskStats.getList().getItems()}
      />
    );
  }
}

module.exports = TaskStatsTable;
