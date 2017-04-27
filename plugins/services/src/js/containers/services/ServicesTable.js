import classNames from "classnames";
import { Dropdown, Table, Tooltip } from "reactjs-components";
import { Link } from "react-router";
import { MountService } from "foundation-ui";
import React, { PropTypes } from "react";

import Links from "#SRC/js/constants/Links";
import Icon from "#SRC/js/components/Icon";
import NestedServiceLinks from "#SRC/js/components/NestedServiceLinks";
import StringUtil from "#SRC/js/utils/StringUtil";
import TableUtil from "#SRC/js/utils/TableUtil";
import Units from "#SRC/js/utils/Units";
import UserActions from "#SRC/js/constants/UserActions";

import HealthBar from "../../components/HealthBar";
import Pod from "../../structs/Pod";
import ResourceTableUtil
  from "../../../../../../src/js/utils/ResourceTableUtil";
import Service from "../../structs/Service";
import ServiceActionItem from "../../constants/ServiceActionItem";
import ServiceStatusWarning from "../../components/ServiceStatusWarning";
import ServiceTableHeaderLabels from "../../constants/ServiceTableHeaderLabels";
import ServiceTableUtil from "../../utils/ServiceTableUtil";
import ServiceTree from "../../structs/ServiceTree";

const StatusMapping = {
  Running: "running-state"
};

const columnClasses = {
  name: "service-table-column-name",
  status: "service-table-column-status",
  cpus: "service-table-column-cpus",
  mem: "service-table-column-mem",
  disk: "service-table-column-disk",
  actions: "service-table-column-actions"
};

const METHODS_TO_BIND = [
  "onActionsItemSelection",
  "renderHeadline",
  "renderStats",
  "renderStatus",
  "renderServiceActions"
];

class ServicesTable extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  getOpenInNewWindowLink(service) {
    // This might be a serviceTree and therefore we need this check
    // And getWebURL might therefore not be available
    if (!(service instanceof Service) || !service.getWebURL()) {
      return null;
    }

    return (
      <a
        className="table-cell-icon table-display-on-row-hover"
        href={service.getWebURL()}
        target="_blank"
        title="Open in a new window"
      >
        <Icon
          color="neutral"
          className="icon-margin-left"
          id="open-external"
          size="mini"
        />
      </a>
    );
  }

  onActionsItemSelection(service, actionItem) {
    const { modalHandlers } = this.context;

    switch (actionItem.id) {
      case ServiceActionItem.SCALE:
        modalHandlers.scaleService({ service });
        break;
      case ServiceActionItem.RESTART:
        modalHandlers.restartService({ service });
        break;
      case ServiceActionItem.RESUME:
        modalHandlers.resumeService({ service });
        break;
      case ServiceActionItem.SUSPEND:
        modalHandlers.suspendService({ service });
        break;
      case ServiceActionItem.DELETE:
        modalHandlers.deleteService({ service });
        break;
    }
  }

  getServiceLink(service) {
    const id = encodeURIComponent(service.getId());
    const isGroup = service instanceof ServiceTree;
    const serviceLink = isGroup
      ? `/services/overview/${id}`
      : `/services/detail/${id}`;

    if (this.props.isFiltered) {
      return (
        <NestedServiceLinks
          serviceID={id}
          className="service-breadcrumb"
          majorLinkClassName="service-breadcrumb-service-id"
          minorLinkWrapperClassName="service-breadcrumb-crumb"
        />
      );
    }

    return (
      <Link className="table-cell-link-primary text-overflow" to={serviceLink}>
        {service.getName()}
      </Link>
    );
  }

  getImage(service) {
    if (service instanceof ServiceTree) {
      // Get serviceTree image/icon
      return (
        <Icon
          className="icon-margin-right"
          color="grey"
          id="folder"
          size="mini"
        />
      );
    }

    // Get service image/icon
    return (
      <span className="icon icon-mini icon-image-container icon-app-container icon-margin-right">
        <img src={service.getImages()["icon-small"]} />
      </span>
    );
  }

  renderHeadline(prop, service) {
    const id = encodeURIComponent(service.getId());
    const isGroup = service instanceof ServiceTree;
    const serviceLink = isGroup
      ? `/services/overview/${id}`
      : `/services/detail/${id}`;

    return (
      <div className="service-table-heading flex-box
        flex-box-align-vertical-center table-cell-flex-box">
        <Link className="table-cell-icon" to={serviceLink}>
          {this.getImage(service)}
        </Link>
        <span className="table-cell-value table-cell-flex-box">
          {this.getServiceLink(service)}
          {this.getOpenInNewWindowLink(service)}
        </span>
      </div>
    );
  }

  renderServiceActions(prop, service) {
    const isGroup = service instanceof ServiceTree;
    const isPod = service instanceof Pod;
    const isSingleInstanceApp = service.getLabels()
      .MARATHON_SINGLE_INSTANCE_APP;
    const instancesCount = service.getInstancesCount();
    const scaleText = isGroup ? "Scale By" : "Scale";

    const dropdownItems = [
      {
        className: "hidden",
        id: ServiceActionItem.MORE,
        html: "",
        selectedHtml: <Icon id="ellipsis-vertical" size="mini" />
      },
      {
        className: classNames({
          hidden: (isGroup && instancesCount === 0) || isSingleInstanceApp
        }),
        id: ServiceActionItem.SCALE,
        html: scaleText
      },
      {
        className: classNames({
          hidden: isPod || isGroup || instancesCount === 0
        }),
        id: ServiceActionItem.RESTART,
        html: "Restart"
      },
      {
        className: classNames({
          hidden: instancesCount === 0
        }),
        id: ServiceActionItem.SUSPEND,
        html: "Suspend"
      },
      {
        className: classNames({
          hidden: isGroup || instancesCount > 0
        }),
        id: ServiceActionItem.RESUME,
        html: "Resume"
      },
      {
        id: ServiceActionItem.DELETE,
        html: (
          <span className="text-danger">
            {StringUtil.capitalize(UserActions.DELETE)}
          </span>
        )
      }
    ];

    return (
      <Tooltip content="More actions">
        <Dropdown
          anchorRight={true}
          buttonClassName="button button-mini button-link"
          dropdownMenuClassName="dropdown-menu"
          dropdownMenuListClassName="dropdown-menu-list"
          dropdownMenuListItemClassName="clickable"
          wrapperClassName="dropdown flush-bottom table-cell-icon"
          items={dropdownItems}
          persistentID={ServiceActionItem.MORE}
          onItemSelection={this.onActionsItemSelection.bind(this, service)}
          scrollContainer=".gm-scroll-view"
          scrollContainerParentSelector=".gm-prevented"
          title="More actions"
          transition={true}
          transitionName="dropdown-menu"
        />
      </Tooltip>
    );
  }

  renderStatus(prop, service) {
    const instancesCount = service.getInstancesCount();
    const serviceId = service.getId();
    const serviceStatus = service.getStatus();
    const serviceStatusClassSet = StatusMapping[serviceStatus] || "";
    const tasksSummary = service.getTasksSummary();
    const { tasksRunning } = tasksSummary;

    const isDeploying = serviceStatus === "Deploying";

    const conciseOverview = ` (${tasksRunning}/${instancesCount})`;
    let verboseOverview = ` (${tasksRunning} ${StringUtil.pluralize("Instance", tasksRunning)})`;
    if (tasksRunning !== instancesCount) {
      verboseOverview = ` (${tasksRunning} of ${instancesCount} Instances)`;
    }

    const serviceStatusContent = (
      <span>
        <span className={serviceStatusClassSet}>{serviceStatus}</span>
        <span className="hidden-large-down">{verboseOverview}</span>
        <span className="hidden-jumbo-up">{conciseOverview}</span>
        <ServiceStatusWarning item={service} />
      </span>
    );

    return (
      <div className="status-bar-wrapper">
        <span className="status-bar-indicator">
          <HealthBar
            isDeploying={isDeploying}
            key={serviceId}
            tasksSummary={tasksSummary}
            instancesCount={instancesCount}
          />
        </span>
        <span className="status-bar-text">
          <MountService.Mount
            defaultContent={serviceStatusContent}
            limit={1}
            service={service}
            type="ServiceDetail:ServiceStatus"
          />
        </span>
      </div>
    );
  }

  renderStats(prop, service) {
    const resource = service.getResources()[prop];

    return (
      <span>
        {Units.formatResource(prop, resource)}
      </span>
    );
  }

  getCellClasses(prop, sortBy, row) {
    const isHeader = row == null;

    return classNames(columnClasses[prop], {
      active: prop === sortBy.prop,
      clickable: isHeader
    });
  }

  getColumns() {
    const heading = ResourceTableUtil.renderHeading(ServiceTableHeaderLabels);

    return [
      {
        className: this.getCellClasses,
        headerClassName: this.getCellClasses,
        prop: "name",
        render: this.renderHeadline,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className: this.getCellClasses,
        headerClassName: this.getCellClasses,
        prop: "status",
        helpText: (
          <span>
            {"At-a-glance overview of the global application or group state. "}
            <a href={Links.statusHelpLink} target="_blank">
              Read more
            </a>.
          </span>
        ),
        render: this.renderStatus,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className: this.getCellClasses,
        headerClassName: this.getCellClasses,
        prop: "cpus",
        render: this.renderStats,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className: this.getCellClasses,
        headerClassName: this.getCellClasses,
        prop: "mem",
        render: this.renderStats,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className: this.getCellClasses,
        headerClassName: this.getCellClasses,
        prop: "disk",
        render: this.renderStats,
        sortable: true,
        sortFunction: ServiceTableUtil.propCompareFunctionFactory,
        heading
      },
      {
        className: this.getCellClasses,
        headerClassName: this.getCellClasses,
        prop: "actions",
        render: this.renderServiceActions,
        sortable: false,
        heading() {
          return null;
        }
      }
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col className={columnClasses.name} />
        <col className={columnClasses.status} />
        <col className={columnClasses.cpus} />
        <col className={columnClasses.mem} />
        <col className={columnClasses.disk} />
        <col className={columnClasses.actions} />
      </colgroup>
    );
  }

  render() {
    return (
      <Table
        buildRowOptions={this.getRowAttributes}
        className="table service-table table-borderless-outer table-borderless-inner-columns flush-bottom"
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        data={this.props.services.slice()}
        itemHeight={TableUtil.getRowHeight()}
        containerSelector=".gm-scroll-view"
        sortBy={{ prop: "name", order: "asc" }}
      />
    );
  }
}

ServicesTable.contextTypes = {
  modalHandlers: PropTypes.shape({
    scaleService: PropTypes.func,
    restartService: PropTypes.func,
    resumeService: PropTypes.func,
    suspendService: PropTypes.func,
    deleteService: PropTypes.func
  }).isRequired
};

ServicesTable.defaultProps = {
  isFiltered: false,
  services: []
};

ServicesTable.propTypes = {
  isFiltered: PropTypes.bool,
  services: PropTypes.array
};

module.exports = ServicesTable;
