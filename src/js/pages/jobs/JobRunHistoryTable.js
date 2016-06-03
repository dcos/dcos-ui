import classNames from 'classnames';
import React from 'react';

import ChronosStore from '../../stores/ChronosStore';
import ExpandingTable from '../../components/ExpandingTable';
import FilterHeadline from '../../components/FilterHeadline';
import JobStates from '../../constants/JobStates';
import StringUtil from '../../utils/StringUtil';
import TaskStates from '../../constants/TaskStates';

class JobRunHistoryTable extends React.Component {
  handleExpansionClick(row) {
    this.refs.expandingTable.expandRow(row);
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '40%'}} />
        <col style={{width: '20%'}} />
        <col style={{width: '20%'}} />
        <col style={{width: '20%'}} />
      </colgroup>
    );
  }

  getColumnHeading(prop, order, sortBy) {
    let caretClassNames = classNames({
      'caret': true,
      'caret--asc': order === 'asc',
      'caret--desc': order === 'desc',
      'caret--visible': sortBy.prop === prop
    });

    let headingStrings = {
      'jobID': 'Job ID',
      'status': 'Status',
      'startedAt': 'Started',
      'finishedAt': 'Finished'
    };

    return (
      <span>
        {headingStrings[prop]}
        <span className={caretClassNames}></span>
      </span>
    );
  }

  getColumnClassName(prop, sortBy, row) {
    return classNames({
      'highlight': prop === sortBy.prop,
      'clickable': row == null
    });
  }

  getColumns() {
    return [
      {
        className: this.getColumnClassName,
        render: (prop, row, rowOptions = {}) => {
          if (!rowOptions.isParent) {
            return (
              <div className="job-run-history-task-id text-overflow">
                {row.taskID}
              </div>
            );
          }

          let classes = classNames('job-run-history-job-id', {
            'is-expanded': rowOptions.isExpanded
          });
          let clickHandler = null;

          if (rowOptions.hasChildren) {
            clickHandler = this.handleExpansionClick.bind(this, row);
          }

          return (
            <div className={classes} onClick={clickHandler}>
              {row[prop]}
            </div>
          );
        },
        heading: this.getColumnHeading,
        prop: 'jobID',
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'status',
        render: function (prop, row, rowOptions = {}) {
          if (rowOptions.isParent) {
            let status = JobStates[row[prop]];
            let statusClasses = classNames({
              'text-success': status.stateTypes.indexOf('success') > -1
                && status.stateTypes.indexOf('failure') === -1,
              'text-danger': status.stateTypes.indexOf('failure') > -1,
              'text-neutral': status.stateTypes.indexOf('active') > -1
            });

            return (
              <span className={statusClasses}>
                {status.displayName}
              </span>
            );
          }

          let status = TaskStates[row[prop]];
          let statusClasses = classNames({
            'text-success': status.stateTypes.indexOf('success') > -1
              && status.stateTypes.indexOf('failure') === -1,
            'text-danger': status.stateTypes.indexOf('failure') > -1
          });

          return (
            <span className={statusClasses}>
              {status.displayName}
            </span>
          );
        },
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'startedAt',
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'finishedAt',
        sortable: true
      }
    ];
  }

  getData(job) {
    let activeRuns = job.getActiveRuns();

    return activeRuns.getItems().map((activeRun, runIndex) => {
      let longestRunningTask = activeRun.getLongestRunningTask();
      let dateRunStarted = activeRun.getDateCreated();
      let dateRunFinished = longestRunningTask.getDateCompleted();

      if (dateRunStarted != null) {
        dateRunStarted = dateRunStarted.fromNow();
      }

      if (dateRunFinished != null) {
        dateRunFinished = dateRunFinished.fromNow();
      }

      let children = activeRun.getTasks().getItems().map((jobTask) => {
        let dateTaskStarted = jobTask.getDateStarted();
        let dateTaskFinished = jobTask.getDateCompleted();

        if (dateTaskStarted != null) {
          dateTaskStarted = dateTaskStarted.fromNow();
        }

        if (dateTaskFinished != null) {
          dateTaskFinished = dateTaskFinished.fromNow();
        }

        return {
          taskID: jobTask.getTaskID(),
          status: jobTask.getStatus(),
          startedAt: dateTaskStarted,
          finishedAt: dateTaskFinished
        };
      });

      return {
        finishedAt: dateRunFinished,
        id: runIndex,
        jobID: activeRun.getJobID(),
        startedAt: dateRunStarted,
        status: activeRun.getStatus(),
        children
      };
    });
  }

  render() {
    let job = ChronosStore.getJobDetail(this.props.jobID);
    let activeRunCount = job.getActiveRuns().getItems().length;

    let filterHeadlineLabel = StringUtil.pluralize('Run', activeRunCount);

    return (
      <div>
        <FilterHeadline
          currentLength={activeRunCount}
          inverseStyle={true}
          name={filterHeadlineLabel}
          onReset={function () {}}
          totalLength={activeRunCount} />
        <ExpandingTable
          className="job-run-history-table table table-hover inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
          childRowClassName="job-run-history-table-child"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={this.getData(job)}
          ref="expandingTable"
          sortBy={{prop: 'jobID', order: 'asc'}} />
      </div>
    );
  }
}

module.exports = JobRunHistoryTable;
