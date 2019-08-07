import React from "react";
import { Trans } from "@lingui/macro";
import { Column, Table, SortableHeaderCell } from "@dcos/ui-kit";
import sort from "array-sort";

import Service from "../structs/Service";
import ServiceTree from "../structs/ServiceTree";

import { nameRenderer } from "../columns/ServicesTableNameColumn";
import { limitRenderer } from "../columns/QuotaOverviewLimitColumn";

import { SortDirection } from "../types/SortDirection";

export interface ServicesQuotaOverviewTableProps {
  serviceTree: ServiceTree;
}

interface ServicesQuotaOverviewTableState {
  items: Array<Service | ServiceTree>;
  sortDirection: SortDirection;
  sortColumn: string;
}

function sortForColumn(
  columnName: string
): (a: Service | ServiceTree, b: Service | ServiceTree) => number {
  switch (columnName) {
    case "name":
      return (a, b) => a.getName().localeCompare(b.getName());
    default:
      return () => 0;
  }
}

class ServicesQuotaOverviewTable extends React.Component<
  ServicesQuotaOverviewTableProps,
  ServicesQuotaOverviewTableState
> {
  constructor(props: Readonly<ServicesQuotaOverviewTableProps>) {
    super(props);

    this.state = {
      items: props.serviceTree.getItems(),
      sortColumn: "name",
      sortDirection: "ASC"
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: ServicesQuotaOverviewTableProps) {
    this.setState({
      items: this.sortData(nextProps.serviceTree.getItems() || [])
    });
  }

  handleSortClick = (columnName: string) => () => {
    const toggledDirection =
      this.state.sortDirection === "ASC" || this.state.sortColumn !== columnName
        ? "DESC"
        : "ASC";

    this.setState({
      items: this.sortData(this.state.items, columnName, toggledDirection),
      sortColumn: columnName,
      sortDirection: toggledDirection
    });
  };

  sortData = (
    items: Array<Service | ServiceTree>,
    sortColumn: string = this.state.sortColumn,
    sortDirection: SortDirection = this.state.sortDirection
  ): Array<Service | ServiceTree> =>
    sort(items.slice(), sortForColumn(sortColumn), {
      reverse: sortDirection !== "ASC"
    });

  render() {
    const { items, sortColumn, sortDirection } = this.state;

    if (items.length === 0) {
      return null;
    }

    return (
      <div className="table-wrapper service-quota-table">
        <Table data={items}>
          <Column
            key="name"
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Name</Trans>}
                sortHandler={this.handleSortClick("name")}
                sortDirection={sortColumn === "name" ? sortDirection : null}
              />
            }
            cellRenderer={nameRenderer.bind(null, false, true)}
          />
          <Column
            key="limit"
            header={
              <SortableHeaderCell
                columnContent={<Trans render="span">Quota Limit</Trans>}
                sortHandler={this.handleSortClick("limit")}
                sortDirection={sortColumn === "limit" ? sortDirection : null}
              />
            }
            cellRenderer={limitRenderer}
          />
        </Table>
      </div>
    );
  }
}

export default ServicesQuotaOverviewTable;
