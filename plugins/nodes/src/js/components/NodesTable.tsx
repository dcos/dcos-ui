import * as React from "react";
import {
  Table,
  Column,
  SortableHeaderCell,
  HeaderCell
} from "@dcos/ui-kit/dist/packages";
import { Trans } from "@lingui/macro";

import NodesList from "#SRC/js/structs/NodesList";
import Node from "#SRC/js/structs/Node";
import Loader from "#SRC/js/components/Loader";

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

  handleSortClick(columnName: string): void {
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

    if (data === null) {
      return <Loader />;
    }

    return (
      <div className="table-wrapper">
        <Table data={data.slice()}>
          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Host</Trans>}
                sortHandler={this.handleSortClick.bind(null, "host")}
                sortDirection={sortColumn === "host" ? sortDirection : null}
              />
            }
            cellRenderer={ipRenderer}
            minWidth={120}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Health</Trans>}
                sortHandler={this.handleSortClick.bind(null, "health")}
                sortDirection={sortColumn === "health" ? sortDirection : null}
              />
            }
            cellRenderer={healthRenderer}
            minWidth={80}
            maxWidth={100}
          />

          <Column
            header={
              <HeaderCell>
                <Trans>Public IP</Trans>
              </HeaderCell>
            }
            cellRenderer={PublicIPColumn}
            minWidth={125}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Type</Trans>}
                sortHandler={this.handleSortClick.bind(null, "type")}
                sortDirection={sortColumn === "type" ? sortDirection : null}
              />
            }
            cellRenderer={typeRenderer}
            maxWidth={70}
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
            minWidth={170}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Zone</Trans>}
                sortHandler={this.handleSortClick.bind(null, "zone")}
                sortDirection={sortColumn === "zone" ? sortDirection : null}
              />
            }
            cellRenderer={zoneRenderer}
            minWidth={100}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Tasks</Trans>}
                sortHandler={this.handleSortClick.bind(null, "tasks")}
                sortDirection={sortColumn === "tasks" ? sortDirection : null}
                textAlign="right"
              />
            }
            cellRenderer={tasksRenderer}
            minWidth={60}
            maxWidth={80}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">CPU</Trans>}
                sortHandler={this.handleSortClick.bind(null, "cpu")}
                sortDirection={sortColumn === "cpu" ? sortDirection : null}
              />
            }
            cellRenderer={cpuRenderer}
            growToFill={true}
            minWidth={110}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Mem</Trans>}
                sortHandler={this.handleSortClick.bind(null, "mem")}
                sortDirection={sortColumn === "mem" ? sortDirection : null}
              />
            }
            cellRenderer={memRenderer}
            growToFill={true}
            minWidth={110}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Disk</Trans>}
                sortHandler={this.handleSortClick.bind(null, "disk")}
                sortDirection={sortColumn === "disk" ? sortDirection : null}
              />
            }
            cellRenderer={diskRenderer}
            growToFill={true}
            minWidth={110}
          />

          <Column
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">GPU</Trans>}
                sortHandler={this.handleSortClick.bind(null, "gpu")}
                sortDirection={sortColumn === "gpu" ? sortDirection : null}
              />
            }
            cellRenderer={gpuRenderer}
            growToFill={true}
            minWidth={110}
          />
        </Table>
      </div>
    );
  }
}
