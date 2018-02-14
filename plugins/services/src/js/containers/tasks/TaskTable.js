import classNames from "classnames";
import { routerShape, Link } from "react-router";
import PropTypes from "prop-types";
import React from "react";
import { Tooltip } from "reactjs-components";

import CheckboxTable from "#SRC/js/components/CheckboxTable";
import Icon from "#SRC/js/components/Icon";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import TableUtil from "#SRC/js/utils/TableUtil";
import Units from "#SRC/js/utils/Units";

import TaskHealthStates from "../../constants/TaskHealthStates";
import TaskStates from "../../constants/TaskStates";
import TaskTableHeaderLabels from "../../constants/TaskTableHeaderLabels";
import TaskTableUtil from "../../utils/TaskTableUtil";
import TaskUtil from "../../utils/TaskUtil";

const tableColumnClasses = {
  checkbox: "task-table-column-checkbox",
  id: "task-table-column-primary",
  name: "task-table-column-name",
  host: "task-table-column-host-address",
  zone: "task-table-column-zone-address",
  region: "task-table-column-region-address",
  status: "task-table-column-status",
  health: "task-table-column-health",
  logs: "task-table-column-logs",
  cpus: "task-table-column-cpus",
  mem: "task-table-column-mem",
  updated: "task-table-column-updated",
  version: "task-table-column-version"
};

const METHODS_TO_BIND = [
  "getStatusValue",
  "renderHeadline",
  "renderHost",
  "renderLog",
  "renderStatus",
  "renderStats",
  "renderVersion"
];

class TaskTable extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getStatValue(task, prop) {
    return task.resources[prop];
  }

  getStatusValue(task) {
    return TaskStates[task.state].displayName;
  }

  getVersionValue(task) {
    return task.version || null;
  }

  getClassName(prop, sortBy, row) {
    return classNames(tableColumnClasses[prop], {
      active: prop === sortBy.prop,
      clickable: row == null && prop !== "logs" // this is a header
    });
  }

  getColumns() {
    var className = this.getClassName;
    var heading = ResourceTableUtil.renderHeading(TaskTableHeaderLabels);
    // Sorts the table columns by their value and if the value is the same it sorts by id
    const sortFunction = TaskTableUtil.getSortFunction("id");
    const getHealthSorting = TableUtil.getHealthSortingOrder;

    return [
      {
        className,
        headerClassName: className,
        heading,
        prop: "id",
        render: this.renderHeadline({ primary: true }),
        sortable: true,
        sortFunction
      },
      {
        className,
        headerClassName: className,
        heading,
        prop: "name",
        render: this.renderHeadline({ secondary: true }),
        sortable: true,
        sortFunction
      },
      {
        className,
        headerClassName: className,
        heading,
        prop: "host",
        render: this.renderHost,
        sortable: true,
        sortFunction
      },
      {
        className,
        headerClassName: className,
        heading,
        prop: "zone",
        render: this.renderZone,
        sortable: true,
        sortFunction
      },
      {
        className,
        headerClassName: className,
        heading,
        prop: "region",
        render: this.renderRegion,
        sortable: true,
        sortFunction
      },
      {
        cacheCell: false,
        className,
        getValue: this.getStatusValue,
        headerClassName: className,
        heading,
        prop: "status",
        render: this.renderStatus,
        sortable: true,
        sortFunction
      },
      {
        cacheCell: false,
        className,
        getValue: this.getStatusValue,
        headerClassName: className,
        heading,
        prop: "health",
        render: this.renderHealth,
        sortable: true,
        sortFunction: getHealthSorting
      },
      {
        cacheCell: false,
        className,
        headerClassName: className,
        heading,
        prop: "logs",
        render: this.renderLog,
        sortable: false
      },
      {
        cacheCell: true,
        className,
        getValue: this.getStatValue,
        headerClassName: className,
        heading,
        prop: "cpus",
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
        prop: "mem",
        render: this.renderStats,
        sortable: true,
        sortFunction
      },
      {
        className,
        headerClassName: className,
        heading,
        prop: "updated",
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
        prop: "version",
        render: this.renderVersion,
        sortable: true,
        sortFunction: TableUtil.getSortFunction("id", task => {
          const version = this.getVersionValue(task);
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
        <col className={tableColumnClasses.checkbox} />
        <col />
        <col className={tableColumnClasses.name} />
        <col className={tableColumnClasses.host} />
        <col className={tableColumnClasses.zone} />
        <col className={tableColumnClasses.region} />
        <col className={tableColumnClasses.status} />
        <col className={tableColumnClasses.health} />
        <col className={tableColumnClasses.logs} />
        <col className={tableColumnClasses.cpus} />
        <col className={tableColumnClasses.mem} />
        <col className={tableColumnClasses.updated} />
        <col className={tableColumnClasses.version} />
      </colgroup>
    );
  }

  getDisabledItemsMap(tasks) {
    return tasks
      .filter(function(task) {
        return (
          task.state !== "TASK_UNREACHABLE" &&
          (TaskStates[task.state].stateTypes.includes("completed") ||
            !task.isStartedByMarathon)
        );
      })
      .reduce(function(acc, task) {
        acc[task.id] = true;

        return acc;
      }, {});
  }

  getInactiveItemsMap(tasks) {
    return tasks.reduce(function(acc, task) {
      if (TaskStates[task.state].stateTypes.includes("completed")) {
        acc[task.id] = true;
      }

      return acc;
    }, {});
  }

  renderHeadline(options) {
    const anchorClasses = classNames(
      {
        "table-cell-link-primary": options.primary,
        "table-cell-link-secondary": options.secondary
      },
      "text-overflow"
    );

    return (prop, task) => {
      const title = task[prop];
      const { id, nodeID } = this.props.params;

      let linkTo = `/services/detail/${encodeURIComponent(id)}/tasks/${task.id}`;
      if (nodeID != null) {
        linkTo = `/nodes/${nodeID}/tasks/${task.id}`;
      }

      return (
        <div className="flex-box flex-box-align-vertical-center table-cell-flex-box">
          <div className="table-cell-value flex-box flex-box-col">
            <Link className={anchorClasses} to={linkTo} title={title}>
              {title}
            </Link>
          </div>
        </div>
      );
    };
  }

  renderLog(prop, task) {
    const title = task.name || task.id;
    const { id, nodeID } = this.props.params;

    let linkTo = `/services/detail/${encodeURIComponent(id)}/tasks/${task.id}/logs`;
    if (nodeID != null) {
      linkTo = `/nodes/${nodeID}/tasks/${task.id}/logs`;
    }

    return (
      <div className="flex-box flex-box-align-vertical-center table-cell-flex-box flex-align-items-center flex-direction-top-to-bottom">
        <Tooltip
          content="View logs"
          wrapperClassName="tooltip-wrapper text-align-center description"
        >
          <Link to={linkTo} title={title}>
            <Icon color="grey" id="page-document" size="mini" />
          </Link>
        </Tooltip>
      </div>
    );
  }

  renderHost(prop, task) {
    const taskHostName = TaskUtil.getHostName(task);

    if (!taskHostName) {
      return "N/A";
    }

    return (
      <Link
        className="table-cell-link-secondary text-overflow"
        to={`/nodes/${task.slave_id}`}
        title={taskHostName}
      >
        {taskHostName}
      </Link>
    );
  }

  renderRegion(prop, task) {
    return (
      <div className="flex-box flex-box-align-vertical-center table-cell-flex-box">
        <div className="table-cell-value flex-box flex-box-col">
          {TaskUtil.getRegionName(task)}
        </div>
      </div>
    );
  }

  renderZone(prop, task) {
    return (
      <div className="flex-box flex-box-align-vertical-center table-cell-flex-box">
        <div className="table-cell-value flex-box flex-box-col">
          {TaskUtil.getZoneName(task)}
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

  renderStatus(prop, task) {
    const statusClassName = TaskUtil.getTaskStatusClassName(task);
    const statusLabelClasses = `${statusClassName} table-cell-value`;

    return (
      <div className="flex-box flex-box-align-vertical-center table-cell-flex-box">
        <span className={statusLabelClasses}>
          {this.getStatusValue(task)}
        </span>
      </div>
    );
  }

  renderHealth(prop, task) {
    const { state } = task;

    const dangerState = TaskStates[state].stateTypes.includes("failure");
    const activeState = TaskStates[state].stateTypes.includes("active");
    const transitional = [
      "TASK_KILLING",
      "TASK_STARTING",
      "TASK_STAGING"
    ].includes(state);

    const healthy = task.health === TaskHealthStates.HEALTHY;
    const unhealthy = task.health === TaskHealthStates.UNHEALTHY;
    const unknown = task.health === TaskHealthStates.UNKNOWN;

    let tooltipContent = TaskHealthStates.HEALTHY;

    if (unhealthy) {
      tooltipContent = TaskHealthStates.UNHEALTHY;
    }

    if (!activeState || unknown || transitional) {
      tooltipContent = "No health checks available";
    }

    const failing = ["TASK_ERROR", "TASK_FAILED"].includes(state);
    const running = ["TASK_RUNNING", "TASK_STARTING"].includes(state);

    const statusClass = classNames({
      dot: true,
      flush: true,
      inactive: !activeState || transitional,
      success: healthy && running,
      running: unknown && running,
      danger: dangerState || unhealthy || failing
    });

    return (
      <div className="flex-box flex-box-align-vertical-center table-cell-flex-box flex-align-items-center flex-direction-top-to-bottom">
        <div className="table-cell-icon table-cell-task-dot task-status-indicator">
          <Tooltip anchor="center" content={tooltipContent}>
            <span className={statusClass} />
          </Tooltip>
        </div>
      </div>
    );
  }

  renderVersion(prop, task) {
    const version = this.getVersionValue(task);

    if (version == null) {
      return null;
    }

    const localeVersion = new Date(version).toLocaleString();

    return (
      <span>
        {localeVersion}
      </span>
    );
  }

  render() {
    const { checkedItemsMap, className, onCheckboxChange, tasks } = this.props;

    return (
      <CheckboxTable
        checkedItemsMap={checkedItemsMap}
        className={className}
        columns={this.getColumns()}
        data={tasks.slice()}
        disabledItemsMap={this.getDisabledItemsMap(tasks)}
        inactiveItemsMap={this.getInactiveItemsMap(tasks)}
        getColGroup={this.getColGroup}
        onCheckboxChange={onCheckboxChange}
        sortBy={{ prop: "updated", order: "desc" }}
        sortOrder="desc"
        sortProp="updated"
        uniqueProperty="id"
      />
    );
  }
}

TaskTable.contextTypes = {
  router: routerShape.isRequired
};

TaskTable.propTypes = {
  checkedItemsMap: PropTypes.object,
  className: PropTypes.string,
  onCheckboxChange: PropTypes.func,
  params: PropTypes.object.isRequired,
  tasks: PropTypes.array.isRequired
};

TaskTable.defaultProps = {
  className: "table table-flush table-borderless-outer table-borderless-inner-columns flush-bottom",
  tasks: []
};

module.exports = TaskTable;
