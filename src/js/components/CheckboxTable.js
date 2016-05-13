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
    let {checkedItemsMap, onCheckboxChange} = this.props;
    let isChecked = eventObject.fieldValue;
    let rowID = eventObject.fieldName;
    let checkedIDs;

    if (isChecked) {
      checkedIDs = Object.keys(checkedItemsMap);
      checkedIDs.push(rowID);
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
    let {data, onCheckboxChange, uniqueProperty} = this.props;

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
    let {checkedItemsMap, data} = this.props;
    let checkedItemsCount = Object.keys(checkedItemsMap).length;

    if (checkedItemsCount > 0) {
      indeterminate = true;
    } else {
      checked = false;
    }

    if (checkedItemsCount === data.length && checkedItemsCount !== 0) {
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
    let {checkedItemsMap, uniqueProperty} = this.props;
    let rowID = row[uniqueProperty];
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
    let {checkedItemsMap, uniqueProperty} = this.props;
    if (checkedItemsMap[row[uniqueProperty]]) {
      return {className: 'selected'};
    }

    return {};
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
    let {className, data, getColGroup, sortProp} = this.props;
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
        sortBy={{prop: sortProp, order: 'asc'}} />
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
  getColGroup: PropTypes.func,
  labelClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  onCheckboxChange: PropTypes.func,
  sortProp: PropTypes.string,
  uniqueProperty: PropTypes.string
};

CheckboxTable.defaultProps = {
  checkedItemsMap: {},
  columns: [],
  data: [],
  getColGroup: function () {},
  labelClass: {},
  onCheckboxChange: function () {}
};

module.exports = CheckboxTable;
