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
import {
  MesosMasterRequestType,
  getMasterRegionName
} from "#SRC/js/core/MesosMasterRequest";
import container from "#SRC/js/container";

import { ServiceActionItem } from "../../constants/ServiceActionItem";
import ServiceTree from "../../structs/ServiceTree";
import ServiceActionDisabledModal from "../../components/modals/ServiceActionDisabledModal";
import * as Version from "../../utils/Version";

import { nameRenderer } from "../../columns/ServicesTableNameColumn";
import { statusRenderer } from "../../columns/ServicesTableStatusColumn";
import { versionRenderer } from "../../columns/ServicesTableVersionColumn";
import { regionRendererFactory } from "../../columns/ServicesTableRegionColumn";
import { instancesRenderer } from "../../columns/ServicesTableInstancesColumn";
import { cpuRenderer } from "../../columns/ServicesTableCPUColumn";
import { memRenderer } from "../../columns/ServicesTableMemColumn";
import { diskRenderer } from "../../columns/ServicesTableDiskColumn";
import { gpuRenderer } from "../../columns/ServicesTableGPUColumn";
import { actionsRendererFactory } from "../../columns/ServicesTableActionsColumn";

const DELETE = ServiceActionItem.DELETE;
const EDIT = ServiceActionItem.EDIT;
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

const serviceToVersion = serviceTreeNode => {
  if (serviceTreeNode instanceof ServiceTree) {
    return "";
  }

  return pipe(
    Version.fromService,
    Version.toDisplayVersion
  )(serviceTreeNode);
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
            growToFill={true}
            minWidth={200}
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
            growToFill={true}
            minWidth={210}
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
            cellRenderer={this.regionRenderer}
            growToFill={true}
            minWidth={60}
            maxWidth={150}
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
            growToFill={true}
            minWidth={100}
            maxWidth={120}
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
            minWidth={70}
            maxWidth={100}
            growToFill={true}
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
            growToFill={true}
            minWidth={100}
            maxWidth={120}
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

const Component = withMasterRegionName(ServicesTable);

export { Component as default, sortData };
