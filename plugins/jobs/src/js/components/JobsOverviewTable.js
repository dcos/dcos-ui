import { Trans, DateFormat } from "@lingui/macro";
import classNames from "classnames";
import { Link } from "react-router";
import prettycron from "prettycron";
import PropTypes from "prop-types";
import React from "react";
import { Table, Tooltip } from "reactjs-components";

import Icon from "#SRC/js/components/Icon";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import TableUtil from "#SRC/js/utils/TableUtil";

import JobStates from "../constants/JobStates";
import JobStatus from "../constants/JobStatus";
import JobTableHeaderLabels from "../constants/JobTableHeaderLabels";

const METHODS_TO_BIND = ["renderHeadline", "jobSortFunction"];

// TODO: DCOS-38858
export default class JobsOverviewTable extends React.Component {
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
  /**
   * converts data from Job to table format.
   *
   * @param  {JobConnection} data
   * @returns {Array<{ id, idGroup, name, schedules, status, lastRun }>} object with data needed by Table Component
   */
  getData(data) {
    return Object.values(
      data.nodes.reduce((acc, job) => {
        /*
        * we can find out if current job is nested in another path by
        * comparing the job.path array with our given data.path
        *
        * we know already, that all jobs are in our given data.path -
        * no need to check for something like bar.bar.baz when data.path is "foo.bar"
        *
        * Example:
        * job.path = "foo.bar.baz";
        * data.path = "foo.bar";
        * => isGroup should be true, because there is "baz" as extra path below our prefix
        */
        const isGroup = job.path.slice(data.path.length).length > 0;
        let lastRun = {};
        let schedules = null;
        let status = null;
        let name = "";
        let id = "";

        if (!isGroup) {
          const lastRunsSummary = job.lastRunsSummary;

          lastRun = {
            status: job.lastRunStatus.status,
            lastSuccessAt: lastRunsSummary.lastSuccessAt,
            lastFailureAt: lastRunsSummary.lastFailureAt
          };

          schedules = job.schedules;
          status = job.scheduleStatus;
          name = job.name;
          id = job.id;
        } else {
          // now we need to extract this "baz" part from above and save it as name
          name = job.path.slice(data.path.length)[0];
          // and build up "next-level-link" (the `id` variable is named incorrectly to cut the refactoring)
          id = data.path.concat([name]).join(".");
        }

        // to avoid duplicates in our listing, we need to hack this… (again, this whole thing needs refactoring…)
        // we're getting an array back with the wrapping Object.values(…)
        acc[isGroup ? `path:${id}` : `job:${id}`] = {
          id,
          isGroup,
          name,
          schedules,
          status,
          lastRun
        };

        return acc;
      }, {})
    );
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

    if (schedules && schedules.nodes.length !== 0) {
      const schedule = schedules.nodes[0];

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
          <Trans render="span" className="text-success">
            Last Success:
          </Trans>{" "}
          <DateFormat
            value={new Date(lastSuccessAt)}
            format={{
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric"
            }}
          />
        </p>
      );
    }

    if (lastFailureAt != null) {
      nodes.push(
        <p className="flush-bottom" key="tooltip-failure-at">
          <Trans render="span" className="text-danger">
            Last Failure:
          </Trans>{" "}
          <DateFormat
            value={new Date(lastFailureAt)}
            format={{
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric"
            }}
          />
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

    return (
      <Trans
        render="span"
        className={statusClasses}
        id={jobState.displayName}
      />
    );
  }

  render() {
    return (
      <Table
        className="table table-flush table-borderless-outer table-borderless-inner-columns table-hover flush-bottom"
        colGroup={this.getColGroup()}
        columns={this.getColumns()}
        data={this.getData(this.props.data)}
        itemHeight={TableUtil.getRowHeight()}
        sortBy={{ prop: "name", order: "asc" }}
      />
    );
  }
}

JobsOverviewTable.propTypes = {
  data: PropTypes.object.isRequired // JobConnection
};
