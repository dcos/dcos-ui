import classNames from "classnames";
import React from "react";
import { Table } from "reactjs-components";
import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";

import DateUtil from "#SRC/js/utils/DateUtil";

const taskStatus = [
  "getRunningTaskCount",
  "getHealthyTaskCount",
  "getUnhealthyTaskCount",
  "getStagedTaskCount"
];
const nameMapping = {
  startedAfterLastScaling: i18nMark("Started After Last Scaling"),
  withLatestConfig: i18nMark("With Latest Config"),
  withOutdatedConfig: i18nMark("With Outdated Config"),
  totalSummary: i18nMark("Total Summary")
};
const headerMapping = {
  getRunningTaskCount: i18nMark("RUNNING"),
  getHealthyTaskCount: i18nMark("HEALTHY"),
  getUnhealthyTaskCount: i18nMark("UNHEALTHY"),
  getStagedTaskCount: i18nMark("STAGED"),
  getMedianLifeTime: i18nMark("MEDIAN LIFETIME")
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
          return <Trans id={nameMapping[taskStats.getName()]} />;
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
    return (
      <Trans
        render="span"
        className="table-header-title"
        id={headerMapping[prop]}
      />
    );
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
    let label = i18nMark("seconds");
    const lifeTimeSeconds = taskStats[prop]();
    let timeValue = lifeTimeSeconds;

    if (lifeTimeSeconds > 3600) {
      label = i18nMark("minutes");
      timeValue = timeValue / 60;
    }

    // L10NTODO: Number
    timeValue = new Number(parseFloat(timeValue).toFixed()).toLocaleString();

    // L10NTODO: Relative time
    const humanReadable = DateUtil.getDuration(parseInt(lifeTimeSeconds, 10));

    return (
      <span>
        {timeValue} <Trans id={label} /> ({humanReadable})
      </span>
    );
  }

  render() {
    return (
      <Table
        className="table table-flush table-borderless-outer table-borderless-inner-columns table-hover flush-bottom"
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        data={this.props.taskStats.getList().getItems()}
      />
    );
  }
}

export default TaskStatsTable;
