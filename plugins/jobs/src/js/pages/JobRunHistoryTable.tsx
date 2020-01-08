import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import classNames from "classnames";
import { Link } from "react-router";
import PropTypes from "prop-types";
import * as React from "react";
import { Icon, Tooltip } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { Dropdown } from "reactjs-components";

import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import JobStates from "#PLUGINS/jobs/src/js/constants/JobStates";
import TaskStates from "#PLUGINS/services/src/js/constants/TaskStates";

import CollapsingString from "#SRC/js/components/CollapsingString";
import ExpandingTable from "#SRC/js/components/ExpandingTable";
import FilterBar from "#SRC/js/components/FilterBar";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import JobStopRunModal from "#SRC/js/components/modals/JobStopRunModal";
import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import TimeAgo from "#SRC/js/components/TimeAgo";
import DateUtil from "#SRC/js/utils/DateUtil";

const columnClasses = {
  jobID: "job-run-history-table-column-id",
  status: "job-run-history-table-column-status",
  startedAt: "job-run-history-table-column-started",
  finishedAt: "job-run-history-table-column-finished",
  runTime: "job-run-history-table-column-run-time",
  actions: "job-run-history-table-column-actions"
};

const METHODS_TO_BIND = [
  "renderJobIDColumn",
  "handleStopJobRunModalClose",
  "renderActionsColumn"
];

const STOP = "Stop";

function calculateRunTime(startedAt, finishedAt) {
  if (finishedAt == null) {
    return null;
  }

  return finishedAt - startedAt;
}

const colGroup = (
  <colgroup>
    <col className={columnClasses.jobID} />
    <col className={columnClasses.status} />
    <col className={columnClasses.startedAt} />
    <col className={columnClasses.finishedAt} />
    <col className={columnClasses.runTime} />
    <col className={columnClasses.actions} />
  </colgroup>
);

class JobRunHistoryTable extends React.Component<{ job: { id: string } }> {
  constructor(props) {
    super(props);

    this.state = {
      selectedID: null,
      mesosStateStoreLoaded: false
    };

    MesosStateStore.ready.then(() => {
      this.setState({ mesosStateStoreLoaded: true });
    });

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleItemSelect(id) {
    this.setState({ selectedID: id });
  }

  handleStopJobRunModalClose() {
    this.setState({ selectedID: null });
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
      },
      {
        className: this.getColumnClassName,
        heading: "",
        prop: "actions",
        render: this.renderActionsColumn,
        sortable: false
      }
    ];
  }

  getData(job) {
    return job.jobRuns.nodes.map(jobRun => {
      const children = jobRun.tasks.nodes.map(jobTask => {
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
    return job.jobRuns.nodes.reduce((memo, jobRun) => {
      const isDisabled =
        ["ACTIVE", "INITIAL", "STARTING"].indexOf(jobRun.status) < 0;
      memo[jobRun.jobID] = isDisabled;

      return memo;
    }, {});
  }

  renderJobIDColumn(prop, row, rowOptions = {}) {
    if (!rowOptions.isParent) {
      const taskID = row.taskID;

      if (!this.state.mesosStateStoreLoaded) {
        return <Trans>Loading...</Trans>;
      }

      // It may be that the data only *seems* to be present because we don't
      // remove tasks from the MesosStateStore when they're garbage collected in
      // the background.
      const dataSeemsStillPresent = !!MesosStateStore.getTaskFromTaskID(taskID);

      return (
        <div className="expanding-table-primary-cell-heading text-overflow">
          {dataSeemsStillPresent ? (
            <Link
              className="table-cell-link-secondary"
              to={`/jobs/detail/${this.props.job.id}/tasks/${taskID}`}
              title={taskID}
            >
              <CollapsingString endLength={15} string={taskID} />
            </Link>
          ) : (
            <Tooltip
              preferredDirections={["bottom-left"]}
              trigger={<span>{taskID}</span>}
            >
              <Trans>
                The data related to this task has already been cleaned up.
              </Trans>
            </Tooltip>
          )}
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
    const runTimeFormat = DateUtil.getDuration(time);

    return <div>{runTimeFormat}</div>;
  }

  renderActionsColumn(prop, row) {
    if (!["ACTIVE", "INITIAL", "STARTING"].includes(row.status)) {
      return;
    }

    const actions = [
      {
        className: "hidden",
        id: "default",
        html: "",
        selectedHtml: (
          <Icon shape={SystemIcons.EllipsisVertical} size={iconSizeXs} />
        )
      },
      {
        id: STOP,
        html: <Trans render="span" className="text-danger" id={STOP} />
      }
    ];

    return (
      <Dropdown
        anchorRight={true}
        buttonClassName="button button-mini button-link"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        wrapperClassName="dropdown flush-bottom table-cell-icon actions-dropdown"
        items={actions}
        persistentID={"default"}
        onItemSelection={this.handleItemSelect.bind(this, row.id)}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        transitionName="dropdown-menu"
        disabled={false}
      />
    );
  }

  renderTimeColumn(prop, row) {
    // L10NTODO: Relative time
    return <TimeAgo time={row[prop]} autoUpdate={false} />;
  }

  render() {
    const { job } = this.props;
    const { selectedID } = this.state;
    const totalRunCount = job.jobRuns.nodes.length;
    const disabledIDs = this.getDisabledItemsMap(job);
    if (disabledIDs[selectedID]) {
      this.handleItemSelect(null);
    }

    return (
      <div>
        <FilterBar>
          <FilterHeadline
            currentLength={totalRunCount}
            name={i18nMark("Run")}
            onReset={() => {}}
            totalLength={totalRunCount}
          />
        </FilterBar>
        <ExpandingTable
          className="expanding-table table table-hover table-flush table-borderless-outer table-borderless-inner-columns flush-bottom"
          childRowClassName="expanding-table-child"
          columns={this.getColumns()}
          colGroup={colGroup}
          data={this.getData(job)}
        />
        {selectedID && this.props.job.id ? (
          <JobStopRunModal
            jobID={this.props.job.id}
            jobRunID={selectedID}
            onClose={this.handleStopJobRunModalClose}
          />
        ) : null}
      </div>
    );
  }
}

JobRunHistoryTable.propTypes = {
  params: PropTypes.object
};

export default JobRunHistoryTable;
