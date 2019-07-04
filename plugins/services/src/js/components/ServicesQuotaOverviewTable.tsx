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

function sortForColumn(
  columnName: string
): (a: ServiceGroup, b: ServiceGroup) => number {
  switch (columnName) {
    case "name":
      return (a, b) => a.name.localeCompare(b.name);
    case "cpus":
      return (a, b) =>
        getQuotaPercentage(a, "cpus") - getQuotaPercentage(b, "cpus");
    case "mem":
      return (a, b) =>
        getQuotaPercentage(a, "memory") - getQuotaPercentage(b, "memory");
    case "disk":
      return (a, b) =>
        getQuotaPercentage(a, "disk") - getQuotaPercentage(b, "disk");
    case "gpus":
      return (a, b) =>
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
  }

  componentWillReceiveProps(nextProps: ServicesQuotaOverviewTableProps) {
    this.setState({ groups: this.sortData(nextProps.groups || []) });
  }

  handleSortClick = (columnName: string) => () => {
    const toggledDirection =
      this.state.sortDirection === "ASC" || this.state.sortColumn !== columnName
        ? "DESC"
        : "ASC";

    this.setState({
      groups: this.sortData(this.state.groups, columnName, toggledDirection),
      sortColumn: columnName,
      sortDirection: toggledDirection
    });
  };

  sortData = (
    groups: ServiceGroup[],
    sortColumn: string = this.state.sortColumn,
    sortDirection: SortDirection = this.state.sortDirection
  ): ServiceGroup[] =>
    sort(groups.slice(), sortForColumn(sortColumn), {
      reverse: sortDirection !== "ASC"
    });

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
                sortHandler={this.handleSortClick("name")}
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
                sortHandler={this.handleSortClick("cpus")}
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
                sortHandler={this.handleSortClick("mem")}
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
                sortHandler={this.handleSortClick("disk")}
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
                sortHandler={this.handleSortClick("gpus")}
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
