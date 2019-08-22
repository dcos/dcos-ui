import * as React from "react";
import { Trans } from "@lingui/macro";
import { Tooltip } from "reactjs-components";
import { routerShape } from "react-router";
import PropTypes from "prop-types";
import sort from "array-sort";

import { componentFromStream } from "@dcos/data-service";
import { combineLatest, pipe } from "rxjs";
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

import { ServiceActionItem } from "../../constants/ServiceActionItem";
import ServiceTree from "../../structs/ServiceTree";
import ServiceActionDisabledModal from "../../components/modals/ServiceActionDisabledModal";
import * as Version from "../../utils/Version";

import { nameRenderer, nameWidth } from "../../columns/ServicesTableNameColumn";
import {
  statusRenderer,
  statusWidth
} from "../../columns/ServicesTableStatusColumn";
import {
  versionRenderer,
  versionWidth
} from "../../columns/ServicesTableVersionColumn";
import {
  regionRendererFactory,
  regionWidth
} from "../../columns/ServicesTableRegionColumn";
import {
  instancesRenderer,
  instancesWidth
} from "../../columns/ServicesTableInstancesColumn";
import { cpuRenderer, cpuWidth } from "../../columns/ServicesTableCPUColumn";
import { memRenderer, memWidth } from "../../columns/ServicesTableMemColumn";
import { diskRenderer, diskWidth } from "../../columns/ServicesTableDiskColumn";
import { gpuRenderer, gpuWidth } from "../../columns/ServicesTableGPUColumn";

import { actionsRendererFactory } from "../../columns/ServicesTableActionsColumn";

const DELETE = ServiceActionItem.DELETE;
const EDIT = ServiceActionItem.EDIT;
const OPEN = ServiceActionItem.OPEN;
const RESTART = ServiceActionItem.RESTART;
const RESUME = ServiceActionItem.RESUME;
const SCALE = ServiceActionItem.SCALE;
const STOP = ServiceActionItem.STOP;
const RESET_DELAYED = ServiceActionItem.RESET_DELAYED;
const VIEW_PLANS = ServiceActionItem.VIEW_PLANS;

const METHODS_TO_BIND = [
  "handleServiceAction",
  "handleActionDisabledModalOpen",
  "handleActionDisabledModalClose",
  "handleSortClick"
];

const serviceToVersion = serviceTreeNode => {
  if (serviceTreeNode instanceof ServiceTree) {
    return "";
  }

  return pipe(Version.fromService)(serviceTreeNode);
};

function sortForColumn(name) {
  switch (name) {
    case "name":
      return (a, b) => a.getName().localeCompare(b.getName());
    case "status":
      return (a, b) =>
        b.getServiceStatus().priority - a.getServiceStatus().priority;
    case "version":
      return (a, b) =>
        Version.compare(serviceToVersion(a), serviceToVersion(b));
    case "region":
      return (a, b) => {
        return (a.getRegions()[0] || "") < (b.getRegions()[0] || "") ? 1 : -1;
      };
    case "instances":
      return (a, b) => a.getInstancesCount() - b.getInstancesCount();
    case "cpus":
      return (a, b) => a.getResources().cpus - b.getResources().cpus;
    case "mem":
      return (a, b) => a.getResources().mem - b.getResources().mem;
    case "disk":
      return (a, b) => a.getResources().disk - b.getResources().disk;
    case "gpus":
      return (a, b) => a.getResources().gpus - b.getResources().gpus;
    default:
      return () => 0;
  }
}

function sortData(
  data,
  sortColumn,
  sortDirection,
  currentSortDirection,
  currentSortColumn
) {
  const copiedData = data.slice();

  if (sortColumn === currentSortColumn) {
    return {
      data:
        sortDirection === currentSortDirection
          ? copiedData
          : copiedData.reverse(),
      sortColumn,
      sortDirection
    };
  }

  return {
    data: sort(copiedData, sortForColumn(sortColumn), {
      reverse: sortDirection !== "ASC"
    }),
    sortColumn,
    sortDirection
  };
}

export const columnWidthsStorageKey = "servicesTableColWidths";

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

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.regionRenderer = regionRendererFactory(nextProps.masterRegionName);

    this.setState(
      sortData(
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
      case VIEW_PLANS:
        router.push(
          `/services/detail/${encodeURIComponent(service.getId())}/plans/`
        );
        break;
      case SCALE:
        modalHandlers.scaleService({ service });
        break;
      case RESET_DELAYED:
        modalHandlers.resetDelayedService({ service });
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

  handleSortClick(columnName) {
    const toggledDirection =
      this.state.sortDirection === "ASC" || this.state.sortColumn !== columnName
        ? "DESC"
        : "ASC";

    this.setState(
      sortData(
        this.state.data,
        columnName,
        toggledDirection,
        this.state.sortDirection,
        this.state.sortColumn
      )
    );
  }

  sortGroupsOnTop(data) {
    const groups = data.filter(service => service instanceof ServiceTree);
    const services = data.filter(service => !(service instanceof ServiceTree));

    return [...groups, ...services];
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

    // Hiding the table when the create service modal is open.
    //
    // This is a workaround for an issue where Cypress' `type`
    // command would not work as expected when there is a table
    // with many resizable columns in the DOM
    return this.props.hideTable ? null : (
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
              false,
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
                columnContent={<Trans render="span">CPU Allocated</Trans>}
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
                columnContent={<Trans render="span">Mem Allocated</Trans>}
                sortHandler={this.handleSortClick.bind(null, "mem")}
                sortDirection={sortColumn === "mem" ? sortDirection : null}
                textAlign="right"
              />
            }
            cellRenderer={memRenderer}
            growToFill={
              !TableUtil.isColWidthCustom(columnWidthsStorageKey, "mem")
            }
            minWidth={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "mem")
                ? undefined
                : 120
            }
            maxWidth={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "mem")
                ? undefined
                : 150
            }
            resizable={true}
            onResize={this.handleResize.bind(null, "mem")}
            width={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "mem")
                ? memWidth
                : undefined
            }
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Disk Allocated</Trans>}
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
                columnContent={<Trans render="span">GPU Allocated</Trans>}
                sortHandler={this.handleSortClick.bind(null, "gpu")}
                sortDirection={sortColumn === "gpus" ? sortDirection : null}
                textAlign="right"
              />
            }
            cellRenderer={gpuRenderer}
            growToFill={
              !TableUtil.isColWidthCustom(columnWidthsStorageKey, "gpu")
            }
            minWidth={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "gpu")
                ? undefined
                : 50
            }
            maxWidth={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "gpu")
                ? undefined
                : 70
            }
            resizable={true}
            onResize={this.handleResize.bind(null, "gpu")}
            width={
              TableUtil.isColWidthCustom(columnWidthsStorageKey, "gpu")
                ? gpuWidth
                : undefined
            }
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
    deleteService: PropTypes.func,
    resetDelayedService: PropTypes.func
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

const Component = withMasterRegionName(ServicesTable);

export { Component as default, sortData };
