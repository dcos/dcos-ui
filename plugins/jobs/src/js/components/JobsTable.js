import classNames from "classnames";
import { Link } from "react-router";
import prettycron from "prettycron";
import PropTypes from "prop-types";
import React from "react";
import { Table, Tooltip } from "reactjs-components";

import Icon from "#SRC/js/components/Icon";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import TableUtil from "#SRC/js/utils/TableUtil";
import Tree from "#SRC/js/structs/Tree";

import JobStates from "../constants/JobStates";
import JobStatus from "../constants/JobStatus";
import JobTableHeaderLabels from "../constants/JobTableHeaderLabels";

const METHODS_TO_BIND = ["renderHeadline", "jobSortFunction"];

class JobsTable extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getColGroup() {
    return (
      <colgroup>
        <col />
        <col style={{ width: "20%" }} />
        <col style={{ width: "20%" }} />
      </colgroup>
    );
  }

  getColumns() {
    const className = ResourceTableUtil.getClassName;
    const heading = ResourceTableUtil.renderHeading(JobTableHeaderLabels);

    return [
      {
        className,
        heading,
        headerClassName: className,
        prop: "name",
        render: this.renderHeadline,
        sortable: true,
        sortFunction: this.jobSortFunction
      },
      {
        className,
        heading,
        headerClassName: className,
        prop: "status",
        render: this.renderStatusColumn,
        sortable: true,
        sortFunction: this.jobSortFunction
      },
      {
        className,
        heading,
        headerClassName: className,
        prop: "lastRun",
        render: this.renderLastRunStatusColumn,
        sortable: true,
        sortFunction: this.jobSortFunction
      }
    ];
  }

  // TODO: DCOS-7766 Revisit this pre-rendering data transformation...
  getData() {
    return this.props.jobs.map(function(job) {
      const isGroup = job instanceof Tree;
      let lastRun = {};
      let schedules = null;
      let status = null;

      if (!isGroup) {
        const lastRunsSummary = job.getLastRunsSummary();

        lastRun = {
          status: job.getLastRunStatus().status,
          lastSuccessAt: lastRunsSummary.lastSuccessAt,
          lastFailureAt: lastRunsSummary.lastFailureAt
        };

        schedules = job.getSchedules();
        status = job.getScheduleStatus();
      }

      return {
        id: job.getId(),
        isGroup,
        name: job.getName(),
        schedules,
        status,
        lastRun
      };
    });
  }

  getCompareFunctionByProp(prop) {
    switch (prop) {
      case "name":
        return (a, b) => a.name.localeCompare(b.name);
      case "status":
        return (a, b) =>
          JobStates[a.status].sortOrder - JobStates[b.status].sortOrder;
      case "lastRun":
        return (a, b) =>
          JobStatus[a.lastRun.status].sortOrder -
          JobStatus[b.lastRun.status].sortOrder;
    }
  }

  jobSortFunction(prop, direction) {
    const compareFunction = this.getCompareFunctionByProp(prop);
    let score = 1;

    if (direction === "desc") {
      score = -1;
    }

    return function(a, b) {
      // Hoist group trees to the top
      if (a.isGroup && !b.isGroup) {
        return score * -1;
      } else if (b.isGroup && !a.isGroup) {
        return score;
      }

      return compareFunction(a, b);
    };
  }

  renderHeadline(prop, job) {
    const { id, isGroup, name, schedules } = job;
    let scheduleIcon = null;
    let url = `/jobs/detail/${encodeURIComponent(id)}`;
    let itemImage = (
      <Icon
        className="icon-margin-right"
        color="grey"
        id="page-document"
        size="mini"
      />
    );

    if (isGroup) {
      url = `/jobs/overview/${encodeURIComponent(id)}`;

      itemImage = (
        <Icon
          className="icon-margin-right"
          color="grey"
          id="folder"
          size="mini"
        />
      );
    }

    if (schedules && schedules.length !== 0) {
      const schedule = schedules[0];

      if (schedule.enabled) {
        scheduleIcon = (
          <Tooltip
            wrapperClassName="tooltip-wrapper icon-margin-left"
            content={prettycron.toString(schedule.cron)}
            maxWidth={250}
            wrapText={true}
          >
            <Icon color="grey" id="repeat" size="mini" />
          </Tooltip>
        );
      }
    }

    return (
      <div
        className="job-table-heading flex-box
        flex-box-align-vertical-center table-cell-flex-box"
      >
        <Link to={url} className="table-cell-icon">
          {itemImage}
        </Link>
        <Link
          to={url}
          className="table-cell-link-primary table-cell-value flex-box flex-box-col"
        >
          <span className="text-overflow">{name}</span>
          {scheduleIcon}
        </Link>
      </div>
    );
  }

  renderLastRunStatusColumn(prop, row) {
    const { lastFailureAt, lastSuccessAt, status } = row[prop];
    const statusClasses = classNames({
      "text-success": status === "Success",
      "text-danger": status === "Failed"
    });
    const nodes = [];
    const statusNode = <span className={statusClasses}>{status}</span>;

    if (lastFailureAt == null && lastSuccessAt == null) {
      return statusNode;
    }

    if (lastSuccessAt != null) {
      nodes.push(
        <p className="flush-bottom" key="tooltip-success-at">
          <span className="text-success">Last Success: </span>
          {new Date(lastSuccessAt).toLocaleString()}
        </p>
      );
    }

    if (lastFailureAt != null) {
      nodes.push(
        <p className="flush-bottom" key="tooltip-failure-at">
          <span className="text-danger">Last Failure: </span>
          {new Date(lastFailureAt).toLocaleString()}
        </p>
      );
    }

    return (
      <Tooltip wrapperClassName="tooltip-wrapper" content={nodes}>
        {statusNode}
      </Tooltip>
    );
  }

  renderStatusColumn(prop, col) {
    const { [prop]: statusKey, isGroup } = col;
    if (isGroup) {
      return null;
    }

    const jobState = JobStates[statusKey];

    const statusClasses = classNames({
      "text-success": jobState.stateTypes.includes("success"),
      "text-danger": jobState.stateTypes.includes("failure")
    });

    return <span className={statusClasses}>{jobState.displayName}</span>;
  }

  render() {
    return (
      <Table
        className="table table-flush table-borderless-outer table-borderless-inner-columns table-hover flush-bottom"
        colGroup={this.getColGroup()}
        columns={this.getColumns()}
        data={this.getData()}
        itemHeight={TableUtil.getRowHeight()}
        sortBy={{ prop: "name", order: "asc" }}
      />
    );
  }
}

JobsTable.propTypes = {
  jobs: PropTypes.array.isRequired
};

module.exports = JobsTable;
