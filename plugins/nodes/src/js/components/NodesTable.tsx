import * as React from "react";
import { Table, Column } from "@dcos/ui-kit/dist/packages";

import NodesList from "#SRC/js/structs/NodesList";
import Node from "#SRC/js/structs/Node";

import { SortableColumnHeader } from "ui-kit-stage/SortableColumnHeader";
import { SortDirection } from "../types/SortDirection";

import { ipSorter, ipRenderer, ipSizer } from "../columns/NodesTableIpColumn";
import {
  typeSorter,
  typeRenderer,
  typeSizer
} from "../columns/NodesTableTypeColumn";
import {
  regionSorter,
  regionRenderer,
  regionSizer
} from "../columns/NodesTableRegionColumn";
import {
  zoneSorter,
  zoneRenderer,
  zoneSizer
} from "../columns/NodesTableZoneColumn";
import {
  healthSorter,
  healthRenderer,
  healthSizer
} from "../columns/NodesTableHealthColumn";
import {
  tasksSorter,
  tasksRenderer,
  tasksSizer
} from "../columns/NodesTableTasksColumn";
import {
  cpuSorter,
  cpuRenderer,
  cpuSizer
} from "../columns/NodesTableCPUColumn";
import {
  memSorter,
  memRenderer,
  memSizer
} from "../columns/NodesTableMemColumn";
import {
  diskSorter,
  diskRenderer,
  diskSizer
} from "../columns/NodesTableDiskColumn";
import {
  gpuSorter,
  gpuRenderer,
  gpuSizer
} from "../columns/NodesTableGPUColumn";
import {
  spacingSizer,
  spacingRenderer
} from "../columns/NodesTableSpacingColumn";

interface NodesTableProps {
  hosts: NodesList;
  nodeHealthResponse: boolean;
  masterRegion: string;
}

interface NodesTableState {
  data: Node[];
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

  constructor() {
    super();

    this.state = {
      data: [],
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
    data: Node[],
    sortColumn: string,
    sortDirection: SortDirection,
    currentSortDirection?: SortDirection,
    currentSortColumn?: string
  ): NodesTableState {
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

  handleSortClick(columnName: string): void {
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

  componentWillReceiveProps(nextProps: NodesTableProps): void {
    this.setState(
      this.updateData(
        nextProps.hosts.getItems(),
        this.state.sortColumn,
        this.state.sortDirection
      )
    );
  }

  render() {
    const { data, sortColumn, sortDirection } = this.state;

    return (
      <div className="table-wrapper">
        <Table data={data.slice()}>
          <Column
            header={
              <SortableColumnHeader
                columnContent="Host"
                sortHandler={this.handleSortClick.bind(null, "host")}
                sortDirection={sortColumn === "host" ? sortDirection : null}
              />
            }
            cellRenderer={ipRenderer}
            width={ipSizer}
          />

          <Column
            header={
              <SortableColumnHeader
                columnContent="Health"
                sortHandler={this.handleSortClick.bind(null, "health")}
                sortDirection={sortColumn === "health" ? sortDirection : null}
              />
            }
            cellRenderer={healthRenderer}
            width={healthSizer}
          />

          <Column
            header={
              <SortableColumnHeader
                columnContent="Type"
                sortHandler={this.handleSortClick.bind(null, "type")}
                sortDirection={sortColumn === "type" ? sortDirection : null}
              />
            }
            cellRenderer={typeRenderer}
            width={typeSizer}
          />

          <Column
            header={
              <SortableColumnHeader
                columnContent="Region"
                sortHandler={this.handleSortClick.bind(null, "region")}
                sortDirection={sortColumn === "region" ? sortDirection : null}
              />
            }
            cellRenderer={this.regionRenderer}
            width={regionSizer}
          />

          <Column
            header={
              <SortableColumnHeader
                columnContent="Zone"
                sortHandler={this.handleSortClick.bind(null, "zone")}
                sortDirection={sortColumn === "zone" ? sortDirection : null}
              />
            }
            cellRenderer={zoneRenderer}
            width={zoneSizer}
          />

          <Column
            header={
              <SortableColumnHeader
                columnContent="Tasks"
                sortHandler={this.handleSortClick.bind(null, "tasks")}
                sortDirection={sortColumn === "tasks" ? sortDirection : null}
              />
            }
            cellRenderer={tasksRenderer}
            width={tasksSizer}
          />

          <Column
            header={
              <SortableColumnHeader
                columnContent="CPU"
                sortHandler={this.handleSortClick.bind(null, "cpu")}
                sortDirection={sortColumn === "cpu" ? sortDirection : null}
              />
            }
            cellRenderer={cpuRenderer}
            width={cpuSizer}
          />

          <Column
            header={
              <SortableColumnHeader
                columnContent="Mem"
                sortHandler={this.handleSortClick.bind(null, "mem")}
                sortDirection={sortColumn === "mem" ? sortDirection : null}
              />
            }
            cellRenderer={memRenderer}
            width={memSizer}
          />

          <Column
            header={
              <SortableColumnHeader
                columnContent="Disk"
                sortHandler={this.handleSortClick.bind(null, "disk")}
                sortDirection={sortColumn === "disk" ? sortDirection : null}
              />
            }
            cellRenderer={diskRenderer}
            width={diskSizer}
          />

          <Column
            header={
              <SortableColumnHeader
                columnContent="GPU"
                sortHandler={this.handleSortClick.bind(null, "gpu")}
                sortDirection={sortColumn === "gpu" ? sortDirection : null}
              />
            }
            cellRenderer={gpuRenderer}
            width={gpuSizer}
          />

          <Column
            header={<span title="Spacing" />}
            cellRenderer={spacingRenderer}
            width={spacingSizer}
          />
        </Table>
      </div>
    );
  }
}
