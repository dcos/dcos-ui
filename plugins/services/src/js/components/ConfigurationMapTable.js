import React from "react";
import { Table } from "reactjs-components";

import ConfigurationMapEditAction from "./ConfigurationMapEditAction";
import ServiceConfigDisplayUtil from "../utils/ServiceConfigDisplayUtil";
import ValidatorUtil from "../../../../../src/js/utils/ValidatorUtil.js";
/**
 * Optimized method to check if all row props are empty for a given column
 *
 * @param {Array} data - The array of rows top rocess
 * @param {String} prop - The property name of the column
 * @returns {Boolean} Returns `true` if all rows have empty value in this prop
 */
function isColumnEmpty(data, prop) {
  return data.every(row => {
    return ValidatorUtil.isEmpty(row[prop]);
  });
}

/**
 * Custom rendering function that takes care of replacing with default value
 * if the field is empty.
 *
 * This function is bound into an object with a `placeholder` and `render`
 * fields, holding the placeholder value and the reder function respectively.
 *
 * @this {Object}
 * @param {String} prop - The property of the cell
 * @param {Object} row - The current row
 * @returns {Node} Returns a rendered React node
 */
function columnRenderFunction(prop, row) {
  if (ValidatorUtil.isEmpty(row[prop])) {
    return this.placeholder;
  }

  return this.render(prop, row);
}

/**
 * Default render function if the user has not specified a custom renderer
 *
 * @param {String} prop - The property of the cell
 * @param {Object} row - The current row
 * @returns {Node} Returns a rendered React node
 */
function defaultRenderFunction(prop, row) {
  const value = row[prop];
  if (React.isValidElement(value)) {
    return value;
  }

  return <span>{value.toString()}</span>;
}

/**
 * This stateless table component provides some additional functionality
 * to the underlaying <Table /> component, trying to be as least intrusive
 * as possible.
 *
 * @example <caption>Example of ConfigurationMapTable</caption>
 * <ConfigurationMapTable
 *   className='table table-simple table-break-word flush-bottom'
 *   columnDefaults={{
 *      hideIfEmpty: true,
 *      className: 'configuration-map-table-value'
 *   }}
 *   columns={[
 *      {
 *        heading: 'Heading 1',
 *        prop: 'prop1',
 *      },
 *      {
 *        heading: 'Heading 2',
 *        prop: 'prop2',
 *      }
 *   ]}
 *   data={tableData} />
 *
 * @param {Object} props - The component properties
 * @returns {Node} Returns the rendered table component
 */
class ConfigurationMapTable extends React.Component {
  render() {
    let {
      columns = [],
      columnDefaults = {},
      data = [],
      onEditClick,
      tabViewID
    } = this.props;

    columns = columns
      .map(column => {
        column = Object.assign({}, columnDefaults, column);
        const {
          className = "",
          heading,
          hideIfEmpty = false,
          placeholder = <em>Not Configured</em>,
          prop,
          render = defaultRenderFunction
        } = column;

        // Always use functions in order to display the sorting assets
        if (typeof className !== "function") {
          column.className = ServiceConfigDisplayUtil.getColumnClassNameFn(
            className
          );
        }
        if (typeof heading !== "function") {
          column.heading = ServiceConfigDisplayUtil.getColumnHeadingFn(heading);
        }

        // Don't include columns that have an `hideIfEmpty` flag and are empty
        if (hideIfEmpty && isColumnEmpty(data, prop)) {
          return null;
        }

        // Compile render function
        column.render = columnRenderFunction.bind({ placeholder, render });

        return column;
      })
      .filter(column => {
        return column !== null;
      });

    if (onEditClick) {
      columns.push({
        heading() {
          return null;
        },
        className: "configuration-map-action",
        prop: "edit",
        render() {
          return (
            <ConfigurationMapEditAction
              onEditClick={onEditClick}
              tabViewID={tabViewID}
            />
          );
        }
      });
    }

    return (
      <Table
        className="table table-simple table-align-top table-break-word table-fixed-layout flush-bottom"
        {...Object.assign({}, this.props, { columns })}
      />
    );
  }
}

ConfigurationMapTable.propTypes = {
  onEditClick: React.PropTypes.func,
  tabViewID: React.PropTypes.string
};

module.exports = ConfigurationMapTable;
