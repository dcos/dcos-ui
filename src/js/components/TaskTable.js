import classNames from 'classnames';
import {Link} from 'react-router';
import React from 'react';

import ResourceTableUtil from '../utils/ResourceTableUtil';
import {Table} from 'reactjs-components';
import TableUtil from '../utils/TableUtil';
import TaskStates from '../constants/TaskStates';
import TaskTableHeaderLabels from '../constants/TaskTableHeaderLabels';
import TaskUtil from '../utils/TaskUtil';
import Units from '../utils/Units';

const METHODS_TO_BIND = [
  'renderHeadline',
  'renderState',
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

  getStateValue(task, prop) {
    return TaskStates[task[prop]].displayName;
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
        className,
        headerClassName: className,
        heading,
        prop: 'updated',
        render: ResourceTableUtil.renderUpdated,
        sortable: true,
        sortFunction
      },
      {
        cacheCell: true,
        className,
        getValue: this.getStateValue,
        headerClassName: className,
        heading,
        prop: 'state',
        render: this.renderState,
        sortable: true,
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
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col />
        <col style={{width: '120px'}} />
        <col style={{width: '120px'}} />
        <col style={{width: '85px'}} className="hidden-mini" />
        <col style={{width: '110px'}} className="hidden-mini" />
      </colgroup>
    );
  }

  renderHeadline(prop, task) {
    let dangerState = TaskStates[task.state].stateTypes.includes('failure');

    let successState = TaskStates[task.state].stateTypes.includes('success');

    let statusClass = classNames({
      'dot': true,
      success: successState,
      danger: dangerState
    });

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
        <div className="table-cell-icon table-cell-task-dot
          task-status-indicator">
          <span className={statusClass}></span>
        </div>
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

  renderStats(prop, task) {
    return (
      <span>
        {Units.formatResource(prop, this.getStatValue(task, prop))}
      </span>
    );
  }

  renderState(prop, task) {
    let statusClassName = TaskUtil.getTaskStatusClassName(task);
    let statusLabelClasses = `${statusClassName} table-cell-value`;

    return (
      <div className="flex-box flex-box-align-vertical-center
        table-cell-flex-box">
        <span className={statusLabelClasses}>
          {this.getStateValue(task, prop)}
        </span>
      </div>
    );
  }

  render() {
    let {className, tasks} = this.props;

    return (
      <Table
        className={className}
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        containerSelector=".gm-scroll-view"
        data={tasks.slice()}
        itemHeight={TableUtil.getRowHeight()}
        sortBy={{prop: 'updated', order: 'desc'}} />
    );
  }
}

TaskTable.propTypes = {
  className: React.PropTypes.string,
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
