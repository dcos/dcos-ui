import * as React from "react";
import { CheckboxTable, Column, SortableHeaderCell } from "@dcos/ui-kit";
import {
  secretPathRenderer,
  pathSorter,
} from "./columns/SecretsTablePathColumn";
import {
  actionsRenderer,
  actionsWidth,
} from "./columns/SecretsTableActionColumn";

import Secret from "../structs/Secret";

interface SecretsTableProps {
  data: Secret[];
  onChange?: (selectedRows: {}) => void;
  selected: {};
  onRemoveClick: () => void;
}

interface SecretsTableState {
  items: Secret[];
  sortColumn?: string;
  sortDirection: "ASC" | "DESC";
}

class ServicesTable extends React.PureComponent<
  SecretsTableProps,
  SecretsTableState
> {
  constructor(props: SecretsTableProps) {
    super(props);

    this.state = {
      items: [],
      sortDirection: "ASC",
    };

    this.handleSortClick = this.handleSortClick.bind(this);
  }

  public UNSAFE_componentWillReceiveProps(nextProps: SecretsTableProps) {
    this.setState(
      this.updateData(nextProps.data, false, this.state.sortDirection)
    );
  }

  public render() {
    const { items, sortDirection } = this.state;

    return (
      <CheckboxTable
        data={items.slice()}
        onChange={this.props.onChange}
        selectedRows={this.props.selected}
        uniqueKey="path"
      >
        <Column
          header={
            <SortableHeaderCell
              sortHandler={this.handleSortClick}
              sortDirection={sortDirection}
              columnContent="ID"
            />
          }
          cellRenderer={secretPathRenderer}
          growToFill={true}
        />
        <Column
          header=""
          cellRenderer={actionsRenderer.bind(
            this,
            this.props.onRemoveClick,
            ...arguments
          )}
          width={actionsWidth}
          maxWidth={24}
        />
      </CheckboxTable>
    );
  }

  private updateData(
    items: Secret[],
    isSorted: boolean,
    sortDirection: "ASC" | "DESC",
    currentSortDirection?: "ASC" | "DESC"
  ) {
    const copiedData = items.slice();

    if (sortDirection !== currentSortDirection && isSorted) {
      return { items: copiedData.reverse(), sortDirection };
    }

    return {
      items: pathSorter(copiedData, sortDirection),
      sortDirection,
    };
  }

  private handleSortClick() {
    const toggledDirection =
      this.state.sortDirection === "ASC" ? "DESC" : "ASC";

    this.setState(
      this.updateData(
        this.state.items,
        true,
        toggledDirection,
        this.state.sortDirection
      )
    );
  }
}

export default ServicesTable;
