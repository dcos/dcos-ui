import * as React from "react";
import { sort, Comparator } from "@dcos/sorting";
import { Table, Column } from "@dcos/ui-kit";

import NodesList from "#SRC/js/structs/NodesList";
import Node from "#SRC/js/structs/Node";

import { SortableColumnHeader } from "ui-kit-stage/SortableColumnHeader";
import {
  SortDirection,
  directionAwareComparators
} from "../types/SortDirection";

import {
  comparators as hostnameComparators,
  hostnameRenderer,
  hostnameSizer
} from "../columns/NodesTableHostnameColumn";
import {
  comparators as regionComparators,
  regionRenderer,
  regionSizer
} from "../columns/NodesTableRegionColumn";
import {
  comparators as zoneComparators,
  zoneRenderer,
  zoneSizer
} from "../columns/NodesTableZoneColumn";
import {
  comparators as healthComparators,
  healthRenderer,
  healthSizer
} from "../columns/NodesTableHealthColumn";
import {
  comparators as tasksComparators,
  tasksRenderer,
  tasksSizer
} from "../columns/NodesTableTasksColumn";
import { cpubarRenderer, cpubarSizer } from "../columns/NodesTableCPUBarColumn";
import {
  comparators as cpuComparators,
  cpuRenderer,
  cpuSizer
} from "../columns/NodesTableCPUColumn";
import { membarRenderer, membarSizer } from "../columns/NodesTableMemBarColumn";
import {
  comparators as memComparators,
  memRenderer,
  memSizer
} from "../columns/NodesTableMemColumn";
import {
  diskbarRenderer,
  diskbarSizer
} from "../columns/NodesTableDiskBarColumn";
import {
  comparators as diskComparators,
  diskRenderer,
  diskSizer
} from "../columns/NodesTableDiskColumn";
import { gpubarSizer, gpubarRenderer } from "../columns/NodesTableGPUBarColumn";
import {
  comparators as gpuComparators,
  gpuRenderer,
  gpuSizer
} from "../columns/NodesTableGPUColumn";

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
      sortColumn: "hostname",
      sortDirection: "ASC"
    };

    this.handleSortClick = this.handleSortClick.bind(this);
    this.regionRenderer = (data: Node) =>
      regionRenderer(this.props.masterRegion, data);
  }

  retrieveComparators(sortColumn: string): Array<Comparator<Node>> {
    const equalComparator = () => 0;

    switch (sortColumn) {
      case "hostname":
        return hostnameComparators;
      case "region":
        return regionComparators;
      case "zone":
        return zoneComparators;
      case "health":
        return healthComparators;
      case "tasks":
        return tasksComparators;
      case "cpu":
        return cpuComparators;
      case "mem":
        return memComparators;
      case "disk":
        return diskComparators;
      case "gpu":
        return gpuComparators;
      default:
        return [equalComparator];
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
    const comparators = this.retrieveComparators(sortColumn);

    return {
      data: sort(
        directionAwareComparators(comparators, sortDirection),
        copiedData
      ),
      sortDirection,
      sortColumn
    };
  }

  handleSortClick(columnName: string): void {
    const toggledDirection =
      this.state.sortDirection === "ASC" ? "DESC" : "ASC";

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
      <Table data={data.slice()}>
        <Column
          header={
            <SortableColumnHeader
              columnContent="Name"
              sortHandler={this.handleSortClick.bind(null, "hostname")}
              sortDirection={sortColumn === "hostname" ? sortDirection : null}
            />
          }
          cellRenderer={hostnameRenderer}
          width={hostnameSizer}
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
              columnContent="Tasks"
              sortHandler={this.handleSortClick.bind(null, "tasks")}
              sortDirection={sortColumn === "tasks" ? sortDirection : null}
            />
          }
          cellRenderer={tasksRenderer}
          width={tasksSizer}
        />

        <Column
          header={<span title="CPUBar" />}
          cellRenderer={cpubarRenderer}
          width={cpubarSizer}
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
          header={<span title="MemBar" />}
          cellRenderer={membarRenderer}
          width={membarSizer}
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
          header={<span title="DiskBar" />}
          cellRenderer={diskbarRenderer}
          width={diskbarSizer}
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
          header={<span title="GPUBar" />}
          cellRenderer={gpubarRenderer}
          width={gpubarSizer}
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
      </Table>
    );
  }
}
