import classNames from 'classnames';
import {Form, Table} from 'reactjs-components';
import React from 'react';

import ResourceTableUtil from '../utils/ResourceTableUtil';
import TableUtil from '../utils/TableUtil';

const PropTypes = React.PropTypes;

const METHODS_TO_BIND = [
  'getTableRowOptions',
  'handleCheckboxChange',
  'handleHeadingCheckboxChange',
  'renderCheckbox',
  'renderHeadingCheckbox'
];

class CheckboxTable extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleCheckboxChange(prevCheckboxState, eventObject) {
    let {allowMultipleSelect, checkedItemsMap, onCheckboxChange} = this.props;
    let isChecked = eventObject.fieldValue;
    let rowID = eventObject.fieldName;
    let checkedIDs;

    if (isChecked) {
      checkedIDs = Object.keys(checkedItemsMap);
      if (!allowMultipleSelect) {
        checkedIDs = [rowID];
      } else {
        checkedIDs.push(rowID);
      }
    } else {
      delete checkedItemsMap[rowID];
      checkedIDs = Object.keys(checkedItemsMap);
    }

    onCheckboxChange(checkedIDs);
  }

  handleHeadingCheckboxChange(prevCheckboxState, eventObject) {
    let isChecked = eventObject.fieldValue;
    this.bulkCheck(isChecked);
  }

  bulkCheck(isChecked) {
    let checkedIDs = [];
    let {data, onCheckboxChange, uniqueProperty, disabledItemsMap} = this.props;

    data = data.filter(function (datum) {
      return !disabledItemsMap[datum[uniqueProperty]];
    });

    if (isChecked) {
      data.forEach(function (datum) {
        checkedIDs.push(datum[uniqueProperty]);
      });

      return onCheckboxChange(checkedIDs);
    }

    onCheckboxChange(checkedIDs);
  }

  getLabelClass() {
    return classNames(
      'form-row-element form-element-checkbox inverse',
      this.props.labelClass
    );
  }

  renderHeadingCheckbox() {
    let checked = false;
    let indeterminate = false;
    let {allowMultipleSelect, checkedItemsMap, disabledItemsMap, data} = this.props;

    if (!allowMultipleSelect) {
      return null;
    }

    let checkedItemsCount = Object.keys(checkedItemsMap).length;
    let disabledItemsCount = Object.keys(disabledItemsMap).length;

    if (checkedItemsCount > 0) {
      indeterminate = true;
    } else {
      checked = false;
    }

    if (checkedItemsCount + disabledItemsCount === data.length && checkedItemsCount !== 0) {
      checked = true;
      indeterminate = false;
    }

    return (
      <Form
        formGroupClass="form-group flush-bottom"
        definition={[
          {
            checked,
            value: checked,
            fieldType: 'checkbox',
            indeterminate,
            labelClass: this.getLabelClass(),
            name: 'headingCheckbox',
            showLabel: false
          }
        ]}
        onChange={this.handleHeadingCheckboxChange} />
    );
  }

  renderCheckbox(prop, row) {
    let {checkedItemsMap, disabledItemsMap, uniqueProperty} = this.props;
    let rowID = row[uniqueProperty];

    if (disabledItemsMap[rowID]) {
      return null;
    }

    let checked = false;

    if (checkedItemsMap[rowID]) {
      checked = true;
    }

    return (
      <Form
        formGroupClass="form-group flush-bottom"
        definition={[{
          checked,
          value: checked,
          fieldType: 'checkbox',
          labelClass: this.getLabelClass(),
          name: rowID,
          showLabel: false
        }]}
        onChange={this.handleCheckboxChange} />
    );
  }

  getTableRowOptions(row) {
    const {checkedItemsMap, uniqueProperty} = this.props;

    const rowAttributes = {};
    // Override the key from index to our task ID to help React know, which
    // row was rendered where and make its optimizations
    if (row[uniqueProperty]) {
      rowAttributes.key = row[uniqueProperty];
    }

    if (checkedItemsMap[row[uniqueProperty]]) {
      return Object.assign(rowAttributes, {className: 'selected'});
    }

    return rowAttributes;
  }

  getColumns() {
    let {getClassName} = ResourceTableUtil;

    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: 'selected',
        render: this.renderCheckbox,
        sortable: false,
        heading: this.renderHeadingCheckbox
      }
    ].concat(this.props.columns);
  }

  render() {
    let {className, data, getColGroup, sortOrder, sortProp} = this.props;
    let columns = this.getColumns();

    let tableClassSet = classNames(
      'table inverse table-borderless-outer table-borderless-inner-columns',
      'flush-bottom',
      className
    );

    return (
      <Table
        buildRowOptions={this.getTableRowOptions}
        className={tableClassSet}
        columns={columns}
        colGroup={getColGroup()}
        containerSelector=".gm-scroll-view"
        data={data}
        itemHeight={TableUtil.getRowHeight()}
        sortBy={{prop: sortProp, order: sortOrder}} />
    );
  }
}

CheckboxTable.propTypes = {
  checkedItemsMap: PropTypes.object,
  className: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  columns: PropTypes.array,
  data: PropTypes.array,
  disabledItemsMap: PropTypes.object,
  getColGroup: PropTypes.func,
  labelClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  onCheckboxChange: PropTypes.func,
  sortProp: PropTypes.string,
  sortOrder: PropTypes.string,
  uniqueProperty: PropTypes.string
};

CheckboxTable.defaultProps = {
  allowMultipleSelect: true,
  checkedItemsMap: {},
  columns: [],
  data: [],
  disabledItemsMap: {},
  getColGroup() {},
  labelClass: {},
  onCheckboxChange() {},
  sortOrder: 'asc'
};

module.exports = CheckboxTable;
