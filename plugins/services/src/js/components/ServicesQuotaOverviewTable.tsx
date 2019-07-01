import React from "react";
import { Trans } from "@lingui/macro";
import { Column, Table, SortableHeaderCell } from "@dcos/ui-kit";
import sort from "array-sort";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

import { ServiceGroup, QuotaResources } from "../types/ServiceGroup";

import { nameRenderer } from "../columns/QuotaOverviewNameColumn";
import { cpuRenderer } from "../columns/QuotaOverviewCPUConsumedColumn";
import { memRenderer } from "../columns/QuotaOverviewMemoryConsumedColumn";
import { diskRenderer } from "../columns/QuotaOverviewDiskConsumedColumn";
import { gpuRenderer } from "../columns/QuotaOverviewGPUConsumedColumn";

import { SortDirection } from "../types/SortDirection";

export interface ServicesQuotaOverviewTableProps {
  groups: ServiceGroup[];
}

interface ServicesQuotaOverViewTableState {
  groups: ServiceGroup[];
  sortDirection: SortDirection;
  sortColumn: string;
}

function sortData(
  groups: ServiceGroup[],
  sortColumn: string,
  sortDirection: SortDirection,
  currentSortDirection?: SortDirection,
  currentSortColumn?: string
): ServicesQuotaOverViewTableState {
  const copiedGroups = groups.slice();
  if (sortColumn === currentSortColumn) {
    return {
      groups:
        sortDirection === currentSortDirection
          ? copiedGroups
          : copiedGroups.reverse(),
      sortColumn,
      sortDirection
    };
  }

  return {
    groups: sort(copiedGroups, sortForColumn(sortColumn), {
      reverse: sortDirection !== "ASC"
    }),
    sortColumn,
    sortDirection
  };
}

function sortForColumn(columnName: string): any {
  switch (columnName) {
    case "name":
      return (a: ServiceGroup, b: ServiceGroup) => a.name.localeCompare(b.name);
    case "cpus":
      return (a: ServiceGroup, b: ServiceGroup) =>
        getQuotaPercentage(a, "cpus") - getQuotaPercentage(b, "cpus");
    case "mem":
      return (a: ServiceGroup, b: ServiceGroup) =>
        getQuotaPercentage(a, "memory") - getQuotaPercentage(b, "memory");
    case "disk":
      return (a: ServiceGroup, b: ServiceGroup) =>
        getQuotaPercentage(a, "disk") - getQuotaPercentage(b, "disk");
    case "gpus":
      return (a: ServiceGroup, b: ServiceGroup) =>
        getQuotaPercentage(a, "gpus") - getQuotaPercentage(b, "gpus");
    default:
      return () => 0;
  }
}

function getQuotaPercentage(group: ServiceGroup, resource: string) {
  const resourceQuota: QuotaResources | undefined = findNestedPropertyInObject(
    group.quota,
    resource
  );
  if (!resourceQuota || !resourceQuota.consumed || !resourceQuota.limit) {
    return 0;
  }
  return (resourceQuota.consumed / resourceQuota.limit) * 100;
}

class ServicesQuotaOverviewTable extends React.Component<
  ServicesQuotaOverviewTableProps,
  ServicesQuotaOverViewTableState
> {
  constructor(props: Readonly<ServicesQuotaOverviewTableProps>) {
    super(props);

    this.state = {
      groups: [],
      sortColumn: "name",
      sortDirection: "ASC"
    };

    this.handleSortClick = this.handleSortClick.bind(this);
  }

  componentWillReceiveProps(nextProps: ServicesQuotaOverviewTableProps) {
    this.setState(
      sortData(
        nextProps.groups ? nextProps.groups : [],
        this.state.sortColumn,
        this.state.sortDirection
      )
    );
  }

  handleSortClick(columnName: string): void {
    const toggledDirection =
      this.state.sortDirection === "ASC" || this.state.sortColumn !== columnName
        ? "DESC"
        : "ASC";

    this.setState(
      sortData(
        this.state.groups,
        columnName,
        toggledDirection,
        this.state.sortDirection,
        this.state.sortColumn
      )
    );
  }

  render() {
    const { groups, sortColumn, sortDirection } = this.state;

    return (
      <div className="table-wrapper service-table">
        <Table data={groups}>
          <Column
            key="name"
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Name</Trans>}
                sortHandler={this.handleSortClick.bind(null, "name")}
                sortDirection={sortColumn === "name" ? sortDirection : null}
              />
            }
            cellRenderer={nameRenderer}
          />
          <Column
            key="cpus"
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">CPU Consumed</Trans>}
                sortHandler={this.handleSortClick.bind(null, "cpus")}
                sortDirection={sortColumn === "cpus" ? sortDirection : null}
              />
            }
            cellRenderer={cpuRenderer}
          />
          <Column
            key="mem"
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Memory Consumed</Trans>}
                sortHandler={this.handleSortClick.bind(null, "mem")}
                sortDirection={sortColumn === "mem" ? sortDirection : null}
              />
            }
            cellRenderer={memRenderer}
          />
          <Column
            key="disk"
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Disk Consumed</Trans>}
                sortHandler={this.handleSortClick.bind(null, "disk")}
                sortDirection={sortColumn === "disk" ? sortDirection : null}
              />
            }
            cellRenderer={diskRenderer}
          />
          <Column
            key="gpus"
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">GPU Consumed</Trans>}
                sortHandler={this.handleSortClick.bind(null, "gpus")}
                sortDirection={sortColumn === "gpus" ? sortDirection : null}
              />
            }
            cellRenderer={gpuRenderer}
          />
        </Table>
      </div>
    );
  }
}

export default ServicesQuotaOverviewTable;
