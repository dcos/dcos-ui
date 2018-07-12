/**
 * Component: SortableColumnHeader
 * Added: 2018-07-08
 * JIRA: https://jira.mesosphere.com/browse/DCOS-39076
 */
import * as React from "react";
import { HeaderCell } from "@dcos/ui-kit";
import { SortableColumnHeaderCellIcon } from "ui-kit-stage/SortableColumnHeaderCellIcon";

type SortDirection = "ASC" | "DESC" | null;

export function SortableColumnHeader({
  sortHandler,
  sortDirection,
  columnContent
}: {
  sortHandler: () => void;
  sortDirection: SortDirection;
  columnContent: string | React.ReactNode;
}) {
  return (
    <HeaderCell onClick={sortHandler}>
      {columnContent}
      <SortableColumnHeaderCellIcon sortDirection={sortDirection} />
    </HeaderCell>
  );
}
