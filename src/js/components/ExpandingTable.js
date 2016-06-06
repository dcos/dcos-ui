import React from 'react';
import {Table} from 'reactjs-components';

class ExpandingTable extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      expandedRows: []
    };
  }

  defaultRenderer(prop, row) {
    return row[prop];
  }

  expandRow(row) {
    let {expandedRows} = this.state;
    let rowID = this.getRowID(row);
    let selectedRowIndex = expandedRows.indexOf(rowID);

    // If the selected row is already expanded, then we want to collapse it.
    if (selectedRowIndex > -1) {
      expandedRows.splice(selectedRowIndex, 1);
    } else {
      expandedRows.push(rowID);
    }

    this.setState({expandedRows});
  }

  getColumns(columns) {
    // Replace the #render method on each column.
    return columns.map((column) => {
      return Object.assign({}, column, {render: this.getRenderer(column)});
    });
  }

  getRenderer(column) {
    // Get the column's #render method if it exists. Otherwise use our default.
    let renderFn = column.render || this.defaultRenderer;

    return (prop, row) => {
      let hasChildren = !!row.children;
      let isExpanded = this.state.expandedRows.indexOf(this.getRowID(row)) > -1;

      // Render the column's top-level item.
      let cellContent = [
        <div key={-1}>
          {renderFn(prop, row, {hasChildren, isExpanded, isParent: true})}
        </div>
      ];

      // If there are children, and the expanded row ID matches this row, then
      // render all children. We need to render a whitespace character if the
      // property is undefined to retain proper spacing.
      if (hasChildren && isExpanded) {
        const whitespace = '\u00A0';

        cellContent = cellContent.concat(
          row.children.map((child, childIndex) => {
            return (
              <div className={this.props.childRowClassName} key={childIndex}>
                {renderFn(prop, child, {isParent: false}) || whitespace}
              </div>
            );
          }
        ));
      }

      return cellContent;
    };
  }

  getRowID(row) {
    return row.id;
  }

  render() {
    let {props} = this;

    return <Table {...props} columns={this.getColumns(props.columns)} />;
  }
}

ExpandingTable.defaultProps = {
  childRowClassName: 'text-overflow'
};

ExpandingTable.propTypes = {
  childRowClassName: React.PropTypes.string
};

module.exports = ExpandingTable;
