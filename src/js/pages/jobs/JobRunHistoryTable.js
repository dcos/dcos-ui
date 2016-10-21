import classNames from 'classnames';
import {Link} from 'react-router';
import React from 'react';

import CollapsingString from '../../components/CollapsingString';
import CheckboxTable from '../../components/CheckboxTable';
import ExpandingTable from '../../components/ExpandingTable';
import FilterBar from '../../components/FilterBar';
import FilterHeadline from '../../components/FilterHeadline';
import Icon from '../../components/Icon';
import JobStates from '../../constants/JobStates';
import JobStopRunModal from '../../components/modals/JobStopRunModal';
import TaskStates from '../../../../plugins/services/src/js/constants/TaskStates';
import TimeAgo from '../../components/TimeAgo';

const METHODS_TO_BIND = [
  'renderJobIDColumn',
  'handleItemCheck',
  'handleStopClick',
  'handleStopJobRunModalClose',
  'handleStopJobRunSuccess'
];

class JobRunHistoryTable extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      checkedItems: {},
      isStopRunModalShown: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleItemCheck(idsChecked) {
    let checkedItems = {};

    idsChecked.forEach(function (id) {
      checkedItems[id] = true;
    });
    this.setState({checkedItems});
  }

  handleStopClick() {
    this.setState({isStopRunModalShown: true});
  }

  handleStopJobRunModalClose() {
    this.setState({isStopRunModalShown: false});
  }

  handleStopJobRunSuccess() {
    this.setState({checkedItems: {}, isStopRunModalShown: false});
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '40px'}} />
        <col />
        <col style={{width: '120px'}} />
        <col style={{width: '160px'}} />
        <col style={{width: '160px'}} />
      </colgroup>
    );
  }

  getColumnHeading(prop, order, sortBy) {
    let caretClassNames = classNames(
      'caret',
      {
        [`caret--${order}`]: order != null,
        'caret--visible': prop === sortBy.prop
      }
    );

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
      'active': prop === sortBy.prop,
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
    let jobRuns = job.getJobRuns();

    return jobRuns.getItems().map(function (jobRun) {
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
        id: jobRun.id,
        jobID: jobRun.getJobID(),
        startedAt: jobRun.getDateCreated(),
        status: jobRun.getStatus(),
        children
      };
    });
  }

  getDisabledItemsMap(job) {
    return job.getJobRuns().getItems().reduce(function (memo, jobRun) {
      let isDisabled = ['ACTIVE', 'INITIAL', 'STARTING'].indexOf(jobRun.getStatus()) < 0;
      memo[jobRun.get('id')] = isDisabled;
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
          onClick={this.handleStopClick}>
          Stop
        </div>
      </div>
    );
  }

  getStopRunModal(checkedItems, hasCheckedTasks) {
    if (!hasCheckedTasks) {
      return null;
    }

    let {isStopRunModalShown} = this.state;
    let jobRuns = Object.keys(checkedItems);

    return (
      <JobStopRunModal
        jobID={this.props.job.getId()}
        selectedItems={jobRuns}
        onClose={this.handleStopJobRunModalClose}
        onSuccess={this.handleStopJobRunSuccess}
        open={!!isStopRunModalShown} />
    );
  }

  renderJobIDColumn(prop, row, rowOptions = {}) {
    if (!rowOptions.isParent) {
      let taskID = row.taskID;
      let id = this.props.job.getId();

      return (
        <div className="expanding-table-primary-cell-heading text-overflow">
          <Link
            className="table-cell-link-secondary text-overflow"
            to={`/jobs/${id}/tasks/${taskID}`}
            title={taskID}>
            <CollapsingString endLength={15} string={taskID} />
          </Link>
        </div>
      );
    }

    let cellContent = (
        <span className="table-cell-flex-box">
          <Icon
            className="icon-margin-right table-cell-icon"
            color="grey"
            id="page-code"
            size="mini"
            family="small" />
          <CollapsingString
            endLength={15}
            string={row[prop]}
            wrapperClassName="collapsing-string table-cell-value" />
        </span>
      );

    if (row.children && row.children.length > 0) {
      let classes = classNames('expanding-table-primary-cell is-expandable', {
        'is-expanded': rowOptions.isExpanded
      });
      let {clickHandler} = rowOptions;

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
      <TimeAgo time={row[prop]} autoUpdate={false} />
    );
  }

  render() {
    let {job} = this.props;
    let {checkedItems} = this.state;
    let disabledItems = this.getDisabledItemsMap(job);
    let totalRunCount = job.getJobRuns().getItems().length;
    let rightAlignLastNChildren = 0;
    let hasCheckedTasks = false;

    // Remove all disabled items from the checkedItems.
    checkedItems = Object.keys(checkedItems).reduce(function (filteredItems, key) {
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
            onReset={function () {}}
            totalLength={totalRunCount} />
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
          sortBy={{prop: 'startedAt', order: 'desc'}}
          tableComponent={CheckboxTable} />
        {this.getStopRunModal(checkedItems, hasCheckedTasks)}
      </div>
    );
  }
}

JobRunHistoryTable.propTypes = {
  params: React.PropTypes.object
};

module.exports = JobRunHistoryTable;
