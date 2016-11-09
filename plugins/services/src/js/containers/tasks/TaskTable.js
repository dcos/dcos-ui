import classNames from 'classnames';
import {ResourceTableUtil} from 'foundation-ui';
import {routerShape, Link} from 'react-router';
import React from 'react';

import CheckboxTable from '../../../../../../src/js/components/CheckboxTable';
import Icon from '../../../../../../src/js/components/Icon';
import TableUtil from '../../../../../../src/js/utils/TableUtil';
import TaskStates from '../../constants/TaskStates';
import TaskTableHeaderLabels from '../../constants/TaskTableHeaderLabels';
import TaskUtil from '../../utils/TaskUtil';
import Units from '../../../../../../src/js/utils/Units';

const METHODS_TO_BIND = [
  'getStatusValue',
  'renderHeadline',
  'renderHost',
  'renderLog',
  'renderStatus',
  'renderStats',
  'renderVersion'
];

const RIGHT_ALIGN_PROPS = ['cpus', 'disk', 'log', 'mem', 'version'];

class TaskTable extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getStatValue(task, prop) {
    return task.resources[prop];
  }

  getStatusValue(task) {
    return task.health;
  }

  getVersionValue(task) {
    return task.version || null;
  }

  getClassName(prop, sortBy, row) {
    return classNames({
      'text-align-right': RIGHT_ALIGN_PROPS.includes(prop),
      'hidden-small-down': ['host', 'status', 'cpus', 'mem'].includes(prop),
      'hidden-medium-down': prop === 'name',
      'hidden-large-down': ['version', 'log'].includes(prop),
      'highlight': prop === sortBy.prop,
      'clickable': row == null // this is a header
    });
  }

  getColumns() {
    var className = this.getClassName;
    var heading = ResourceTableUtil.renderHeading(TaskTableHeaderLabels);
    let sortFunction = ResourceTableUtil.getSortFunction('id');

    return [
      {
        className,
        headerClassName: className,
        heading,
        prop: 'id',
        render: this.renderHeadline({primary: true}),
        sortable: true,
        sortFunction
      },
      {
        className,
        headerClassName: className,
        heading,
        prop: 'name',
        render: this.renderHeadline({secondary: true}),
        sortable: true,
        sortFunction
      },
      {
        className,
        headerClassName: className,
        heading,
        prop: 'host',
        render: this.renderHost,
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
        cacheCell: false,
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
      },
      {
        cacheCell: true,
        className,
        getValue: this.getVersionValue,
        headerClassName: className,
        heading,
        prop: 'version',
        render: this.renderVersion,
        sortable: true,
        sortFunction: TableUtil.getSortFunction('id', (task) => {
          let version = this.getVersionValue(task);
          if (version == null) {
            return null;
          }

          return new Date(version);
        })
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col style={{width: '40px'}} />
        <col />
        <col style={{width: '10%'}} className="hidden-medium-down" />
        <col style={{width: '150px'}} className="hidden-small-down" />
        <col style={{width: '115px'}} className="hidden-small-down" />
        <col style={{width: '40px'}} className="hidden-large-down" />
        <col style={{width: '85px'}} className="hidden-small-down" />
        <col style={{width: '85px'}} className="hidden-small-down" />
        <col style={{width: '120px'}} />
        <col style={{width: '110px'}} className="hidden-large-down"/>
      </colgroup>
    );
  }

  getDisabledItemsMap(tasks) {
    return tasks
      .filter(function (task) {
        return TaskStates[task.state].stateTypes.includes('completed')
          || !task.isStartedByMarathon;
      })
      .reduce(function (acc, task) {
        acc[task.id] = true;
        return acc;
      }, {});
  }

  renderHeadline(options) {
    let anchorClasses = classNames('text-overflow', {
      'table-cell-link-primary': options.primary,
      'table-cell-link-secondary': options.secondary
    });

    return (prop, task) => {
      let title = task[prop];
      let {id, nodeID} = this.props.params;

      let linkTo = `/services/overview/${encodeURIComponent(id)}/tasks/${task.id}`;
      if (nodeID != null) {
        linkTo = `/nodes/${nodeID}/tasks/${task.id}`;
      }

      return (
        <div className="flex-box flex-box-align-vertical-center
          table-cell-flex-box">
          <div className="table-cell-value flex-box flex-box-col">
            <Link
              className={anchorClasses}
              to={linkTo}
              title={title}>
              {title}
            </Link>
          </div>
        </div>
      );
    };
  }

  renderLog(prop, task) {
    let title = task.name || task.id;
    let {id, nodeID} = this.props.params;

    let linkTo = `/services/overview/${id}/tasks/${task.id}/view`;
    if (nodeID != null) {
      linkTo = `/nodes/${nodeID}/tasks/${task.id}/view`;
    }

    return (
      <Link
        to={linkTo}
        title={title}>
        <Icon color="grey" id="page" size="mini" family="mini" />
      </Link>
    );
  }

  renderHost(prop, task) {
    if (!task.hostname) {
      return 'N/A';
    }

    return (
      <Link
        className="table-cell-link-secondary text-overflow"
        to={`/nodes/${task.slave_id}`}
        title={task.hostname}>
        {task.hostname}
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
    let activeState = TaskStates[state].stateTypes.includes('active');

    let healthy = task.health;
    let unhealthy = (healthy === false);
    let unknown = (healthy === null);

    let failing = ['TASK_ERROR', 'TASK_FAILED'].includes(state);
    let running = ['TASK_RUNNING', 'TASK_STARTING'].includes(state);

    let statusClass = classNames({
      'dot': true,
      'inactive': !activeState,
      'success': healthy && running,
      'running': unknown && running,
      'danger': dangerState || unhealthy || failing
    });

    return (
      <div className="flex-box flex-box-align-vertical-center
        table-cell-flex-box">
        <div className="table-cell-icon table-cell-task-dot
          task-status-indicator">
          <span className={statusClass}></span>
        </div>
        <span className={statusLabelClasses}>
          {this.getStatusValue(task)}
        </span>
      </div>
    );
  }

  renderVersion(prop, task) {
    let version = this.getVersionValue(task);

    if (version == null) {
      return null;
    }

    let localeVersion = new Date(version).toLocaleString();

    return (
      <span>
        {localeVersion}
      </span>
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
        disabledItemsMap={this.getDisabledItemsMap(tasks)}
        getColGroup={this.getColGroup}
        onCheckboxChange={onCheckboxChange}
        sortBy={{prop: 'updated', order: 'desc'}}
        sortOrder="desc"
        sortProp="updated"
        uniqueProperty="id" />
    );
  }
}

TaskTable.contextTypes = {
  router: routerShape.isRequired
};

TaskTable.propTypes = {
  checkedItemsMap: React.PropTypes.object,
  className: React.PropTypes.string,
  onCheckboxChange: React.PropTypes.func,
  params: React.PropTypes.object.isRequired,
  tasks: React.PropTypes.array.isRequired
};

TaskTable.defaultProps = {
  className: 'table table-borderless-outer table-borderless-inner-columns flush-bottom',
  tasks: []
};

module.exports = TaskTable;
