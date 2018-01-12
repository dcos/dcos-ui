import classNames from "classnames";
import { Dropdown, Table, Tooltip } from "reactjs-components";
import { injectIntl } from "react-intl";
import { Link, routerShape } from "react-router";
import React, { PropTypes } from "react";
import { Hooks } from "PluginSDK";

import Icon from "#SRC/js/components/Icon";
import Links from "#SRC/js/constants/Links";
import NestedServiceLinks from "#SRC/js/components/NestedServiceLinks";
import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import StringUtil from "#SRC/js/utils/StringUtil";
import TableUtil from "#SRC/js/utils/TableUtil";
import Units from "#SRC/js/utils/Units";
import { isSDKService } from "#SRC/js/utils/ServiceUtil";

import HealthBar from "../../components/HealthBar";
import Pod from "../../structs/Pod";
import Service from "../../structs/Service";
import ServiceActionDisabledModal
  from "../../components/modals/ServiceActionDisabledModal";
import {
  DELETE,
  EDIT,
  MORE,
  OPEN,
  RESTART,
  RESUME,
  SCALE,
  SUSPEND
} from "../../constants/ServiceActionItem";
import ServiceActionLabels from "../../constants/ServiceActionLabels";
import ServiceStatusTypes from "../../constants/ServiceStatusTypes";
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
  "handleServiceAction",
  "handleActionDisabledModalOpen",
  "handleActionDisabledModalClose",
  "renderHeadline",
  "renderStats",
  "renderStatus",
  "renderServiceActions"
];

class ServicesTable extends React.Component {
  constructor() {
    super(...arguments);

    this.state = { actionDisabledService: null };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  onActionsItemSelection(service, actionItem) {
    const isGroup = service instanceof ServiceTree;
    let containsSDKService = false;

    if (isGroup) {
      containsSDKService =
        // #findItem will flatten the service tree
        service.findItem(function(item) {
          return item instanceof Service && isSDKService(item);
        }) != null;
    }

    // We still want to support the `open` action to display the web view
    if (
      (containsSDKService || isSDKService(service)) &&
      !Hooks.applyFilter(
        "isEnabledSDKAction",
        actionItem.id === EDIT || actionItem.id === OPEN,
        actionItem.id
      )
    ) {
      this.handleActionDisabledModalOpen(service, actionItem.id);
    } else {
      this.handleServiceAction(service, actionItem.id);
    }
  }

  handleServiceAction(service, actionID) {
    const { modalHandlers, router } = this.context;

    switch (actionID) {
      case EDIT:
        router.push(
          `/services/detail/${encodeURIComponent(service.getId())}/edit/`
        );
        break;
      case SCALE:
        modalHandlers.scaleService({ service });
        break;
      case OPEN:
        modalHandlers.openServiceUI({ service });
        break;
      case RESTART:
        modalHandlers.restartService({ service });
        break;
      case RESUME:
        modalHandlers.resumeService({ service });
        break;
      case SUSPEND:
        modalHandlers.suspendService({ service });
        break;
      case DELETE:
        modalHandlers.deleteService({ service });
        break;
    }
  }

  handleActionDisabledModalOpen(actionDisabledService, actionDisabledID) {
    this.setState({ actionDisabledService, actionDisabledID });
  }

  handleActionDisabledModalClose() {
    this.setState({ actionDisabledService: null, actionDisabledID: null });
  }

  getOpenInNewWindowLink(service) {
    // This might be a serviceTree and therefore we need this check
    // And getWebURL might therefore not be available
    if (!this.hasWebUI(service)) {
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

  hasWebUI(service) {
    return (
      service instanceof Service &&
      !isSDKService(service) &&
      service.getWebURL() != null &&
      service.getWebURL() !== ""
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
    const scaleTextID = isGroup
      ? ServiceActionLabels.scale_by
      : ServiceActionLabels[SCALE];
    const isSDK = isSDKService(service);

    const actions = [];

    actions.push({
      className: "hidden",
      id: MORE,
      html: "",
      selectedHtml: <Icon id="ellipsis-vertical" size="mini" />
    });

    if (this.hasWebUI(service)) {
      actions.push({
        id: OPEN,
        html: this.props.intl.formatMessage({ id: ServiceActionLabels.open })
      });
    }

    if (!isGroup) {
      actions.push({
        id: EDIT,
        html: this.props.intl.formatMessage({ id: ServiceActionLabels.edit })
      });
    }

    // isSingleInstanceApp = Framework main scheduler
    // instancesCount = service instances
    if ((isGroup && instancesCount > 0) || (!isGroup && !isSingleInstanceApp)) {
      actions.push({
        id: SCALE,
        html: this.props.intl.formatMessage({ id: scaleTextID })
      });
    }

    if (!isPod && !isGroup && instancesCount > 0 && !isSDK) {
      actions.push({
        id: RESTART,
        html: this.props.intl.formatMessage({
          id: ServiceActionLabels[RESTART]
        })
      });
    }

    if (instancesCount > 0 && !isSDK) {
      actions.push({
        id: SUSPEND,
        html: this.props.intl.formatMessage({
          id: ServiceActionLabels[SUSPEND]
        })
      });
    }

    if (!isGroup && instancesCount === 0 && !isSDK) {
      actions.push({
        id: RESUME,
        html: this.props.intl.formatMessage({
          id: ServiceActionLabels[RESUME]
        })
      });
    }

    actions.push({
      id: DELETE,
      html: (
        <span className="text-danger">
          {this.props.intl.formatMessage({
            id: ServiceActionLabels[DELETE]
          })}
        </span>
      )
    });

    return (
      <Tooltip content="More actions">
        <Dropdown
          anchorRight={true}
          buttonClassName="button button-mini button-link"
          dropdownMenuClassName="dropdown-menu"
          dropdownMenuListClassName="dropdown-menu-list"
          dropdownMenuListItemClassName="clickable"
          wrapperClassName="dropdown flush-bottom table-cell-icon"
          items={actions}
          persistentID={MORE}
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
    const serviceStatusText = service.getStatus();
    const serviceStatusClassSet = StatusMapping[serviceStatusText] || "";
    const { key: serviceStatusKey } = service.getServiceStatus();
    const tasksSummary = service.getTasksSummary();
    const tasksRunning = service.getRunningInstancesCount();
    const isDeploying =
      serviceStatusKey === ServiceStatusTypes.WAITING ||
      serviceStatusKey === ServiceStatusTypes.DEPLOYING;

    const conciseOverview = tasksRunning === instancesCount
      ? ` (${tasksRunning})`
      : ` (${tasksRunning}/${instancesCount})`;

    const verboseOverview = tasksRunning === instancesCount
      ? ` (${tasksRunning} ${StringUtil.pluralize("Instance", tasksRunning)})`
      : ` (${tasksRunning} of ${instancesCount} Instances)`;

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
          <span className={serviceStatusClassSet}>
            {serviceStatusText}
          </span>
          <span className="hidden-large-down">{verboseOverview}</span>
          <span className="hidden-jumbo-up">{conciseOverview}</span>
          <ServiceStatusWarning item={service} />
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

  renderInstances(prop, service) {
    const instancesCount = service.getInstancesCount();
    const runningInstances = service.getRunningInstancesCount();
    const overview = runningInstances === instancesCount
      ? ` ${runningInstances}`
      : ` ${runningInstances}/${instancesCount}`;

    const content = !Number.isInteger(instancesCount) ? "\u2014" : overview;
    const tooltipContent = (
      <span>
        {`${runningInstances} ${StringUtil.pluralize("instance", runningInstances)} running out of ${instancesCount}`}
      </span>
    );

    return (
      <Tooltip content={tooltipContent}>
        <span>
          {content}
        </span>
      </Tooltip>
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
    const { actionDisabledService, actionDisabledID } = this.state;

    return (
      <div>
        <Table
          buildRowOptions={this.getRowAttributes}
          className="table service-table table-borderless-outer table-borderless-inner-columns table-hover flush-bottom"
          columns={this.getColumns()}
          colGroup={this.getColGroup()}
          data={this.props.services.slice()}
          itemHeight={TableUtil.getRowHeight()}
          containerSelector=".gm-scroll-view"
          sortBy={{ prop: "name", order: "asc" }}
        />
        <ServiceActionDisabledModal
          actionID={actionDisabledID}
          open={actionDisabledService != null}
          onClose={this.handleActionDisabledModalClose}
          service={actionDisabledService}
        />
      </div>
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
  }).isRequired,
  router: routerShape
};

ServicesTable.defaultProps = {
  isFiltered: false,
  services: []
};

ServicesTable.propTypes = {
  isFiltered: PropTypes.bool,
  services: PropTypes.array
};

module.exports = injectIntl(ServicesTable);
