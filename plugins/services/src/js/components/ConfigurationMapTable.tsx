import { Trans } from "@lingui/react";
import PropTypes from "prop-types";
import * as React from "react";
import { Table } from "reactjs-components";
import { EmptyStates } from "#SRC/js/constants/EmptyStates";
import * as ValidatorUtil from "#SRC/js/utils/ValidatorUtil";
import ServiceConfigDisplayUtil from "../utils/ServiceConfigDisplayUtil";

/**
 * Optimized method to check if all row props are empty for a given column
 *
 * @param {Array} data - The array of rows top rocess
 * @param {String} prop - The property name of the column
 * @returns {Boolean} Returns `true` if all rows have empty value in this prop
 */
function isColumnEmpty(data, prop) {
  return data.every((row) => ValidatorUtil.isEmpty(row[prop]));
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

const ConfigurationMapTable = (props) => {
  let {
    columns = [],
    columnDefaults = {},
    data = [],
    onEditClick,
    tabViewID,
  } = props;

  columns = columns
    .map((column) => {
      column = {
        ...columnDefaults,
        ...column,
      };
      const {
        className = "",
        heading,
        hideIfEmpty = false,
        placeholder = <em>{EmptyStates.CONFIG_VALUE}</em>,
        prop,
        render = defaultRenderFunction,
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
    .filter((column) => column !== null);

  if (onEditClick) {
    columns.push({
      heading() {
        return null;
      },
      className: "configuration-map-action",
      prop: "edit",
      render() {
        return (
          <a
            className="button button-link flush table-display-on-row-hover"
            onClick={onEditClick.bind(null, { tabViewID })}
          >
            <Trans render="span" id="Edit" />
          </a>
        );
      },
    });
  }

  return (
    <Table
      className="table table-flush table-borderless-outer table-borderless-inner-columns vertical-align-top table-break-word table-fixed-layout flush-bottom"
      {...{
        ...props,
        columns,
      }}
    />
  );
};

ConfigurationMapTable.propTypes = {
  onEditClick: PropTypes.func,
  tabViewID: PropTypes.string,
};

export default ConfigurationMapTable;
