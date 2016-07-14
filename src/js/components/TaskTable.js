import classNames from 'classnames';
import {Link} from 'react-router';
import React from 'react';

import CheckboxTable from './CheckboxTable';
import Icon from './Icon';
import ResourceTableUtil from '../utils/ResourceTableUtil';
import TaskStates from '../constants/TaskStates';
import TaskTableHeaderLabels from '../constants/TaskTableHeaderLabels';
import TaskUtil from '../utils/TaskUtil';
import Units from '../utils/Units';

const METHODS_TO_BIND = [
  'renderHeadline',
  'renderLog',
  'renderStatus',
  'renderStats'
];

class TaskTable extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(function (method) {
      this[method] = this[method].bind(this);
    }, this);
  }

  getStatValue(task, prop) {
    return task.resources[prop];
  }

  getStatusValue(state) {
    return TaskStates[state].displayName;
  }

  getColumns() {
    var className = ResourceTableUtil.getClassName;
    var heading = ResourceTableUtil.renderHeading(TaskTableHeaderLabels);
    let sortFunction = ResourceTableUtil.getSortFunction('id');

    return [
      {
        className,
        headerClassName: className,
        heading,
        prop: 'name',
        render: this.renderHeadline,
        sortable: true,
        sortFunction
      },
      {
        cacheCell: true,
        className,
        getValue: this.getStatusValue,
        headerClassName: className,
        heading,
        prop: 'status',
        render: this.renderStatus,
        sortable: true,
        sortFunction
      },
      {
        cacheCell: true,
        className,
        headerClassName: className,
        heading,
        prop: 'log',
        render: this.renderLog,
        sortable: false,
        sortFunction
      },
      {
        cacheCell: true,
        className,
        getValue: this.getStatValue,
        headerClassName: className,
        heading,
        prop: 'cpus',
        render: this.renderStats,
        sortable: true,
        sortFunction
      },
      {
        cacheCell: true,
        className,
        getValue: this.getStatValue,
        headerClassName: className,
        heading,
        prop: 'mem',
        render: this.renderStats,
        sortable: true,
        sortFunction
      },
      {
        className,
        headerClassName: className,
        heading,
        prop: 'updated',
        render: ResourceTableUtil.renderUpdated,
        sortable: true,
        sortFunction
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '40px'}} />
        <col />
        <col style={{width: '120px'}} />
        <col style={{width: '30px'}} className="hidden-mini" />
        <col style={{width: '85px'}} className="hidden-mini" />
        <col style={{width: '110px'}} className="hidden-mini" />
        <col style={{width: '120px'}} />
      </colgroup>
    );
  }

  renderHeadline(prop, task) {
    let title = task.name || task.id;
    let params = this.props.parentRouter.getCurrentParams();
    let routeParams = Object.assign({taskID: task.id}, params);

    let linkTo = 'services-task-details';
    if (params.nodeID != null) {
      linkTo = 'nodes-task-details';
    }

    return (
      <div className="flex-box flex-box-align-vertical-center
        table-cell-flex-box">
        <div className="table-cell-value flex-box flex-box-col">
          <Link
            className="emphasize clickable text-overflow"
            to={linkTo}
            params={routeParams}
            title={title}>
            {title}
          </Link>
        </div>
      </div>
    );
  }

  renderLog(prop, task) {
    let title = task.name || task.id;
    let params = this.props.parentRouter.getCurrentParams();
    let routeParams = Object.assign({taskID: task.id}, params);

    let linkTo = 'services-task-details-logs';
    if (params.nodeID != null) {
      linkTo = 'nodes-task-details-logs';
    }

    return (
      <Link
        className="emphasize clickable text-overflow"
        to={linkTo}
        params={routeParams}
        title={title}>
        <Icon color="grey" id="page" size="mini" family="mini" />
      </Link>
    );
  }

  renderStats(prop, task) {
    return (
      <span>
        {Units.formatResource(prop, this.getStatValue(task, prop))}
      </span>
    );
  }

  renderStatus(prop, task) {
    let statusClassName = TaskUtil.getTaskStatusClassName(task);
    let statusLabelClasses = `${statusClassName} table-cell-value`;

    let {state} = task;

    let dangerState = TaskStates[state].stateTypes.includes('failure');

    let healthy = task.statuses.some(function (status) {
      return status.healthy;
    });

    let unknown = task.statuses.length === 0 || task.statuses.some(function (status) {
      return status.healthy == null;
    });

    let activeState = TaskStates[state].stateTypes.includes('active');

    let running = ['TASK_RUNNING', 'TASK_STARTING'].includes(state) && unknown;
    let success = healthy && state === 'TASK_RUNNING';
    let danger = (dangerState && !activeState &&
      ['TASK_ERROR', 'TASK_FAILED'].includes(state)) || healthy === false &&
      task.statuses.length !== 0 ;

    let statusClass = classNames({
      'dot': true,
      inactive: !activeState,
      success: success,
      running: running,
      danger: danger
    });

    return (
      <div className="flex-box flex-box-align-vertical-center
        table-cell-flex-box">
        <div className="table-cell-icon table-cell-task-dot
          task-status-indicator">
          <span className={statusClass}></span>
        </div>
        <span className={statusLabelClasses}>
          {this.getStatusValue(state)}
        </span>
      </div>
    );
  }

  render() {
    let {checkedItemsMap, className, onCheckboxChange, tasks} = this.props;

    return (
      <CheckboxTable
        checkedItemsMap={checkedItemsMap}
        className={className}
        columns={this.getColumns()}
        data={tasks.slice()}
        getColGroup={this.getColGroup}
        onCheckboxChange={onCheckboxChange}
        sortBy={{prop: 'updated', order: 'desc'}}
        sortOrder="desc"
        sortProp="updated"
        uniqueProperty="id" />
    );
  }
}

TaskTable.propTypes = {
  checkedItemsMap: React.PropTypes.object,
  className: React.PropTypes.string,
  onCheckboxChange: React.PropTypes.func,
  parentRouter: React.PropTypes.oneOfType([
    React.PropTypes.func,
    React.PropTypes.object
  ]).isRequired,
  tasks: React.PropTypes.array.isRequired
};

TaskTable.defaultProps = {
  className: 'table table-borderless-outer table-borderless-inner-columns flush-bottom',
  tasks: []
};

module.exports = TaskTable;
