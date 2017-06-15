import classNames from "classnames";
import React from "react";
import { Table } from "reactjs-components";

import Util from "../utils/Util";

const WHITESPACE = "\u00A0";

class ExpandingTable extends React.Component {
  constructor() {
    super(...arguments);

    this.state = { expandedRows: {} };
  }

  defaultRenderer(prop, row) {
    return row[prop];
  }

  expandRow(row) {
    const expandedRows = Object.assign({}, this.state.expandedRows);
    const rowID = this.getRowID(row);

    // If the selected row is already expanded, then we want to collapse it.
    if (expandedRows[rowID]) {
      delete expandedRows[rowID];
    } else {
      expandedRows[rowID] = true;
    }

    this.setState({ expandedRows });
  }

  getColumns(columns) {
    // Replace the #render method on each column.
    return columns.map(column => {
      return Object.assign({}, column, { render: this.getRenderer(column) });
    });
  }

  getRenderer(column) {
    // Get the column's #render method if it exists. Otherwise use our default.
    const renderFn = column.render || this.defaultRenderer;
    const { expandAll } = this.props;

    return (prop, row) => {
      const hasChildren = !!row.children;
      const isExpanded =
        !!this.state.expandedRows[this.getRowID(row)] || expandAll;

      // Render the column's top-level item.
      let cellContent = [
        <div key={-1}>
          {renderFn(prop, row, {
            hasChildren,
            isExpanded,
            isParent: true,
            clickHandler: this.expandRow.bind(this, row)
          })}
        </div>
      ];

      // If there are children, and the expanded row ID matches this row, then
      // render all children. We need to render a whitespace character if the
      // property is undefined to retain proper spacing.
      if (hasChildren && isExpanded) {
        cellContent = cellContent.concat(
          row.children.map((child, childIndex) => {
            let cellValue = renderFn(prop, child, { isParent: false });

            if (cellValue == null) {
              cellValue = WHITESPACE;
            }

            return (
              <div className={this.props.childRowClassName} key={childIndex}>
                {cellValue}
              </div>
            );
          })
        );
      }

      return cellContent;
    };
  }

  getRowID(row) {
    return row.id;
  }

  render() {
    const { props } = this;
    const classes = classNames(props.className, {
      [`table-align-${props.alignCells}`]: props.alignCells != null
    });
    const TableComponent = props.tableComponent;

    return (
      <TableComponent
        className={classes}
        {...Util.omit(props, ["alignCells", "className", "childRowClassName"])}
        columns={this.getColumns(props.columns)}
      />
    );
  }
}

ExpandingTable.defaultProps = {
  alignCells: "top",
  childRowClassName: "text-overflow",
  expandAll: false,
  tableComponent: Table
};

ExpandingTable.propTypes = {
  alignCells: React.PropTypes.oneOf(["top", "middle", "bottom"]),
  childRowClassName: React.PropTypes.string,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  expandAll: React.PropTypes.bool,
  tableComponent: React.PropTypes.func
};

module.exports = ExpandingTable;
