import React from "react";
import { Trans } from "@lingui/macro";
import { Column, Table, SortableHeaderCell } from "@dcos/ui-kit";
import sort from "array-sort";

import Loader from "#SRC/js/components/Loader";

import { ServiceGroup } from "../types/ServiceGroup";
import { nameRenderer } from "../columns/QuotaOverviewNameColumn";
import { cpuRenderer } from "../columns/QuotaOverviewCPUConsumedColumn";
import { memRenderer } from "../columns/QuotaOverviewMemoryConsumedColumn";
import { diskRenderer } from "../columns/QuotaOverviewDiskConsumedColumn";
import { gpuRenderer } from "../columns/QuotaOverviewGPUConsumedColumn";

import { SortDirection } from "../types/SortDirection";

import Loader from "#SRC/js/components/Loader";

export interface ServicesQuotaOverviewTableProps {
  groups: ServiceGroup[];
}

interface ServicesQuotaOverViewTableState {
  groups: ServiceGroup[];
  sortDirection: SortDirection;
  sortColumn: string;
}

const compatatorFor = (prop: string) => (a: ServiceGroup, b: ServiceGroup) =>
  ServiceGroup.getQuotaPercentage(a, prop) -
  ServiceGroup.getQuotaPercentage(b, prop);

function sortForColumn(
  columnName: string
): (a: ServiceGroup, b: ServiceGroup) => number {
  switch (columnName) {
    case "name":
      return (a, b) => a.name.localeCompare(b.name);
    case "cpus":
      return compatatorFor("cpus");
    case "mem":
      return compatatorFor("memory");
    case "disk":
      return compatatorFor("disk");
    case "gpus":
      return compatatorFor("gpus");
    default:
      return () => 0;
  }
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

    if (!groups.length) {
      return <Loader />;
    }

    return (
      <div className="table-wrapper quota-table">
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
