import classNames from "classnames";
import deepEqual from "deep-equal";
import React from "react";
import { Link } from "react-router";
import { Tooltip } from "reactjs-components";

import CheckboxTable from "../../../../../../src/js/components/CheckboxTable";
import CollapsingString
  from "../../../../../../src/js/components/CollapsingString";
import ExpandingTable from "../../../../../../src/js/components/ExpandingTable";
import Icon from "../../../../../../src/js/components/Icon";

import Pod from "../../structs/Pod";
import PodInstanceList from "../../structs/PodInstanceList";
import PodInstanceStatus from "../../constants/PodInstanceStatus";
import PodTableHeaderLabels from "../../constants/PodTableHeaderLabels";
import PodUtil from "../../utils/PodUtil";
import TimeAgo from "../../../../../../src/js/components/TimeAgo";
import Units from "../../../../../../src/js/utils/Units";

const tableColumnClasses = {
  checkbox: "task-table-column-checkbox",
  name: "task-table-column-primary",
  address: "task-table-column-host-address",
  status: "task-table-column-status",
  health: "task-table-column-health",
  logs: "task-table-column-logs",
  cpus: "task-table-column-cpus",
  mem: "task-table-column-mem",
  updated: "task-table-column-updated",
  version: "task-table-column-version"
};

const METHODS_TO_BIND = [
  "getColGroup",
  "handleItemCheck",
  "renderColumnAddress",
  "renderColumnID",
  "renderColumnLogs",
  "renderColumnResource",
  "renderColumnStatus",
  "renderColumnHealth",
  "renderColumnUpdated",
  "renderColumnVersion"
];

class PodInstancesTable extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      checkedItems: {}
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    const { checkedItems } = this.state;
    const prevInstances = this.props.instances.getItems();
    const nextInstances = nextProps.instances.getItems();

    // When the `instances` property is changed and we have selected
    // items, re-trigger selection change in order to remove checked
    // entries that are no longer present.

    if (
      Object.keys(checkedItems).length &&
      !deepEqual(prevInstances, nextInstances)
    ) {
      this.triggerSelectionChange(checkedItems, nextProps.instances);
    }
  }

  triggerSelectionChange(checkedItems, instances) {
    const checkedItemInstances = instances.getItems().filter(function(item) {
      return checkedItems[item.getId()];
    });
    this.props.onSelectionChange(checkedItemInstances);
  }

  handleItemCheck(idsChecked) {
    const checkedItems = {};

    idsChecked.forEach(function(id) {
      checkedItems[id] = true;
    });
    this.setState({ checkedItems });

    this.triggerSelectionChange(checkedItems, this.props.instances);
  }

  getColGroup() {
    return (
      <colgroup>
        <col className={tableColumnClasses.checkbox} />
        <col />
        <col className={tableColumnClasses.address} />
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

  getColumnHeading(prop, order, sortBy) {
    const caretClassNames = classNames("caret", {
      [`caret--${order}`]: order != null,
      "caret--visible": prop === sortBy.prop
    });

    return (
      <span>
        {PodTableHeaderLabels[prop]}
        <span className={caretClassNames} />
      </span>
    );
  }

  getColumnClassName(prop, sortBy, row) {
    return classNames(tableColumnClasses[prop], {
      highlight: prop === sortBy.prop,
      clickable: row == null
    });
  }

  getColumns() {
    return [
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "name",
        render: this.renderColumnID,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "address",
        render: this.renderColumnAddress,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "status",
        render: this.renderColumnStatus,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "health",
        render: this.renderColumnHealth,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "logs",
        render: this.renderColumnLogs,
        sortable: false
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "cpus",
        render: this.renderColumnResource,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "mem",
        render: this.renderColumnResource,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "updated",
        render: this.renderColumnUpdated,
        sortable: true
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "version",
        render: this.renderColumnVersion,
        sortable: true
      }
    ];
  }

  getContainersWithResources(podSpec, containers, agentAddress) {
    const children = containers.map(function(container) {
      let containerResources = container.getResources();

      // TODO: Remove the following 4 lines when DCOS-10098 is addressed
      const containerSpec = podSpec.getContainerSpec(container.name);
      if (containerSpec) {
        containerResources = containerSpec.resources;
      }

      const addressComponents = container
        .getEndpoints()
        .map(function(endpoint, i) {
          return (
            <a
              className="text-muted"
              href={`http://${agentAddress}:${endpoint.allocatedHostPort}`}
              key={i}
              target="_blank"
              title="Open in a new window"
            >
              {endpoint.allocatedHostPort}
            </a>
          );
        });

      return {
        id: container.getId(),
        name: container.getName(),
        status: container.getContainerStatus(),
        address: addressComponents,
        cpus: containerResources.cpus,
        mem: containerResources.mem,
        updated: container.getLastUpdated(),
        version: ""
      };
    });

    return children;
  }

  getDisabledItemsMap(instanceList) {
    return instanceList.reduceItems(function(memo, instance) {
      if (!instance.isRunning()) {
        memo[instance.getId()] = true;
      }

      return memo;
    }, {});
  }

  getTableDataFor(instances, filterText) {
    const podSpec = this.props.pod.getSpec();

    return instances.getItems().map(instance => {
      const containers = instance.getContainers().filter(function(container) {
        return PodUtil.isContainerMatchingText(container, filterText);
      });
      const children = this.getContainersWithResources(
        podSpec,
        containers,
        instance.getAgentAddress()
      );
      const { cpus, mem } = instance.getResources();

      return {
        id: instance.getId(),
        name: instance.getName(),
        address: instance.getAgentAddress(),
        agent: instance.agent,
        cpus,
        mem,
        updated: instance.getLastUpdated(),
        status: instance.getInstanceStatus(),
        version: podSpec.getVersion(),
        children
      };
    });
  }

  getInstanceFilterStatus(instance) {
    const status = instance.getInstanceStatus();
    switch (status) {
      case PodInstanceStatus.STAGED:
        return "staged";

      case PodInstanceStatus.HEALTHY:
      case PodInstanceStatus.UNHEALTHY:
      case PodInstanceStatus.RUNNING:
        return "active";

      case PodInstanceStatus.KILLED:
        return "completed";

      default:
        return "";
    }
  }

  renderWithClickHandler(rowOptions, content, className) {
    return (
      <div onClick={rowOptions.clickHandler} className={className}>
        {content}
      </div>
    );
  }

  renderColumnID(prop, col, rowOptions = {}) {
    const { id: taskID, name: taskName } = col;
    if (!rowOptions.isParent) {
      const id = encodeURIComponent(this.props.pod.getId());

      return (
        <div className="expanding-table-primary-cell-heading text-overflow">
          <Link
            className="table-cell-link-secondary text-overflow"
            to={`/services/overview/${id}/tasks/${taskID}`}
            title={taskName}
          >
            <CollapsingString string={taskName} />
          </Link>
        </div>
      );
    }

    const classes = classNames("expanding-table-primary-cell is-expandable", {
      "is-expanded": rowOptions.isExpanded
    });

    return this.renderWithClickHandler(
      rowOptions,
      <CollapsingString string={taskID} />,
      classes
    );
  }

  renderColumnLogs(prop, row, rowOptions = {}) {
    if (rowOptions.isParent) {
      // Because elements are just stacked we need a spacer
      return <span>&nbsp;</span>;
    }

    const id = encodeURIComponent(this.props.pod.getId());
    const taskID = row.id;

    return (
      <Link
        to={`/services/overview/${id}/tasks/${taskID}/logs`}
        title={row.name}
      >
        <Icon color="grey" id="page-document" size="mini" />
      </Link>
    );
  }

  renderColumnAddress(prop, row, rowOptions = {}) {
    const { address } = row;

    if (rowOptions.isParent) {
      const { agent } = row;

      if (!agent) {
        return this.renderWithClickHandler(
          rowOptions,
          <CollapsingString string={address} />
        );
      }

      return this.renderWithClickHandler(
        rowOptions,
        <Link
          className="table-cell-link-secondary text-overflow"
          to={`/nodes/${agent.id}`}
          title={address}
        >
          <CollapsingString string={address} />
        </Link>
      );
    }

    return this.renderWithClickHandler(rowOptions, address);
  }

  renderColumnStatus(prop, row, rowOptions = {}) {
    const { status } = row;

    return this.renderWithClickHandler(
      rowOptions,
      <span className={`status-text ${status.textClassName}`}>
        {status.displayName}
      </span>
    );
  }

  renderColumnHealth(prop, row, rowOptions = {}) {
    const { status } = row;
    const { healthStatus } = status;
    let tooltipContent = "Healthy";

    if (healthStatus === "UNHEALTHY") {
      tooltipContent = "Unhealthy";
    }

    if (healthStatus === "NA") {
      tooltipContent = "No health checks available";
    }

    return this.renderWithClickHandler(
      rowOptions,
      <div className="flex-box flex-box-align-vertical-center
        table-cell-flex-box flex-align-items-center
        flex-direction-top-to-bottom">
        <div className="table-cell-icon">
          <Tooltip anchor="center" content={tooltipContent}>
            <span className={classNames("flush", status.dotClassName)} />
          </Tooltip>
        </div>
      </div>
    );
  }

  renderColumnResource(prop, row, rowOptions = {}) {
    return this.renderWithClickHandler(
      rowOptions,
      <span>{Units.formatResource(prop, row[prop])}</span>
    );
  }

  renderColumnUpdated(prop, row, rowOptions = {}) {
    return this.renderWithClickHandler(
      rowOptions,
      <TimeAgo time={row.updated} />
    );
  }

  renderColumnVersion(prop, row, rowOptions = {}) {
    if (!row.version) {
      return null;
    }

    const localeVersion = new Date(row.version).toLocaleString();

    return this.renderWithClickHandler(
      rowOptions,
      <span>{localeVersion}</span>
    );
  }

  render() {
    let { instances, pod, filterText } = this.props;
    const { checkedItems } = this.state;

    // If custom list of instances is not provided, use the default instances
    // from the pod
    if (instances == null) {
      instances = pod.getInstanceList();
    }
    const disabledItems = this.getDisabledItemsMap(instances);

    return (
      <ExpandingTable
        allowMultipleSelect={true}
        className="task-table expanding-table table table-hover table-borderless-outer table-borderless-inner-columns flush-bottom"
        childRowClassName="expanding-table-child"
        checkedItemsMap={checkedItems}
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        data={this.getTableDataFor(instances, filterText)}
        disabledItemsMap={disabledItems}
        inactiveItemsMap={disabledItems}
        expandAll={!!filterText}
        getColGroup={this.getColGroup}
        onCheckboxChange={this.handleItemCheck}
        sortBy={{ prop: "name", order: "asc" }}
        tableComponent={CheckboxTable}
        uniqueProperty="id"
      />
    );
  }
}

PodInstancesTable.defaultProps = {
  filterText: "",
  instances: null,
  inverseStyle: false,
  onSelectionChange() {},
  pod: null
};

PodInstancesTable.propTypes = {
  filterText: React.PropTypes.string,
  instances: React.PropTypes.instanceOf(PodInstanceList),
  inverseStyle: React.PropTypes.bool,
  onSelectionChange: React.PropTypes.func,
  pod: React.PropTypes.instanceOf(Pod).isRequired
};

module.exports = PodInstancesTable;
