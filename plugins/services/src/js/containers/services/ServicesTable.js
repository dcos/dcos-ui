import * as React from "react";
import { Trans } from "@lingui/macro";
import { Tooltip } from "reactjs-components";
import { routerShape } from "react-router";
import PropTypes from "prop-types";
import { Icon, Table, Column, SortableHeaderCell } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import Loader from "#SRC/js/components/Loader";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import { isSDKService } from "../../utils/ServiceUtil";

import { ServiceActionItem } from "../../constants/ServiceActionItem";
import ServiceActionLabels from "../../constants/ServiceActionLabels";
import * as ServiceStatus from "../../constants/ServiceStatus";
import ServiceTree from "../../structs/ServiceTree";
import Pod from "../../structs/Pod";
import ServiceActionDisabledModal from "../../components/modals/ServiceActionDisabledModal";

import {
  nameRenderer,
  nameSorter
} from "../../columns/ServicesTableNameColumn";
import {
  statusRenderer,
  statusSorter
} from "../../columns/ServicesTableStatusColumn";
import {
  versionRenderer,
  versionSorter
} from "../../columns/ServicesTableVersionColumn";
import {
  regionRenderer,
  regionSorter
} from "../../columns/ServicesTableRegionColumn";
import {
  instancesRenderer,
  instancesSorter
} from "../../columns/ServicesTableInstancesColumn";
import { cpuRenderer, cpuSorter } from "../../columns/ServicesTableCPUColumn";
import { memRenderer, memSorter } from "../../columns/ServicesTableMemColumn";
import {
  diskRenderer,
  diskSorter
} from "../../columns/ServicesTableDiskColumn";
import { gpuRenderer, gpuSorter } from "../../columns/ServicesTableGPUColumn";
import { actionsRendererFactory } from "../../columns/ServicesTableActionsColumn";

const DELETE = ServiceActionItem.DELETE;
const EDIT = ServiceActionItem.EDIT;
const MORE = ServiceActionItem.MORE;
const OPEN = ServiceActionItem.OPEN;
const RESTART = ServiceActionItem.RESTART;
const RESUME = ServiceActionItem.RESUME;
const SCALE = ServiceActionItem.SCALE;
const STOP = ServiceActionItem.STOP;

const METHODS_TO_BIND = [
  "handleServiceAction",
  "handleActionDisabledModalOpen",
  "handleActionDisabledModalClose",
  "handleSortClick"
];

class ServicesTable extends React.Component {
  constructor() {
    super(...arguments);
    this.actionsRenderer = actionsRendererFactory(
      this.handleActionDisabledModalOpen.bind(this),
      this.handleServiceAction.bind(this)
    );

    this.state = {
      actionDisabledService: null,
      data: [],
      sortColumn: "name",
      sortDirection: "ASC"
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      this.updateData(
        nextProps.services,
        this.state.sortColumn,
        this.state.sortDirection
      )
    );
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
      case STOP:
        modalHandlers.stopService({ service });
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
        className="table-cell-icon"
        href={service.getWebURL()}
        target="_blank"
        title="Open in a new window"
      >
        <span className="icon-margin-left">
          <Icon
            color={greyDark}
            shape={SystemIcons.OpenExternal}
            size={iconSizeXs}
          />
        </span>
      </a>
    );
  }

  getImage(service) {
    if (service instanceof ServiceTree) {
      // Get serviceTree image/icon
      return (
        <span className="icon-margin-right">
          <Icon color={greyDark} shape={SystemIcons.Folder} size={iconSizeXs} />
        </span>
      );
    }

    // Get service image/icon
    return (
      <span className="icon icon-mini icon-image-container icon-app-container icon-margin-right">
        <img src={service.getImages()["icon-small"]} />
      </span>
    );
  }

  handleSortClick(columnName) {
    const toggledDirection =
      this.state.sortDirection === "ASC" || this.state.sortColumn !== columnName
        ? "DESC"
        : "ASC";

    this.setState(
      this.updateData(
        this.state.data,
        columnName,
        toggledDirection,
        this.state.sortDirection,
        this.state.sortColumn
      )
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
      selectedHtml: (
        <Icon shape={SystemIcons.EllipsisVertical} size={iconSizeXs} />
      )
    });

    if (this.hasWebUI(service)) {
      actions.push({
        id: OPEN,
        html: <Trans render="span" id={ServiceActionLabels.open} />
      });
    }

    if (!isGroup) {
      actions.push({
        id: EDIT,
        html: <Trans render="span" id={ServiceActionLabels.edit} />
      });
    }

    // isSingleInstanceApp = Framework main scheduler
    // instancesCount = service instances
    if ((isGroup && instancesCount > 0) || (!isGroup && !isSingleInstanceApp)) {
      actions.push({
        id: SCALE,
        html: <Trans render="span" id={scaleTextID} />
      });
    }

    if (!isPod && !isGroup && instancesCount > 0 && !isSDK) {
      actions.push({
        id: RESTART,
        html: <Trans render="span" id={ServiceActionLabels[RESTART]} />
      });
    }

    if (instancesCount > 0 && !isSDK) {
      actions.push({
        id: STOP,
        html: <Trans render="span" id={ServiceActionLabels[STOP]} />
      });
    }

    if (!isGroup && instancesCount === 0 && !isSDK) {
      actions.push({
        id: RESUME,
        html: <Trans render="span" id={ServiceActionLabels[RESUME]} />
      });
    }

    actions.push({
      id: DELETE,
      html: (
        <Trans
          render="span"
          className="text-danger"
          id={ServiceActionLabels[DELETE]}
        />
      )
    });

    if (service.getServiceStatus() === ServiceStatus.DELETING) {
      return this.renderServiceActionsDropdown(service, actions);
    }

    return (
      <Tooltip content={<Trans render="span">More actions</Trans>}>
        {this.renderServiceActionsDropdown(service, actions)}
      </Tooltip>
    );
  }

  retrieveSortFunction(sortColumn) {
    switch (sortColumn) {
      case "name":
        return nameSorter;
      case "status":
        return statusSorter;
      case "version":
        return versionSorter;
      case "region":
        return regionSorter;
      case "instances":
        return instancesSorter;
      case "cpus":
        return cpuSorter;
      case "mem":
        return memSorter;
      case "disk":
        return diskSorter;
      case "gpus":
        return gpuSorter;
      default:
        return (data, _sortDirection) => data;
    }
  }

  sortGroupsOnTop(data) {
    const groups = data.filter(service => service instanceof ServiceTree);
    const services = data.filter(service => !(service instanceof ServiceTree));

    return groups.concat(services);
  }

  updateData(
    data,
    sortColumn,
    sortDirection,
    currentSortDirection,
    currentSortColumn
  ) {
    const copiedData = data.slice();

    if (
      sortDirection === currentSortDirection &&
      sortColumn === currentSortColumn
    ) {
      return { data: copiedData, sortDirection, sortColumn };
    }

    if (
      sortDirection !== currentSortDirection &&
      sortColumn === currentSortColumn
    ) {
      return { data: copiedData.reverse(), sortDirection, sortColumn };
    }

    const sortFunction = this.retrieveSortFunction(sortColumn);

    return {
      data: sortFunction(copiedData, sortDirection),
      sortDirection,
      sortColumn
    };
  }

  render() {
    const {
      actionDisabledService,
      actionDisabledID,
      data,
      sortColumn,
      sortDirection
    } = this.state;

    const sortedGroups = this.sortGroupsOnTop(data);
    if (data.length === 0) {
      if (this.props.isFiltered === false) {
        return <Loader />;
      } else {
        return <div>No data.</div>;
      }
    }

    return (
      <div className="table-wrapper service-table">
        <Table
          data={sortedGroups.slice()}
          rowHeight={this.props.isFiltered ? 45 : 35}
        >
          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Name</Trans>}
                sortHandler={this.handleSortClick.bind(null, "name")}
                sortDirection={sortColumn === "name" ? sortDirection : null}
              />
            }
            cellRenderer={nameRenderer.bind(
              null,
              this.props.isFiltered,
              ...arguments
            )}
            minWidth={250}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={
                  <span>
                    <Trans render="span">Status</Trans>{" "}
                    <Tooltip
                      interactive={true}
                      wrapperClassName="tooltip-wrapper"
                      wrapText={true}
                      content={
                        <Trans render="span">
                          At-a-glance overview of the global application or
                          group state.{" "}
                          <a
                            href={MetadataStore.buildDocsURI(
                              "/deploying-services/task-handling"
                            )}
                            target="_blank"
                          >
                            Read more
                          </a>.
                        </Trans>
                      }
                    >
                      <span className="icon-margin-right">
                        <Icon
                          color={greyDark}
                          shape={SystemIcons.CircleQuestion}
                          size={iconSizeXs}
                        />
                      </span>
                    </Tooltip>
                  </span>
                }
                sortHandler={this.handleSortClick.bind(null, "status")}
                sortDirection={sortColumn === "status" ? sortDirection : null}
              />
            }
            cellRenderer={statusRenderer}
            maxWidth={210}
            growToFill={true}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Version</Trans>}
                sortHandler={this.handleSortClick.bind(null, "version")}
                sortDirection={sortColumn === "version" ? sortDirection : null}
              />
            }
            cellRenderer={versionRenderer}
            growToFill={true}
            maxWidth={120}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Region</Trans>}
                sortHandler={this.handleSortClick.bind(null, "region")}
                sortDirection={sortColumn === "region" ? sortDirection : null}
              />
            }
            cellRenderer={regionRenderer}
            growToFill={true}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Instances</Trans>}
                sortHandler={this.handleSortClick.bind(null, "instances")}
                sortDirection={
                  sortColumn === "instances" ? sortDirection : null
                }
                textAlign="right"
              />
            }
            cellRenderer={instancesRenderer}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">CPU</Trans>}
                sortHandler={this.handleSortClick.bind(null, "cpus")}
                sortDirection={sortColumn === "cpus" ? sortDirection : null}
                textAlign="right"
              />
            }
            cellRenderer={cpuRenderer}
            minWidth={100}
            maxWidth={100}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Mem</Trans>}
                sortHandler={this.handleSortClick.bind(null, "mem")}
                sortDirection={sortColumn === "mem" ? sortDirection : null}
                textAlign="right"
              />
            }
            cellRenderer={memRenderer}
            minWidth={100}
            maxWidth={100}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Disk</Trans>}
                sortHandler={this.handleSortClick.bind(null, "disk")}
                sortDirection={sortColumn === "disk" ? sortDirection : null}
                textAlign="right"
              />
            }
            cellRenderer={diskRenderer}
            minWidth={100}
            maxWidth={100}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">GPU</Trans>}
                sortHandler={this.handleSortClick.bind(null, "gpu")}
                sortDirection={sortColumn === "gpus" ? sortDirection : null}
                textAlign="right"
              />
            }
            cellRenderer={gpuRenderer}
            minWidth={100}
            maxWidth={100}
          />

          <Column
            cellRenderer={this.actionsRenderer}
            handleActionDisabledModalOpen={this.handleActionDisabledModalOpen}
            handleServiceAction={this.handleServiceAction}
            minWidth={50}
            maxWidth={50}
          />
        </Table>
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
    stopService: PropTypes.func,
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

module.exports = ServicesTable;
