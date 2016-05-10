import {Form, Table} from 'reactjs-components';
import React from 'react';

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

    METHODS_TO_BIND.forEach(function (method) {
      this[method] = this[method].bind(this);
    }, this);
  }

  handleCheckboxChange(prevCheckboxState, eventObject) {
    let {checkedItemsMap, onChecked} = this.props;
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

    onChecked(checkedIDs);
  }

  handleHeadingCheckboxChange(prevCheckboxState, eventObject) {
    let isChecked = eventObject.fieldValue;
    this.bulkCheck(isChecked);
  }

  bulkCheck(isChecked) {
    let checkedIDs = [];
    let {data, onChecked} = this.props;

    if (isChecked) {
      data.forEach(function (datum) {
        checkedIDs.push(datum.id);
      });
      onChecked(checkedIDs);
    }

    onChecked(checkedIDs);
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
            labelClass: 'form-row-element form-element-checkbox inverse',
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
    let checked = null;

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
          labelClass: 'form-row-element form-element-checkbox inverse',
          name: rowID,
          showLabel: false
        }]}
        onChange={this.handleCheckboxChange} />
    );
  }

  getTableRowOptions(row) {
    let selectedIDSet = this.internalStorage_get().selectedIDSet;
    if (selectedIDSet[row[this.props.itemID]]) {
      return {className: 'selected'};
    }
    return {};
  }

  getColumns() {
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
    let {className, data} = this.props;
    let columns = this.getColumns();
    let sortProp = columns[1].prop;

    return (
      <Table
        buildRowOptions={this.getTableRowOptions}
        className={className}
        columns={columns}
        colGroup={this.getColGroup()}
        containerSelector=".gm-scroll-view"
        data={data}
        itemHeight={TableUtil.getRowHeight()}
        sortBy={{prop: sortProp, order: 'asc'}} />
    );
  }
}

CheckboxTable.propTypes = {
  checkedItemsMap: PropTypes.object,
  className: PropTypes.string,
  columns: PropTypes.array,
  data: PropTypes.array,
  onChecked: PropTypes.func,
  uniqueProperty: PropTypes.string
};

CheckboxTable.defaultProps = {
  checkedItemsMap: {},
  className: 'table inverse table-borderless-outer table-borderless-inner-columns flush-bottom',
  columns: [],
  data: [],
  onChecked: function () {}
};

module.exports = CheckboxTable;
