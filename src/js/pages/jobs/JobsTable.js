import classNames from "classnames";
import { Link } from "react-router";
import prettycron from "prettycron";
import React from "react";
import { ResourceTableUtil } from "foundation-ui";
import { Table, Tooltip } from "reactjs-components";

import Icon from "../../components/Icon";
import JobStates from "../../constants/JobStates";
import JobTableHeaderLabels from "../../constants/JobTableHeaderLables";
import TableUtil from "../../utils/TableUtil";
import Tree from "../../structs/Tree";

const METHODS_TO_BIND = ["renderHeadline"];

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
        sortFunction: this.sortJobNames
      },
      {
        className,
        heading,
        headerClassName: className,
        prop: "status",
        render: this.renderStatusColumn,
        sortable: false
      },
      {
        className,
        heading,
        headerClassName: className,
        prop: "lastRun",
        render: this.renderLastRunStatusColumn
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

  sortJobNames(prop, direction) {
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

      return a.name.localeCompare(b.name);
    };
  }

  renderHeadline(prop, job) {
    let { id, isGroup, name, schedules } = job;
    let itemImage = null;
    let scheduleIcon = null;

    id = encodeURIComponent(id);

    if (isGroup) {
      itemImage = (
        <Icon
          className="icon-margin-right"
          color="grey"
          id="folder"
          size="mini"
        />
      );
    } else {
      itemImage = (
        <Icon
          className="icon-margin-right"
          color="grey"
          id="page-document"
          size="mini"
        />
      );
    }

    if (schedules && schedules.length !== 0) {
      const schedule = schedules[0];

      if (schedule.enabled) {
        scheduleIcon = (
          <Tooltip
            wrapperClassName="tooltip-wrapper icon icon-margin-left"
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
      <div className="job-table-heading flex-box
        flex-box-align-vertical-center table-cell-flex-box">
        <Link to={`/jobs/${id}`} className="table-cell-icon">
          {itemImage}
        </Link>
        <Link
          to={`/jobs/${id}`}
          className="table-cell-link-primary table-cell-value flex-box flex-box-col"
        >
          <span className="text-overflow">
            {name}
          </span>
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
      "text-danger": jobState.stateTypes.includes("failure"),
      "text-color-white": jobState.stateTypes.includes("active")
    });

    return <span className={statusClasses}>{jobState.displayName}</span>;
  }

  render() {
    return (
      <Table
        className="table table-borderless-outer table-borderless-inner-columns flush-bottom"
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
  jobs: React.PropTypes.array.isRequired
};

module.exports = JobsTable;
