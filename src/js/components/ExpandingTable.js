import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { Table } from "reactjs-components";

import Util from "../utils/Util";

const WHITESPACE = "\u00A0";

class ExpandingTable extends React.Component {
  constructor(props) {
    super(props);

    let initialState = { expandedRows: {} };

    if (props.expandRowsByDefault) {
      initialState = props.data.reduce(
        function(memo, row) {
          memo.expandedRows[row.id] = true;

          return memo;
        },
        { expandedRows: {} }
      );
    }

    this.state = initialState;
  }

  componentWillReceiveProps(nextProps) {
    // Check for new rows and expand them if expandRowsByDefault is true.
    if (nextProps.expandRowsByDefault) {
      let shouldSetState = false;
      const nextExpandedRows = this.state.expandedRows;

      nextProps.data.forEach(function(row) {
        if (nextExpandedRows[row.id] == null) {
          shouldSetState = true;
          nextExpandedRows[row.id] = true;
        }
      });

      if (shouldSetState) {
        this.setState({ expandedRows: nextExpandedRows });
      }
    }
  }

  defaultRenderer(prop, row) {
    return row[prop];
  }

  expandRow(row) {
    const expandedRows = Object.assign({}, this.state.expandedRows);
    const rowID = this.getRowID(row);

    // If the selected row is already expanded, then we want to collapse it.
    if (expandedRows[rowID]) {
      expandedRows[rowID] = false;
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
    const classes = classNames("table-hover", props.className, {
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
  expandRowsByDefault: false,
  tableComponent: Table
};

ExpandingTable.propTypes = {
  alignCells: PropTypes.oneOf(["top", "middle", "bottom"]),
  childRowClassName: PropTypes.string,
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  expandAll: PropTypes.bool,
  expandRowsByDefault: PropTypes.bool,
  tableComponent: PropTypes.func
};

export default ExpandingTable;
