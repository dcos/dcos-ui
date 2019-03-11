import { Trans, t } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";
import classNames from "classnames";
import { Link } from "react-router";
import PropTypes from "prop-types";
import React from "react";
import moment from "moment";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import JobStates from "#PLUGINS/jobs/src/js/constants/JobStates";
import TaskStates from "#PLUGINS/services/src/js/constants/TaskStates";

import CollapsingString from "#SRC/js/components/CollapsingString";
import CheckboxTable from "#SRC/js/components/CheckboxTable";
import ExpandingTable from "#SRC/js/components/ExpandingTable";
import FilterBar from "#SRC/js/components/FilterBar";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import JobStopRunModal from "#SRC/js/components/modals/JobStopRunModal";
import TimeAgo from "#SRC/js/components/TimeAgo";

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
      jobID: i18nMark("Job ID"),
      status: i18nMark("Status"),
      startedAt: i18nMark("Started"),
      finishedAt: i18nMark("Finished"),
      runTime: i18nMark("Run Time")
    };

    return (
      <span>
        <Trans render="span" id={headingStrings[prop]} />
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
    const jobRuns = job.jobRuns.nodes;

    return jobRuns.map(function(jobRun) {
      const children = jobRun.tasks.nodes.map(function(jobTask) {
        const startedAt = jobTask.dateStarted;
        const finishedAt = jobTask.dateCompleted;
        const runTime = calculateRunTime(startedAt, finishedAt);

        return {
          taskID: jobTask.taskId,
          status: jobTask.status,
          startedAt,
          finishedAt,
          runTime
        };
      });

      const startedAt = jobRun.dateCreated;
      const finishedAt = jobRun.dateFinished;
      const runTime = calculateRunTime(startedAt, finishedAt);

      return {
        finishedAt,
        id: jobRun.jobID,
        jobID: job.id,
        startedAt,
        status: jobRun.status,
        runTime,
        children
      };
    });
  }

  getDisabledItemsMap(job) {
    return job.jobRuns.nodes.reduce(function(memo, jobRun) {
      const isDisabled =
        ["ACTIVE", "INITIAL", "STARTING"].indexOf(jobRun.status) < 0;
      memo[jobRun.jobID] = isDisabled;

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
          className="button button-outline button-danger"
          onClick={this.handleStopClick}
        >
          <Trans>Stop</Trans>
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
        jobID={this.props.job.id}
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
      const id = this.props.job.id;

      return (
        <div className="expanding-table-primary-cell-heading text-overflow">
          <Link
            className="table-cell-link-secondary text-overflow"
            to={`/jobs/detail/${id}/tasks/${taskID}`}
            title={taskID}
          >
            <CollapsingString endLength={15} string={taskID} />
          </Link>
        </div>
      );
    }

    const cellContent = (
      <span className="table-cell-flex-box">
        <span className="icon-margin-right table-cell-icon">
          <Icon
            color={greyDark}
            shape={SystemIcons.PageDocument}
            size={iconSizeXs}
          />
        </span>
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

    return <div className="expanding-table-primary-cell">{cellContent}</div>;
  }

  renderStatusColumn(prop, row, rowOptions = {}) {
    if (rowOptions.isParent) {
      const status = JobStates[row[prop]];
      const statusClasses = classNames({
        "text-success":
          status.stateTypes.includes("success") &&
          !status.stateTypes.includes("failure"),
        "text-danger": status.stateTypes.includes("failure"),
        "text-neutral": status.stateTypes.includes("active")
      });

      return (
        <Trans
          render="span"
          className={statusClasses}
          id={status.displayName}
        />
      );
    }

    const status = TaskStates[row[prop]];
    const statusClasses = classNames({
      "text-success":
        status.stateTypes.includes("success") &&
        !status.stateTypes.includes("failure"),
      "text-danger": status.stateTypes.includes("failure")
    });

    return (
      <Trans id={status.displayName} render="span" className={statusClasses} />
    );
  }

  renderRunTimeColumn(prop, row) {
    const time = row[prop];

    if (time == null) {
      return <Trans render="div">N/A</Trans>;
    }
    // L10NTODO: Relative time
    const runTimeFormat = moment.duration(time).humanize();

    return <div>{runTimeFormat}</div>;
  }

  renderTimeColumn(prop, row) {
    // L10NTODO: Relative time
    return <TimeAgo time={row[prop]} autoUpdate={false} />;
  }

  render() {
    const { job, i18n } = this.props;
    let { checkedItems } = this.state;
    const disabledItems = this.getDisabledItemsMap(job);
    const totalRunCount = job.jobRuns.nodes.length;
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
    },
    {});

    if (hasCheckedTasks) {
      rightAlignLastNChildren = 1;
    }

    return (
      <div>
        <FilterBar rightAlignLastNChildren={rightAlignLastNChildren}>
          <FilterHeadline
            currentLength={totalRunCount}
            name={i18n._(t`Run`)}
            onReset={function() {}}
            totalLength={totalRunCount}
          />
          {this.getStopButton(hasCheckedTasks)}
        </FilterBar>
        <ExpandingTable
          allowMultipleSelect={false}
          className="expanding-table table table-hover table-flush table-borderless-outer table-borderless-inner-columns flush-bottom"
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
  params: PropTypes.object
};

module.exports = withI18n()(JobRunHistoryTable);
