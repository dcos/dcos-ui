import * as React from "react";
import { Trans } from "@lingui/macro";
import { Tooltip } from "reactjs-components";
import { routerShape } from "react-router";
import PropTypes from "prop-types";

import { componentFromStream } from "@dcos/data-service";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { Icon, Table, Column, SortableHeaderCell } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import CompositeState from "#SRC/js/structs/CompositeState";

import Loader from "#SRC/js/components/Loader";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import TableColumnResizeStore from "#SRC/js/stores/TableColumnResizeStore";
import {
  MesosMasterRequestType,
  getMasterRegionName
} from "#SRC/js/core/MesosMasterRequest";
import container from "#SRC/js/container";
import TableUtil from "#SRC/js/utils/TableUtil";

import { isSDKService } from "../../utils/ServiceUtil";

import { ServiceActionItem } from "../../constants/ServiceActionItem";
import ServiceActionLabels from "../../constants/ServiceActionLabels";
import * as ServiceStatus from "../../constants/ServiceStatus";
import ServiceTree from "../../structs/ServiceTree";
import Pod from "../../structs/Pod";
import ServiceActionDisabledModal from "../../components/modals/ServiceActionDisabledModal";

import {
  nameRenderer,
  nameSorter,
  nameWidth
} from "../../columns/ServicesTableNameColumn";
import {
  statusRenderer,
  statusSorter,
  statusWidth
} from "../../columns/ServicesTableStatusColumn";
import {
  versionRenderer,
  versionSorter,
  versionWidth
} from "../../columns/ServicesTableVersionColumn";
import {
  regionRendererFactory,
  regionSorter,
  regionWidth
} from "../../columns/ServicesTableRegionColumn";
import {
  instancesRenderer,
  instancesSorter,
  instancesWidth
} from "../../columns/ServicesTableInstancesColumn";
import {
  cpuRenderer,
  cpuSorter,
  cpuWidth
} from "../../columns/ServicesTableCPUColumn";
import {
  memRenderer,
  memSorter
  // memWidth
} from "../../columns/ServicesTableMemColumn";
import {
  diskRenderer,
  diskSorter,
  diskWidth
} from "../../columns/ServicesTableDiskColumn";
import {
  gpuRenderer,
  gpuSorter
  // gpuWidth
} from "../../columns/ServicesTableGPUColumn";
import { actionsRendererFactory } from "../../columns/ServicesTableActionsColumn";

const DELETE = ServiceActionItem.DELETE;
const EDIT = ServiceActionItem.EDIT;
const MORE = ServiceActionItem.MORE;
const OPEN = ServiceActionItem.OPEN;
const RESTART = ServiceActionItem.RESTART;
const RESUME = ServiceActionItem.RESUME;
const SCALE = ServiceActionItem.SCALE;
const STOP = ServiceActionItem.STOP;

const columnWidthsStorageKey = "servicesTableColWidths";

const METHODS_TO_BIND = [
  "handleServiceAction",
  "handleActionDisabledModalOpen",
  "handleActionDisabledModalClose",
  "handleSortClick"
];

class ServicesTable extends React.Component {
  constructor(props) {
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

    this.regionRenderer = regionRendererFactory(props.masterRegionName);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  // this page does not use the composite state anymore, so let's not calculate it
  componentDidMount() {
    CompositeState.disable();
  }

  componentWillUnmount() {
    CompositeState.enable();
  }

  componentWillReceiveProps(nextProps) {
    this.regionRenderer = regionRendererFactory(nextProps.masterRegionName);

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

  handleResize(columnName, resizedColWidth) {
    const savedColWidths = TableColumnResizeStore.get(columnWidthsStorageKey);
    TableColumnResizeStore.set(columnWidthsStorageKey, {
      ...savedColWidths,
      [columnName]: resizedColWidth
    });
  }

  render() {
    const {
      actionDisabledService,
      actionDisabledID,
      data,
      sortColumn,
      sortDirection
    } = this.state;

    if (data.length === 0) {
      if (this.props.isFiltered === false) {
        return <Loader />;
      } else {
        return <div>No data.</div>;
      }
    }
    const sortedGroups = this.sortGroupsOnTop(data);

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
            growToFill={
              !TableUtil.isColWidthCustom(columnWidthsStorageKey, "name")
            }
            minWidth={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "name")
                ? undefined
                : 200
            }
            resizable={true}
            onResize={this.handleResize.bind(null, "name")}
            width={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "name")
                ? nameWidth
                : undefined
            }
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
                          </a>
                          .
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
            growToFill={
              !TableUtil.isColWidthCustom(columnWidthsStorageKey, "status")
            }
            minWidth={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "status")
                ? undefined
                : 210
            }
            resizable={true}
            onResize={this.handleResize.bind(null, "status")}
            width={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "status")
                ? statusWidth
                : undefined
            }
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
            growToFill={
              !TableUtil.isColWidthCustom(columnWidthsStorageKey, "version")
            }
            maxWidth={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "version")
                ? undefined
                : 120
            }
            resizable={true}
            onResize={this.handleResize.bind(null, "version")}
            width={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "version")
                ? versionWidth
                : undefined
            }
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Region</Trans>}
                sortHandler={this.handleSortClick.bind(null, "region")}
                sortDirection={sortColumn === "region" ? sortDirection : null}
              />
            }
            cellRenderer={this.regionRenderer}
            growToFill={
              !TableUtil.isColWidthCustom(columnWidthsStorageKey, "region")
            }
            minWidth={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "region")
                ? undefined
                : 60
            }
            maxWidth={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "region")
                ? undefined
                : 150
            }
            resizable={true}
            onResize={this.handleResize.bind(null, "region")}
            width={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "region")
                ? regionWidth
                : undefined
            }
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
            growToFill={
              !TableUtil.isColWidthCustom(columnWidthsStorageKey, "instances")
            }
            minWidth={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "instances")
                ? undefined
                : 100
            }
            maxWidth={
              !TableUtil.isColWidthCustom(columnWidthsStorageKey, "instances")
                ? undefined
                : 120
            }
            resizable={true}
            onResize={this.handleResize.bind(null, "instances")}
            width={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "instances")
                ? instancesWidth
                : undefined
            }
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
            minWidth={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "cpu")
                ? undefined
                : 70
            }
            maxWidth={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "cpu")
                ? undefined
                : 100
            }
            growToFill={
              !TableUtil.isColWidthCustom(columnWidthsStorageKey, "cpu")
            }
            resizable={true}
            onResize={this.handleResize.bind(null, "cpu")}
            width={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "cpu")
                ? cpuWidth
                : undefined
            }
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
            growToFill={true}
            minWidth={120}
            maxWidth={150}
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
            growToFill={
              !TableUtil.isColWidthCustom(columnWidthsStorageKey, "disk")
            }
            minWidth={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "disk")
                ? undefined
                : 100
            }
            maxWidth={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "disk")
                ? undefined
                : 120
            }
            resizable={true}
            onResize={this.handleResize.bind(null, "disk")}
            width={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "disk")
                ? diskWidth
                : undefined
            }
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
            growToFill={true}
            minWidth={50}
            maxWidth={70}
          />

          <Column
            cellRenderer={this.actionsRenderer}
            handleActionDisabledModalOpen={this.handleActionDisabledModalOpen}
            handleServiceAction={this.handleServiceAction}
            growToFill={true}
            minWidth={24}
            maxWidth={36}
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

function withMasterRegionName(Component) {
  const master$ = container
    .get(MesosMasterRequestType)
    .pipe(map(data => JSON.parse(data)));
  const masterRegionName$ = getMasterRegionName(master$);

  return componentFromStream(prop$ =>
    combineLatest([prop$, masterRegionName$]).pipe(
      map(([props, masterRegionName]) => (
        <Component {...props} masterRegionName={masterRegionName} />
      ))
    )
  );
}

module.exports = withMasterRegionName(ServicesTable);
