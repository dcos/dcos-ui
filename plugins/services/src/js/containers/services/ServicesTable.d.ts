import { Component } from "react";
import { SortDirection } from "#PLUGINS/services/src/js/types/SortDirection";

interface ServiceTableProps {
  isFiltered?: boolean;
  services?: [];
}

interface ServiceTableState {
  actionDisabledService: any;
  data: [];
  sortColumn: string;
  sortDirection: SortDirection;
}

export const columnWidthsStorageKey: string;

export default class ServicesTable extends Component<
  ServiceTableProps,
  ServiceTableState
> {}
