import * as React from "react";
import {
  Table_Deprecated,
  Column,
  SortableHeaderCell,
  HeaderCell,
} from "@dcos/ui-kit";
import { Trans } from "@lingui/macro";
import isEqual from "lodash/isEqual";
import sort from "array-sort";

import NodesList from "#SRC/js/structs/NodesList";
import Node from "#SRC/js/structs/Node";
import Loader from "#SRC/js/components/Loader";
import TableUtil from "#SRC/js/utils/TableUtil";
import TableColumnResizeStore from "#SRC/js/stores/TableColumnResizeStore";

import { SortDirection } from "../types/SortDirection";

import { ipRenderer, compareByIp } from "../columns/NodesTableIpColumn";
import { statusRenderer, getStatus } from "../columns/NodesTableStatusColumn";
import { typeRenderer, getType } from "../columns/NodesTableTypeColumn";
import { regionRenderer, getRegion } from "../columns/NodesTableRegionColumn";
import { zoneRenderer, getZone } from "../columns/NodesTableZoneColumn";
import { healthRenderer, healthRank } from "../columns/NodesTableHealthColumn";
import { tasksRenderer, getTasks } from "../columns/NodesTableTasksColumn";
import { getCpuUsage, cpuRenderer } from "../columns/NodesTableCPUColumn";
import { memRenderer, getMemUsage } from "../columns/NodesTableMemColumn";
import { diskRenderer, getDiskUsage } from "../columns/NodesTableDiskColumn";
import { gpuRenderer, getGpuUsage } from "../columns/NodesTableGPUColumn";
import { generateActionsRenderer } from "../columns/NodesTableActionsColumn";

import PublicIPColumn from "../columns/NodesTablePublicIPColumn";

interface NodesTableProps {
  withPublicIP: boolean;
  hosts: NodesList;
  masterRegion: string;
  onNodeAction: (node: Node, actionId: string) => void;
}

interface NodesTableState {
  data: Node[] | null;
  sortDirection: SortDirection;
  sortColumn: string;
}

export const columnWidthsStorageKey = "nodesTableColWidths";

const hasCustomWidth = (column: string) =>
  TableUtil.isColWidthCustom(columnWidthsStorageKey, column);

const customWidthFor = (column: string) => () =>
  TableColumnResizeStore.get(columnWidthsStorageKey)[column];

function compareByHostname(a: Node, b: Node): number {
  return a
    .getHostName()
    .toLowerCase()
    .localeCompare(b.getHostName().toLowerCase());
}

const sorter = (
  data: Node[],
  comparator: (a: Node, b: Node) => number,
  sortDirection: SortDirection
): Node[] => {
  return sort(data, [comparator, compareByHostname], {
    reverse: sortDirection !== "ASC",
  });
};
export default class NodesTable extends React.Component<NodesTableProps> {
  state: NodesTableState = {
    data: null,
    sortColumn: "health",
    sortDirection: "ASC",
  };

  regionRenderer = (data: Node) =>
    regionRenderer(this.props.masterRegion, data);

  public sorterFor(sortColumn: string): (a: Node, b: Node) => number {
    switch (sortColumn) {
      case "host":
        return compareByIp;
      case "type":
        return (a, b) => getType(a).localeCompare(getType(b));
      case "region":
        return (a, b) => getRegion(a).localeCompare(getRegion(b));
      case "zone":
        return (a, b) => getZone(a).localeCompare(getZone(b));
      case "health":
        return (a, b) => healthRank(a) - healthRank(b);
      case "tasks":
        return (a, b) => getTasks(a) - getTasks(b);
      case "cpu":
        return (a, b) => getCpuUsage(a) - getCpuUsage(b);
      case "mem":
        return (a, b) => getMemUsage(a) - getMemUsage(b);
      case "disk":
        return (a, b) => getDiskUsage(a) - getDiskUsage(b);
      case "gpu":
        return (a, b) => getGpuUsage(a) - getGpuUsage(b);
      case "status":
        return (a, b) => getStatus(a) - getStatus(b);
      default:
        return () => 0;
    }
  }

  public sortData(
    data: Node[],
    sortColumn: string = this.state.sortColumn,
    sortDirection: SortDirection = this.state.sortDirection
  ): Node[] {
    return sorter(data.slice(), this.sorterFor(sortColumn), sortDirection);
  }

  public handleSortClick = (columnName: string) => () => {
    const toggledDirection =
      this.state.sortDirection === "ASC" || this.state.sortColumn !== columnName
        ? "DESC"
        : "ASC";

    if (this.state.data !== null) {
      this.setState({
        data: this.sortData(this.state.data, columnName, toggledDirection),
        sortColumn: columnName,
        sortDirection: toggledDirection,
      });
    }
  };

  public handleResize = (columnName: string) => (resizedColWidth: number) => {
    const savedColWidths = TableColumnResizeStore.get(columnWidthsStorageKey);
    TableColumnResizeStore.set(columnWidthsStorageKey, {
      ...savedColWidths,
      [columnName]: resizedColWidth,
    });
  };

  public shouldComponentUpdate(
    nextProps: NodesTableProps,
    nextState: NodesTableState
  ) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  }

  public UNSAFE_componentWillReceiveProps(nextProps: NodesTableProps): void {
    this.setState({
      data: nextProps.hosts ? this.sortData(nextProps.hosts.getItems()) : null,
    });
  }

  public render() {
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
        key="status"
        header={
          <SortableHeaderCell
            columnContent={<Trans render="span">Status</Trans>}
            sortHandler={this.handleSortClick("status")}
            sortDirection={sortColumn === "status" ? sortDirection : null}
          />
        }
        cellRenderer={statusRenderer}
        minWidth={hasCustomWidth("status") ? undefined : 120}
        resizable={true}
        onResize={this.handleResize("status")}
        width={hasCustomWidth("status") ? customWidthFor("status") : undefined}
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
      />,
      <Column
        key="actions"
        header=""
        cellRenderer={generateActionsRenderer(this.props.onNodeAction)}
        growToFill={true}
        minWidth={24}
        maxWidth={36}
      />,
    ].filter((col): col is React.ReactElement => col !== null);

    return (
      <div className="table-wrapper">
        <Table_Deprecated data={data}>{columns}</Table_Deprecated>
      </div>
    );
  }
}
