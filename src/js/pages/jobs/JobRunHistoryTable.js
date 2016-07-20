import classNames from 'classnames';
import {Link} from 'react-router';
import React from 'react';

import ExpandingTable from '../../components/ExpandingTable';
import FilterHeadline from '../../components/FilterHeadline';
import Icon from '../../components/Icon';
import JobStates from '../../constants/JobStates';
import TaskStates from '../../constants/TaskStates';
import TimeAgo from '../../components/TimeAgo';

const METHODS_TO_BIND = [
  'renderJobIDColumn'
];

class JobRunHistoryTable extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

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
        heading: this.getColumnHeading,
        prop: 'jobID',
        render: this.renderJobIDColumn,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'status',
        render: this.renderStatusColumn,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'startedAt',
        render: this.renderTimeColumn,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: 'finishedAt',
        render: this.renderTimeColumn,
        sortable: true
      }
    ];
  }

  // TODO: DCOS-7766 Revisit this pre-rendering data transformation...
  getData(job) {
    let jonRuns = job.getJobRuns();

    return jonRuns.getItems().map(function (jobRun, runIndex) {
      let children = jobRun.getTasks().getItems().map(function (jobTask) {
        return {
          taskID: jobTask.getTaskID(),
          status: jobTask.getStatus(),
          startedAt: jobTask.getDateStarted(),
          finishedAt: jobTask.getDateCompleted()
        };
      });

      return {
        finishedAt: jobRun.getDateFinished(),
        id: runIndex,
        jobID: jobRun.getJobID(),
        startedAt: jobRun.getDateCreated(),
        status: jobRun.getStatus(),
        children
      };
    });
  }

  renderJobIDColumn(prop, row, rowOptions = {}) {
    if (!rowOptions.isParent) {
      let taskID = row.taskID;
      let id = this.props.job.getId();

      return (
        <div className="job-run-history-task-id text-overflow">
          <Link
            className="emphasize clickable text-overflow"
            to="jobs-task-details"
            params={{id, taskID}}
            title={taskID}>
            {taskID}
          </Link>
        </div>
      );
    }

    let cellContent = (
        <span>
          <Icon
            className="icon-margin-right"
            color="grey"
            id="page-code"
            size="mini"
            family="small" />
          {row[prop]}
        </span>
      );

    if (row.children && row.children.length > 0) {
      let classes = classNames('job-run-history-job-id is-expandable', {
        'is-expanded': rowOptions.isExpanded
      });
      let clickHandler = null;

      if (rowOptions.hasChildren) {
        clickHandler = this.handleExpansionClick.bind(this, row);
      }

      return (
        <div className={classes} onClick={clickHandler}>
          {cellContent}
        </div>
      );
    }

    return (
      <div className="job-run-history-job-id">
        {cellContent}
      </div>
    );

  }

  renderStatusColumn(prop, row, rowOptions = {}) {
    if (rowOptions.isParent) {
      let status = JobStates[row[prop]];
      let statusClasses = classNames({
        'text-success': status.stateTypes.includes('success')
          && !status.stateTypes.includes('failure'),
        'text-danger': status.stateTypes.includes('failure'),
        'text-neutral': status.stateTypes.includes('active')
      });

      return (
        <span className={statusClasses}>
          {status.displayName}
        </span>
      );
    }

    let status = TaskStates[row[prop]];
    let statusClasses = classNames({
      'text-success': status.stateTypes.includes('success')
        && !status.stateTypes.includes('failure'),
      'text-danger': status.stateTypes.includes('failure')
    });

    return (
      <span className={statusClasses}>
        {status.displayName}
      </span>
    );
  }

  renderTimeColumn(prop, row) {
    return (
      <TimeAgo time={row[prop]} />
    );
  }

  render() {
    let {job} = this.props;
    let totalRunCount = job.getJobRuns().getItems().length;

    return (
      <div>
        <FilterHeadline
          currentLength={totalRunCount}
          inverseStyle={true}
          name="Run"
          onReset={function () {}}
          totalLength={totalRunCount} />
        <ExpandingTable
          className="job-run-history-table table table-hover inverse table-borderless-outer table-borderless-inner-columns flush-bottom"
          childRowClassName="job-run-history-table-child"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={this.getData(job)}
          ref="expandingTable"
          sortBy={{prop: 'startedAt', order: 'desc'}} />
      </div>
    );
  }
}

JobRunHistoryTable.propTypes = {
  params: React.PropTypes.object
};

module.exports = JobRunHistoryTable;
