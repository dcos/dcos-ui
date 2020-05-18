import { Trans, DateFormat } from "@lingui/macro";
import classNames from "classnames";
import isEqual from "lodash.isequal";
import PropTypes from "prop-types";
import * as React from "react";
import { Link } from "react-router";
import { Tooltip } from "@dcos/ui-kit";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyLightDarken1,
  iconSizeXs,
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import CheckboxTable from "#SRC/js/components/CheckboxTable";
import CollapsingString from "#SRC/js/components/CollapsingString";
import ExpandingTable, { RowOptions } from "#SRC/js/components/ExpandingTable";
import TimeAgo from "#SRC/js/components/TimeAgo";
import Units from "#SRC/js/utils/Units";
import TableUtil from "#SRC/js/utils/TableUtil";
import DateUtil from "#SRC/js/utils/DateUtil";

import Pod from "../../structs/Pod";
import PodInstance from "../../structs/PodInstance";
import PodSpec from "../../structs/PodSpec";
import PodUtil from "../../utils/PodUtil";
import InstanceUtil from "../../utils/InstanceUtil";
import PodTableHeaderLabels from "../../constants/PodTableHeaderLabels";

const tableColumnClasses = {
  checkbox: "task-table-column-checkbox",
  name: "task-table-column-primary",
  address: "task-table-column-host-address",
  zone: "task-table-column-zone",
  region: "task-table-column-region",
  status: "task-table-column-status",
  health: "task-table-column-health",
  logs: "task-table-column-logs",
  cpus: "task-table-column-cpus",
  mem: "task-table-column-mem",
  updated: "task-table-column-updated",
  version: "task-table-column-version",
};

class PodInstancesTable extends React.Component<{
  filterText: string;
  instances: PodInstance[];
  onSelectionChange: (a: {}) => void;
  pod: Pod;
}> {
  static defaultProps = {
    filterText: "",
    instances: null,
    inverseStyle: false,
    onSelectionChange() {},
    pod: null,
  };
  static propTypes = {
    filterText: PropTypes.string,
    instances: PropTypes.instanceOf(Array),
    inverseStyle: PropTypes.bool,
    onSelectionChange: PropTypes.func,
    pod: PropTypes.instanceOf(Pod).isRequired,
  };

  state = { checkedItems: {} };

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { checkedItems } = this.state;
    const prevInstances = this.props.instances;
    const nextInstances = nextProps.instances;

    // When the `instances` property is changed and we have selected
    // items, re-trigger selection change in order to remove checked
    // entries that are no longer present.
    if (!isEqual(prevInstances, nextInstances)) {
      this.triggerSelectionChange(checkedItems, nextProps.instances);
    }
  }

  triggerSelectionChange(checkedItems: {}, instances: PodInstance[]) {
    const checkedItemInstances = instances.filter(
      (item) => checkedItems[item.getId()]
    );
    this.props.onSelectionChange(checkedItemInstances);
  }
  handleItemCheck = (idsChecked: number[]) => {
    const checkedItems = {};

    idsChecked.forEach((id) => {
      checkedItems[id] = true;
    });
    this.setState({ checkedItems });

    this.triggerSelectionChange(checkedItems, this.props.instances);
  };
  getColGroup = () => {
    return (
      <colgroup>
        <col className={tableColumnClasses.checkbox} />
        <col />
        <col className={tableColumnClasses.address} />
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
  };

  getColumnHeading(prop, order, sortBy) {
    const caretClassNames = classNames("caret", {
      [`caret--${order}`]: order != null,
      "caret--visible": prop === sortBy.prop,
    });

    return (
      <span>
        <Trans render="span" id={PodTableHeaderLabels[prop]} />
        <span className={caretClassNames} />
      </span>
    );
  }

  getColumnClassName(prop, sortBy, row) {
    return classNames(tableColumnClasses[prop], {
      active: prop === sortBy.prop,
      clickable: row == null,
    });
  }

  getColumns() {
    const sortTieBreaker = "name";

    return [
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "name",
        render: this.renderColumnID,
        sortable: true,
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "address",
        render: this.renderColumnAddress,
        sortable: true,
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "region",
        render: this.renderRegion,
        sortable: true,
        sortFunction: TableUtil.getSortFunction(sortTieBreaker, (instance) =>
          InstanceUtil.getRegionName(instance)
        ),
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "zone",
        render: this.renderZone,
        sortable: true,
        sortFunction: TableUtil.getSortFunction(sortTieBreaker, (instance) =>
          InstanceUtil.getZoneName(instance)
        ),
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "status",
        render: this.renderColumnStatus,
        sortable: true,
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "health",
        render: this.renderColumnHealth,
        sortable: true,
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "logs",
        render: this.renderColumnLogs,
        sortable: false,
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "cpus",
        render: this.renderColumnResource,
        sortable: true,
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "mem",
        render: this.renderColumnResource,
        sortable: true,
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "updated",
        render: this.renderColumnUpdated,
        sortable: true,
      },
      {
        className: this.getColumnClassName,
        heading: this.getColumnHeading,
        prop: "version",
        render: this.renderColumnVersion,
        sortable: true,
      },
    ];
  }

  getContainersWithResources(podSpec: PodSpec, containers, agentAddress) {
    return containers.map((container) => {
      let containerResources = container.getResources();

      // TODO: Remove the following 4 lines when DCOS-10098 is addressed
      const containerSpec = podSpec
        .getContainers()
        .find(({ name }) => container.name === name);
      containerResources = containerSpec?.resources ?? containerResources;

      const addressComponents = container.getEndpoints().map((endpoint, i) => [
        <a
          className="text-muted"
          href={`http://${agentAddress}:${endpoint.allocatedHostPort}`}
          key={i}
          target="_blank"
          title="Open in a new window"
        >
          {endpoint.allocatedHostPort}
        </a>,
        " ",
      ]);

      return {
        id: container.getId(),
        name: container.getName(),
        status: container.getContainerStatus(),
        address: addressComponents,
        cpus: containerResources.cpus,
        mem: containerResources.mem,
        resourceLimits:
          containerSpec?.resourceLimits || containerSpec?.resources || {},
        updated: container.getLastUpdated(),
        version: "",
        isHistoricalInstance: container.isHistoricalInstance,
      };
    });
  }

  getDisabledItemsMap(instances) {
    return instances.reduce((acc, instance) => {
      if (!instance.isRunning()) {
        acc[instance.getId()] = true;
      }

      return acc;
    }, {});
  }

  getTableDataFor(instances: PodInstance[], filterText) {
    const podSpec = this.props.pod.getSpec();

    return instances.map((instance) => {
      const containers = instance
        .getContainers()
        .filter((container) =>
          PodUtil.isContainerMatchingText(container, filterText)
        );
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
        agentId: instance.agentId,
        cpus,
        mem,
        updated: instance.getLastUpdated(),
        status: instance.getInstanceStatus(),
        version: podSpec.getVersion(),
        resourceLimits: { cpu: 0, mem: 0 },
        children,
        podSpec,
      };
    });
  }

  renderWithClickHandler(rowOptions: RowOptions, content, className?) {
    return (
      <div onClick={rowOptions.clickHandler} className={className}>
        {content}
      </div>
    );
  }
  renderColumnID = (_prop, col, rowOptions: RowOptions) => {
    const { id: taskID, name: taskName } = col;
    if (!rowOptions.isParent) {
      const id = encodeURIComponent(this.props.pod.getId());

      return (
        <div className="expanding-table-primary-cell-heading text-overflow">
          <Link
            className="table-cell-link-secondary text-overflow"
            to={`/services/detail/${id}/tasks/${taskID}`}
            title={taskName}
          >
            <CollapsingString string={taskName} />
          </Link>
        </div>
      );
    }

    const classes = classNames("expanding-table-primary-cell is-expandable", {
      "is-expanded": rowOptions.isExpanded,
    });

    return this.renderWithClickHandler(
      rowOptions,
      <CollapsingString string={taskID} />,
      classes
    );
  };
  renderColumnLogs = (_prop, row, rowOptions: RowOptions) => {
    if (rowOptions.isParent) {
      // Because elements are just stacked we need a spacer
      return <span>&nbsp;</span>;
    }

    const id = encodeURIComponent(this.props.pod.getId());
    const taskID = row.id;

    return (
      <Link to={`/services/detail/${id}/tasks/${taskID}/logs`} title={row.name}>
        <Icon
          color={greyLightDarken1}
          shape={SystemIcons.PageDocument}
          size={iconSizeXs}
        />
      </Link>
    );
  };
  renderColumnAddress = (_prop, row, rowOptions: RowOptions) => {
    const { address } = row;

    if (rowOptions.isParent) {
      const { agentId } = row;

      if (!agentId) {
        return this.renderWithClickHandler(
          rowOptions,
          <CollapsingString string={address} />
        );
      }

      return this.renderWithClickHandler(
        rowOptions,
        <Link
          className="table-cell-link-secondary text-overflow"
          to={`/nodes/${agentId}`}
          title={address}
        >
          <CollapsingString string={address} />
        </Link>
      );
    }

    return this.renderWithClickHandler(rowOptions, address);
  };
  renderColumnStatus = (_prop, row, rowOptions: RowOptions) => {
    const { status } = row;

    return this.renderWithClickHandler(
      rowOptions,
      <Trans
        id={status.displayName}
        render="span"
        className={`status-text ${status.textClassName}`}
      />
    );
  };
  renderColumnHealth = (prop, row, rowOptions: RowOptions) => {
    const { status } = row;
    const { healthStatus } = status;
    let tooltipContent = <Trans render="span">Healthy</Trans>;

    if (healthStatus === "UNHEALTHY") {
      tooltipContent = <Trans render="span">Unhealthy</Trans>;
    }

    if (healthStatus === "NA") {
      tooltipContent = <Trans render="span">No health checks available</Trans>;
    }
    const trigger = (
      <span className={classNames("flush", status.dotClassName)} />
    );

    return this.renderWithClickHandler(
      rowOptions,
      <div className="flex-box flex-box-align-vertical-center table-cell-flex-box flex-align-items-center flex-direction-top-to-bottom">
        <div className="table-cell-icon">
          <Tooltip id={row.id + prop} trigger={trigger}>
            {tooltipContent}
          </Tooltip>
        </div>
      </div>
    );
  };
  // TODO rendering for pods
  renderColumnResource = (prop, row, rowOptions: RowOptions) => {
    if (rowOptions.isParent) {
      const executorResource = row.podSpec?.executorResources?.[prop] ?? 0;
      const childResources = row.children.filter(
        (child) => !child.isHistoricalInstance
      );

      const requests = childResources.reduce(
        (sum, current) => sum + (current[prop] || 0),
        0
      );
      const limits = childResources.reduce(
        (sum, current) =>
          sum + (current.resourceLimits[prop] || current[prop] || 0),
        0
      );

      const containerMsg =
        requests === limits
          ? Units.formatResource(prop, requests)
          : `${Units.formatResource(prop, requests)} guaranteed
      with a limit of ${Units.formatResource(prop, limits)}`;

      const trigger_ = Units.formatResources(
        prop,
        requests + executorResource,
        limits + executorResource
      );

      return this.renderWithClickHandler(
        rowOptions,
        <Tooltip
          id={row.id + prop}
          trigger={trigger_}
          preferredDirections={["top-right"]}
        >
          <Trans render="span">
            Containers: {containerMsg}, Executor:{" "}
            {Units.formatResource(prop, executorResource)}
          </Trans>
        </Tooltip>
      );
    }

    const request = Units.formatResource(prop, row[prop]);
    const limit = Units.formatResource(
      prop,
      row.resourceLimits[prop] || row[prop] || 0
    );

    if (request === limit) {
      return this.renderWithClickHandler(rowOptions, request);
    }

    return this.renderWithClickHandler(
      rowOptions,
      <Tooltip
        id={row.id + prop}
        trigger={`${request} / ${limit}`}
        preferredDirections={["top-right"]}
      >
        <Trans render="span">
          {request} are guaranteed with a limit of {limit}
        </Trans>
      </Tooltip>
    );
  };
  renderColumnUpdated = (_prop, row, rowOptions: RowOptions) => {
    return this.renderWithClickHandler(
      rowOptions,
      <TimeAgo time={row.updated} />
    );
  };
  renderColumnVersion = (_prop, row, rowOptions: RowOptions) => {
    if (!row.version) {
      return null;
    }

    const localeVersion = (
      <DateFormat
        value={new Date(row.version)}
        format={DateUtil.getFormatOptions()}
      />
    );

    return this.renderWithClickHandler(
      rowOptions,
      <span>{localeVersion}</span>
    );
  };
  renderRegion = (_prop, instance, rowOptions) => {
    if (!rowOptions.isParent) {
      return null;
    }

    return (
      <div className="flex-box flex-box-align-vertical-center table-cell-flex-box">
        <div className="table-cell-value flex-box flex-box-col">
          {InstanceUtil.getRegionName(instance)}
        </div>
      </div>
    );
  };
  renderZone = (_prop, instance, rowOptions) => {
    if (!rowOptions.isParent) {
      return null;
    }

    return (
      <div className="flex-box flex-box-align-vertical-center table-cell-flex-box">
        <div className="table-cell-value flex-box flex-box-col">
          {InstanceUtil.getZoneName(instance)}
        </div>
      </div>
    );
  };

  render() {
    let { instances, pod, filterText } = this.props;
    const { checkedItems } = this.state;

    // If custom list of instances is not provided, use the default instances
    // from the pod
    if (instances == null) {
      instances = pod.getInstanceList().getItems();
    }
    const disabledItemsMap = this.getDisabledItemsMap(instances);

    return (
      <ExpandingTable
        allowMultipleSelect={true}
        className="task-table expanding-table table table-hover table-flush table-borderless-outer table-borderless-inner-columns flush-bottom"
        childRowClassName="expanding-table-child"
        checkedItemsMap={checkedItems}
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        data={this.getTableDataFor(instances, filterText)}
        disabledItemsMap={disabledItemsMap}
        inactiveItemsMap={disabledItemsMap}
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

export default PodInstancesTable;
