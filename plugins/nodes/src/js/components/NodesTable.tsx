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

import { ipSorter, ipRenderer } from "../columns/NodesTableIpColumn";
import { typeSorter, typeRenderer } from "../columns/NodesTableTypeColumn";
import {
  regionSorter,
  regionRenderer
} from "../columns/NodesTableRegionColumn";
import { zoneSorter, zoneRenderer } from "../columns/NodesTableZoneColumn";
import {
  healthSorter,
  healthRenderer
} from "../columns/NodesTableHealthColumn";
import { tasksSorter, tasksRenderer } from "../columns/NodesTableTasksColumn";
import { cpuSorter, cpuRenderer } from "../columns/NodesTableCPUColumn";
import { memSorter, memRenderer } from "../columns/NodesTableMemColumn";
import { diskSorter, diskRenderer } from "../columns/NodesTableDiskColumn";
import { gpuSorter, gpuRenderer } from "../columns/NodesTableGPUColumn";

import PublicIPColumn from "../columns/NodesTablePublicIPColumn";

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

const hasCustomWidth = (column: string) =>
  TableUtil.isColWidthCustom(columnWidthsStorageKey, column);

const customWidthFor = (column: string) => () =>
  TableColumnResizeStore.get(columnWidthsStorageKey)[column];

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
        minWidth={hasCustomWidth("host") ? undefined : 120}
        resizable={true}
        onResize={this.handleResize("host")}
        width={hasCustomWidth("host") ? customWidthFor("host") : undefined}
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
        minWidth={hasCustomWidth("health") ? undefined : 80}
        maxWidth={hasCustomWidth("health") ? undefined : 100}
        resizable={true}
        onResize={this.handleResize("health")}
        width={hasCustomWidth("health") ? customWidthFor("health") : undefined}
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
          minWidth={hasCustomWidth("publicIP") ? undefined : 125}
          resizable={true}
          onResize={this.handleResize("publicIP")}
          width={
            hasCustomWidth("publicIP") ? customWidthFor("publicIP") : undefined
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
        maxWidth={hasCustomWidth("type") ? undefined : 70}
        resizable={true}
        onResize={this.handleResize("type")}
        width={hasCustomWidth("type") ? customWidthFor("type") : undefined}
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
        minWidth={hasCustomWidth("region") ? undefined : 170}
        resizable={true}
        onResize={this.handleResize("region")}
        width={hasCustomWidth("region") ? customWidthFor("region") : undefined}
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
        minWidth={hasCustomWidth("zone") ? undefined : 100}
        resizable={true}
        onResize={this.handleResize("zone")}
        width={hasCustomWidth("zone") ? customWidthFor("zone") : undefined}
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
        minWidth={hasCustomWidth("tasks") ? undefined : 60}
        maxWidth={hasCustomWidth("tasks") ? undefined : 80}
        resizable={true}
        onResize={this.handleResize("tasks")}
        width={hasCustomWidth("tasks") ? customWidthFor("tasks") : undefined}
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
        growToFill={!hasCustomWidth("cpu")}
        minWidth={hasCustomWidth("cpu") ? undefined : 110}
        resizable={true}
        onResize={this.handleResize("cpu")}
        width={hasCustomWidth("cpu") ? customWidthFor("cpu") : undefined}
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
        growToFill={!hasCustomWidth("mem")}
        minWidth={hasCustomWidth("mem") ? undefined : 110}
        resizable={true}
        onResize={this.handleResize("mem")}
        width={hasCustomWidth("mem") ? customWidthFor("mem") : undefined}
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
        growToFill={!hasCustomWidth("disk")}
        minWidth={hasCustomWidth("disk") ? undefined : 110}
        resizable={true}
        onResize={this.handleResize("disk")}
        width={hasCustomWidth("disk") ? customWidthFor("disk") : undefined}
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
        growToFill={!hasCustomWidth("gpu")}
        minWidth={hasCustomWidth("gpu") ? undefined : 110}
        resizable={true}
        onResize={this.handleResize("gpu")}
        width={hasCustomWidth("gpu") ? customWidthFor("gpu") : undefined}
      />
    ].filter((col): col is React.ReactElement => col !== null);

    return (
      <div className="table-wrapper">
        <Table data={data}>{columns}</Table>
      </div>
    );
  }
}
