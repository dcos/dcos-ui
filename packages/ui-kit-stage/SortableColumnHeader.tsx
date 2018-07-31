/**
 * Component: SortableColumnHeader
 * Added: 2018-07-08
 * JIRA: https://jira.mesosphere.com/browse/DCOS-39076
 */
import * as React from "react";
import { HeaderCell } from "@dcos/ui-kit";
import { SortableColumnHeaderCellIcon } from "ui-kit-stage/SortableColumnHeaderCellIcon";

type SortDirection = "ASC" | "DESC" | null;
interface Props {
  sortHandler: () => void;
  sortDirection: SortDirection;
  columnContent: string | React.ReactNode;
}
interface State {
  hovered: boolean;
}

export class SortableColumnHeader extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.hoverStart = this.hoverStart.bind(this);
    this.hoverEnd = this.hoverEnd.bind(this);
    this.state = {
      hovered: false
    };
  }

  hoverStart() {
    this.setState({ hovered: true });
  }

  hoverEnd() {
    this.setState({ hovered: false });
  }

  render() {
    const { sortHandler, sortDirection, columnContent } = this.props;

    const displaySortDirection =
      sortDirection === null && this.state.hovered ? "DESC" : sortDirection;

    return (
      <HeaderCell
        onMouseEnter={this.hoverStart}
        onMouseLeave={this.hoverEnd}
        onClick={sortHandler}
        style={{ cursor: "pointer" }}
      >
        {columnContent}
        <SortableColumnHeaderCellIcon sortDirection={displaySortDirection} />
      </HeaderCell>
    );
  }
}
