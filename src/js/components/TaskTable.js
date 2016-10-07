import classNames from 'classnames';
import {Link} from 'react-router';
import React from 'react';

import CheckboxTable from './CheckboxTable';
import CompositeState from '../structs/CompositeState';
import DCOSStore from '../stores/DCOSStore';
import Icon from './Icon';
import ResourceTableUtil from '../utils/ResourceTableUtil';
import TableUtil from '../utils/TableUtil';
import TaskStates from '../constants/TaskStates';
import TaskTableHeaderLabels from '../constants/TaskTableHeaderLabels';
import TaskUtil from '../utils/TaskUtil';
import Units from '../utils/Units';

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

    METHODS_TO_BIND.forEach(function (method) {
      this[method] = this[method].bind(this);
    }, this);
  }

  getStatValue(task, prop) {
    return task.resources[prop];
  }

  getStatusValue(task) {
    let taskHealth = this.getTaskHealth(task);
    // task status should only reflect health if taskHealth is defined
    if (taskHealth === true) {
      return 'Healthy';
    }
    if (taskHealth === false) {
      return 'Unhealthy';
    }

    return TaskStates[task.state].displayName;
  }

  getTaskHealth(task) {
    let mesosTaskHealth = this.getTaskHealthFromMesos(task);
    if (mesosTaskHealth !== null) {
      return mesosTaskHealth;
    }

    return this.getTaskHealthFromMarathon(task);
  }

  getTaskHealthFromMarathon(task) {
    const marathonTask = DCOSStore.serviceTree.getTaskFromTaskID(task.id);
    if (marathonTask != null) {
      const {healthCheckResults} = marathonTask;
      if (healthCheckResults != null && healthCheckResults.length > 0) {
        return healthCheckResults.every(function (result) {
          return result.alive;
        });
      }
    }

    return null;
  }

  getTaskHealthFromMesos(task) {
    if (task.statuses == null) {
      return null;
    }
    const healths = task.statuses.map(function (status) {
      return status.healthy;
    });
    const healthDataExists = healths.length > 0 && healths.every(
      function (health) {
        return typeof health !== 'undefined';
      }
    );
    if (healthDataExists) {
      return healths.some(function (health) {
        return health;
      });
    }

    return null;
  }

  getVersionValue(task) {
    let marathonTask = DCOSStore.serviceTree.getTaskFromTaskID(task.id);
    if (marathonTask == null) {
      return null;
    }

    return marathonTask.version;
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
        render: this.renderHeadline,
        sortable: true,
        sortFunction
      },
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

  renderHeadline(prop, task) {
    let title = task[prop];
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

  renderHost(prop, task) {
    let node = CompositeState.getNodesList()
      .filter({ids: [task.slave_id]}).last();

    if (!node) {
      return 'N/A';
    }

    return (
      <Link
        className="emphasize clickable text-overflow"
        to="node-detail"
        params={{nodeID: task.slave_id}}
        title={node.hostname}>
        {node.hostname}
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

    let healthy = this.getTaskHealth(task);
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
