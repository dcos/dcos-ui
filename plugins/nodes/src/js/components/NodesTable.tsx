import * as React from "react";
import {
  Table,
  Column,
  SortableHeaderCell,
  HeaderCell
} from "@dcos/ui-kit/dist/packages";
import { Trans } from "@lingui/macro";
import isEqual from "lodash/isEqual";

import NodesList from "#SRC/js/structs/NodesList";
import Node from "#SRC/js/structs/Node";
import Loader from "#SRC/js/components/Loader";
import TableUtil from "#SRC/js/utils/TableUtil";
import TableColumnResizeStore from "#SRC/js/stores/TableColumnResizeStore";

import { SortDirection } from "../types/SortDirection";

import { ipSorter, ipRenderer, ipWidth } from "../columns/NodesTableIpColumn";
import {
  typeSorter,
  typeRenderer,
  typeWidth
} from "../columns/NodesTableTypeColumn";
import {
  regionSorter,
  regionRenderer,
  regionWidth
} from "../columns/NodesTableRegionColumn";
import {
  zoneSorter,
  zoneRenderer,
  zoneWidth
} from "../columns/NodesTableZoneColumn";
import {
  healthSorter,
  healthRenderer,
  healthWidth
} from "../columns/NodesTableHealthColumn";
import {
  tasksSorter,
  tasksRenderer,
  tasksWidth
} from "../columns/NodesTableTasksColumn";
import {
  cpuSorter,
  cpuRenderer,
  cpuWidth
} from "../columns/NodesTableCPUColumn";
import {
  memSorter,
  memRenderer,
  memWidth
} from "../columns/NodesTableMemColumn";
import {
  diskSorter,
  diskRenderer,
  diskWidth
} from "../columns/NodesTableDiskColumn";
import {
  gpuSorter,
  gpuRenderer,
  gpuWidth
} from "../columns/NodesTableGPUColumn";

import PublicIPColumn, {
  publicIPWidth
} from "../columns/NodesTablePublicIPColumn";

interface NodesTableProps {
  withPublicIP: boolean;
  hosts: NodesList;
  nodeHealthResponse: boolean;
  masterRegion: string;
}

interface NodesTableState {
  data: Node[] | null;
  sortDirection: SortDirection;
  sortColumn: string;
}

type SortFunction<T> = (data: T[], sortDirection: SortDirection) => T[];

export const columnWidthsStorageKey = "nodesTableColWidths";

export default class NodesTable extends React.Component<
  NodesTableProps,
  NodesTableState
> {
  // This workaround will be removed in DCOS-39332
  private regionRenderer: (data: Node) => React.ReactNode;

  constructor(props: Readonly<NodesTableProps>) {
    super(props);

    this.state = {
      data: null,
      sortColumn: "health",
      sortDirection: "ASC"
    };

    this.handleSortClick = this.handleSortClick.bind(this);
    this.regionRenderer = (data: Node) =>
      regionRenderer(this.props.masterRegion, data);
  }

  retrieveSortFunction(sortColumn: string): SortFunction<Node> {
    switch (sortColumn) {
      case "host":
        return ipSorter;
      case "type":
        return typeSorter;
      case "region":
        return regionSorter;
      case "zone":
        return zoneSorter;
      case "health":
        return healthSorter;
      case "tasks":
        return tasksSorter;
      case "cpu":
        return cpuSorter;
      case "mem":
        return memSorter;
      case "disk":
        return diskSorter;
      case "gpu":
        return gpuSorter;
      default:
        return (data, _sortDirection) => data;
    }
  }

  updateData(
    data: Node[] | null,
    sortColumn: string,
    sortDirection: SortDirection,
    currentSortDirection?: SortDirection,
    currentSortColumn?: string
  ): NodesTableState {
    if (data === null) {
      return {
        data: null,
        sortDirection,
        sortColumn
      };
    }

    const copiedData = data.slice();
    if (
      sortDirection === currentSortDirection &&
      sortColumn === currentSortColumn
    ) {
      return {
        data: copiedData,
        sortDirection,
        sortColumn
      };
    }

    if (
      sortDirection !== currentSortDirection &&
      sortColumn === currentSortColumn
    ) {
      return {
        data: copiedData.reverse(),
        sortDirection,
        sortColumn
      };
    }

    const sortFunction = this.retrieveSortFunction(sortColumn);

    return {
      data: sortFunction(copiedData, sortDirection),
      sortDirection,
      sortColumn
    };
  }

  handleSortClick = (columnName: string) => () => {
    const toggledDirection =
      this.state.sortDirection === "ASC" || this.state.sortColumn !== columnName
        ? "DESC"
        : "ASC";

    if (this.state.data !== null) {
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
  };

  handleResize = (columnName: string) => (resizedColWidth: number) => {
    const savedColWidths = TableColumnResizeStore.get(columnWidthsStorageKey);
    TableColumnResizeStore.set(columnWidthsStorageKey, {
      ...savedColWidths,
      [columnName]: resizedColWidth
    });
  };

  shouldComponentUpdate(
    nextProps: NodesTableProps,
    nextState: NodesTableState
  ) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  }

  componentWillReceiveProps(nextProps: NodesTableProps): void {
    this.setState(
      this.updateData(
        nextProps.hosts ? nextProps.hosts.getItems() : null,
        this.state.sortColumn,
        this.state.sortDirection
      )
    );
  }

  render() {
    const { data, sortColumn, sortDirection } = this.state;
    const { withPublicIP } = this.props;

    if (data === null) {
      return <Loader />;
    }

    const columns = [
      <Column
        key="hostname"
        header={
          <SortableHeaderCell
            columnContent={<Trans render="span">Host</Trans>}
            sortHandler={this.handleSortClick("host")}
            sortDirection={sortColumn === "host" ? sortDirection : null}
          />
        }
        cellRenderer={ipRenderer}
        minWidth={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "host")
            ? undefined
            : 120
        }
        resizable={true}
        onResize={this.handleResize("host")}
        width={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "host")
            ? ipWidth
            : undefined
        }
      />,
      <Column
        key="health"
        header={
          <SortableHeaderCell
            columnContent={<Trans render="span">Health</Trans>}
            sortHandler={this.handleSortClick("health")}
            sortDirection={sortColumn === "health" ? sortDirection : null}
          />
        }
        cellRenderer={healthRenderer}
        minWidth={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "health")
            ? undefined
            : 80
        }
        maxWidth={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "health")
            ? undefined
            : 100
        }
        resizable={true}
        onResize={this.handleResize("health")}
        width={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "health")
            ? healthWidth
            : undefined
        }
      />,
      withPublicIP ? (
        <Column
          key="public_ip"
          header={
            <HeaderCell>
              <Trans>Public IP</Trans>
            </HeaderCell>
          }
          cellRenderer={PublicIPColumn}
          minWidth={
            TableUtil.isColWidthCustom(columnWidthsStorageKey, "publicIP")
              ? undefined
              : 125
          }
          resizable={true}
          onResize={this.handleResize("publicIP")}
          width={
            TableUtil.isColWidthCustom(columnWidthsStorageKey, "publicIP")
              ? publicIPWidth
              : undefined
          }
        />
      ) : null,
      <Column
        key="type"
        header={
          <SortableHeaderCell
            columnContent={<Trans render="span">Type</Trans>}
            sortHandler={this.handleSortClick("type")}
            sortDirection={sortColumn === "type" ? sortDirection : null}
          />
        }
        cellRenderer={typeRenderer}
        maxWidth={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "type")
            ? undefined
            : 70
        }
        resizable={true}
        onResize={this.handleResize("type")}
        width={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "type")
            ? typeWidth
            : undefined
        }
      />,
      <Column
        key="region"
        header={
          <SortableHeaderCell
            columnContent={<Trans render="span">Region</Trans>}
            sortHandler={this.handleSortClick("region")}
            sortDirection={sortColumn === "region" ? sortDirection : null}
          />
        }
        cellRenderer={this.regionRenderer}
        minWidth={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "region")
            ? undefined
            : 170
        }
        resizable={true}
        onResize={this.handleResize("region")}
        width={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "region")
            ? regionWidth
            : undefined
        }
      />,
      <Column
        key="zone"
        header={
          <SortableHeaderCell
            columnContent={<Trans render="span">Zone</Trans>}
            sortHandler={this.handleSortClick("zone")}
            sortDirection={sortColumn === "zone" ? sortDirection : null}
          />
        }
        cellRenderer={zoneRenderer}
        minWidth={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "zone")
            ? undefined
            : 100
        }
        resizable={true}
        onResize={this.handleResize("zone")}
        width={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "zone")
            ? zoneWidth
            : undefined
        }
      />,
      <Column
        key="tasks"
        header={
          <SortableHeaderCell
            columnContent={<Trans render="span">Tasks</Trans>}
            sortHandler={this.handleSortClick("tasks")}
            sortDirection={sortColumn === "tasks" ? sortDirection : null}
            textAlign="right"
          />
        }
        cellRenderer={tasksRenderer}
        minWidth={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "tasks")
            ? undefined
            : 60
        }
        maxWidth={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "tasks")
            ? undefined
            : 80
        }
        resizable={true}
        onResize={this.handleResize("tasks")}
        width={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "tasks")
            ? tasksWidth
            : undefined
        }
      />,
      <Column
        key="cpu"
        header={
          <SortableHeaderCell
            columnContent={<Trans render="span">CPU</Trans>}
            sortHandler={this.handleSortClick("cpu")}
            sortDirection={sortColumn === "cpu" ? sortDirection : null}
          />
        }
        cellRenderer={cpuRenderer}
        growToFill={!TableUtil.isColWidthCustom(columnWidthsStorageKey, "cpu")}
        minWidth={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "cpu")
            ? undefined
            : 110
        }
        resizable={true}
        onResize={this.handleResize("cpu")}
        width={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "cpu")
            ? cpuWidth
            : undefined
        }
      />,
      <Column
        key="mem"
        header={
          <SortableHeaderCell
            columnContent={<Trans render="span">Mem</Trans>}
            sortHandler={this.handleSortClick("mem")}
            sortDirection={sortColumn === "mem" ? sortDirection : null}
          />
        }
        cellRenderer={memRenderer}
        growToFill={!TableUtil.isColWidthCustom(columnWidthsStorageKey, "mem")}
        minWidth={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "mem")
            ? undefined
            : 110
        }
        resizable={true}
        onResize={this.handleResize("mem")}
        width={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "mem")
            ? memWidth
            : undefined
        }
      />,
      <Column
        key="disk"
        header={
          <SortableHeaderCell
            columnContent={<Trans render="span">Disk</Trans>}
            sortHandler={this.handleSortClick("disk")}
            sortDirection={sortColumn === "disk" ? sortDirection : null}
          />
        }
        cellRenderer={diskRenderer}
        growToFill={!TableUtil.isColWidthCustom(columnWidthsStorageKey, "disk")}
        minWidth={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "disk")
            ? undefined
            : 110
        }
        resizable={true}
        onResize={this.handleResize("disk")}
        width={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "disk")
            ? diskWidth
            : undefined
        }
      />,
      <Column
        key="gpu"
        header={
          <SortableHeaderCell
            columnContent={<Trans render="span">GPU</Trans>}
            sortHandler={this.handleSortClick("gpu")}
            sortDirection={sortColumn === "gpu" ? sortDirection : null}
          />
        }
        cellRenderer={gpuRenderer}
        growToFill={!TableUtil.isColWidthCustom(columnWidthsStorageKey, "gpu")}
        minWidth={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "gpu")
            ? undefined
            : 110
        }
        resizable={true}
        onResize={this.handleResize("gpu")}
        width={
          TableUtil.isColWidthCustom(columnWidthsStorageKey, "gpu")
            ? gpuWidth
            : undefined
        }
      />
    ].filter((col): col is React.ReactElement => col !== null);

    return (
      <div className="table-wrapper">
        <Table data={data}>{columns}</Table>
      </div>
    );
  }
}
