import classNames from "classnames";
import { Link } from "react-router";
import React from "react";

import moment from "moment";

import CollapsingString from "../../components/CollapsingString";
import CheckboxTable from "../../components/CheckboxTable";
import ExpandingTable from "../../components/ExpandingTable";
import FilterBar from "../../components/FilterBar";
import FilterHeadline from "../../components/FilterHeadline";
import Icon from "../../components/Icon";
import JobStates from "../../constants/JobStates";
import JobStopRunModal from "../../components/modals/JobStopRunModal";
import TaskStates
  from "../../../../plugins/services/src/js/constants/TaskStates";
import TimeAgo from "../../components/TimeAgo";

const columnClasses = {
  checkbox: "job-run-history-table-column-checkbox",
  jobID: "job-run-history-table-column-id",
  status: "job-run-history-table-column-status",
  startedAt: "job-run-history-table-column-started",
  finishedAt: "job-run-history-table-column-finished",
  runTime: "job-run-history-table-column-run-time"
};

const METHODS_TO_BIND = [
  "renderJobIDColumn",
  "handleItemCheck",
  "handleStopClick",
  "handleStopJobRunModalClose",
  "handleStopJobRunSuccess"
];

function calculateRunTime(startedAt, finishedAt) {
  if (finishedAt == null) {
    return null;
  }

  return finishedAt - startedAt;
}

class JobRunHistoryTable extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      checkedItems: {},
      isStopRunModalShown: null
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleItemCheck(idsChecked) {
    const checkedItems = {};

    idsChecked.forEach(function(id) {
      checkedItems[id] = true;
    });
    this.setState({ checkedItems });
  }

  handleStopClick() {
    this.setState({ isStopRunModalShown: true });
  }

  handleStopJobRunModalClose() {
    this.setState({ isStopRunModalShown: false });
  }

  handleStopJobRunSuccess() {
    this.setState({ checkedItems: {}, isStopRunModalShown: false });
  }

  getColGroup() {
    return (
      <colgroup>
        <col className={columnClasses.checkbox} />
        <col className={columnClasses.jobID} />
        <col className={columnClasses.status} />
        <col className={columnClasses.startedAt} />
        <col className={columnClasses.finishedAt} />
        <col className={columnClasses.runTime} />
      </colgroup>
    );
  }

  getColumnHeading(prop, order, sortBy) {
    const caretClassNames = classNames("caret", {
      [`caret--${order}`]: order != null,
      "caret--visible": prop === sortBy.prop
    });

    const headingStrings = {
      jobID: "Job ID",
      status: "Status",
      startedAt: "Started",
      finishedAt: "Finished",
      runTime: "Run Time"
    };

    return (
      <span>
        {headingStrings[prop]}
        <span className={caretClassNames} />
      </span>
    );
  }

  getColumnClassName(prop, sortBy, row) {
    return classNames(columnClasses[prop], {
      active: prop === sortBy.prop,
      clickable: row == null
    });
  }

  getColumns() {
    return [
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "jobID",
        render: this.renderJobIDColumn,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "status",
        render: this.renderStatusColumn,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "startedAt",
        render: this.renderTimeColumn,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "finishedAt",
        render: this.renderTimeColumn,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "runTime",
        render: this.renderRunTimeColumn,
        sortable: true
      }
    ];
  }

  // TODO: DCOS-7766 Revisit this pre-rendering data transformation...
  getData(job) {
    const jobRuns = job.getJobRuns();

    return jobRuns.getItems().map(function(jobRun) {
      const children = jobRun.getTasks().getItems().map(function(jobTask) {
        const startedAt = jobTask.getDateStarted();
        const finishedAt = jobTask.getDateCompleted();
        const runTime = calculateRunTime(startedAt, finishedAt);

        return {
          taskID: jobTask.getTaskID(),
          status: jobTask.getStatus(),
          startedAt,
          finishedAt,
          runTime
        };
      });

      const startedAt = jobRun.getDateCreated();
      const finishedAt = jobRun.getDateFinished();
      const runTime = calculateRunTime(startedAt, finishedAt);

      return {
        finishedAt: jobRun.getDateFinished(),
        id: jobRun.id,
        jobID: jobRun.getJobID(),
        startedAt: jobRun.getDateCreated(),
        status: jobRun.getStatus(),
        runTime,
        children
      };
    });
  }

  getDisabledItemsMap(job) {
    return job.getJobRuns().getItems().reduce(function(memo, jobRun) {
      const isDisabled =
        ["ACTIVE", "INITIAL", "STARTING"].indexOf(jobRun.getStatus()) < 0;
      memo[jobRun.get("id")] = isDisabled;

      return memo;
    }, {});
  }

  getStopButton(hasCheckedTasks) {
    if (!hasCheckedTasks) {
      return null;
    }

    return (
      <div className="button-collection flush-bottom">
        <div
          className="button button-stroke button-danger"
          onClick={this.handleStopClick}
        >
          Stop
        </div>
      </div>
    );
  }

  getStopRunModal(checkedItems, hasCheckedTasks) {
    if (!hasCheckedTasks) {
      return null;
    }

    const { isStopRunModalShown } = this.state;
    const jobRuns = Object.keys(checkedItems);

    return (
      <JobStopRunModal
        jobID={this.props.job.getId()}
        selectedItems={jobRuns}
        onClose={this.handleStopJobRunModalClose}
        onSuccess={this.handleStopJobRunSuccess}
        open={isStopRunModalShown}
      />
    );
  }

  renderJobIDColumn(prop, row, rowOptions = {}) {
    if (!rowOptions.isParent) {
      const taskID = row.taskID;
      const id = this.props.job.getId();

      return (
        <div className="expanding-table-primary-cell-heading text-overflow">
          <Link
            className="table-cell-link-secondary text-overflow"
            to={`/jobs/${id}/tasks/${taskID}`}
            title={taskID}
          >
            <CollapsingString endLength={15} string={taskID} />
          </Link>
        </div>
      );
    }

    const cellContent = (
      <span className="table-cell-flex-box">
        <Icon
          className="icon-margin-right table-cell-icon"
          color="grey"
          id="page-document"
          size="mini"
        />
        <CollapsingString
          endLength={15}
          string={row[prop]}
          wrapperClassName="collapsing-string table-cell-value"
        />
      </span>
    );

    if (row.children && row.children.length > 0) {
      const classes = classNames("expanding-table-primary-cell is-expandable", {
        "is-expanded": rowOptions.isExpanded
      });
      const { clickHandler } = rowOptions;

      return (
        <div className={classes} onClick={clickHandler}>
          {cellContent}
        </div>
      );
    }

    return (
      <div className="expanding-table-primary-cell">
        {cellContent}
      </div>
    );
  }

  renderStatusColumn(prop, row, rowOptions = {}) {
    if (rowOptions.isParent) {
      const status = JobStates[row[prop]];
      const statusClasses = classNames({
        "text-success": status.stateTypes.includes("success") &&
          !status.stateTypes.includes("failure"),
        "text-danger": status.stateTypes.includes("failure"),
        "text-neutral": status.stateTypes.includes("active")
      });

      return (
        <span className={statusClasses}>
          {status.displayName}
        </span>
      );
    }

    const status = TaskStates[row[prop]];
    const statusClasses = classNames({
      "text-success": status.stateTypes.includes("success") &&
        !status.stateTypes.includes("failure"),
      "text-danger": status.stateTypes.includes("failure")
    });

    return (
      <span className={statusClasses}>
        {status.displayName}
      </span>
    );
  }

  renderRunTimeColumn(prop, row) {
    const time = row[prop];

    if (time == null) {
      return <div>N/A</div>;
    }
    const runTimeFormat = moment.duration(time).humanize();

    return <div>{runTimeFormat}</div>;
  }

  renderTimeColumn(prop, row) {
    return <TimeAgo time={row[prop]} autoUpdate={false} />;
  }

  render() {
    const { job } = this.props;
    let { checkedItems } = this.state;
    const disabledItems = this.getDisabledItemsMap(job);
    const totalRunCount = job.getJobRuns().getItems().length;
    let rightAlignLastNChildren = 0;
    let hasCheckedTasks = false;

    // Remove all disabled items from the checkedItems.
    checkedItems = Object.keys(checkedItems).reduce(function(
      filteredItems,
      key
    ) {
      if (!disabledItems[key]) {
        filteredItems[key] = checkedItems[key];
        hasCheckedTasks = true;
      }

      return filteredItems;
    }, {});

    if (hasCheckedTasks) {
      rightAlignLastNChildren = 1;
    }

    return (
      <div>
        <FilterBar rightAlignLastNChildren={rightAlignLastNChildren}>
          <FilterHeadline
            currentLength={totalRunCount}
            name="Run"
            onReset={function() {}}
            totalLength={totalRunCount}
          />
          {this.getStopButton(hasCheckedTasks)}
        </FilterBar>
        <ExpandingTable
          allowMultipleSelect={false}
          className="expanding-table table table-hover table-borderless-outer table-borderless-inner-columns flush-bottom"
          childRowClassName="expanding-table-child"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={this.getData(job)}
          getColGroup={this.getColGroup}
          uniqueProperty="id"
          checkedItemsMap={this.state.checkedItems}
          disabledItemsMap={disabledItems}
          onCheckboxChange={this.handleItemCheck}
          sortOrder="desc"
          sortProp="startedAt"
          tableComponent={CheckboxTable}
        />
        {this.getStopRunModal(checkedItems, hasCheckedTasks)}
      </div>
    );
  }
}

JobRunHistoryTable.propTypes = {
  params: React.PropTypes.object
};

module.exports = JobRunHistoryTable;
