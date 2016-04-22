import classNames from 'classnames';
import {Dropdown} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';

import InternalStorageMixin from '../mixins/InternalStorageMixin';
import UnitHealthStatus from '../constants/UnitHealthStatus';

const DEFAULT_ITEM = {
  id: 'all',
  html: 'All Health Checks',
  selectedHtml: 'All Health Checks'
};

class UnitHealthDropdown extends mixin(InternalStorageMixin) {
  componentWillMount() {
    this.internalStorage_set({dropdownItems: this.getDropdownItems()});
  }

  getDropdownItems() {
    let keys = Object.keys(UnitHealthStatus).filter(function (key) {
      return (key !== 'NA' && key !== 'WARN');
    });

    let items = keys.map(function (key) {
      return {
        id: key,
        html: UnitHealthStatus[key].title,
        selectedHtml: UnitHealthStatus[key].title
      };
    });

    items.unshift(DEFAULT_ITEM);
    return items;
  }

  render() {
    let {inverseStyle} = this.props;

    let dropdownMenuClassSet = classNames({
      'dropdown-menu': true,
      'inverse': inverseStyle
    });

    let buttonClassSet = classNames({
      'button dropdown-toggle text-align-left': true,
      'button-inverse': inverseStyle
    });

    return (
      <Dropdown
        buttonClassName={buttonClassSet}
        dropdownMenuClassName={dropdownMenuClassSet}
        dropdownMenuListClassName="dropdown-menu-list"
        initialID={this.props.initialID}
        items={this.internalStorage_get().dropdownItems}
        onItemSelection={this.props.onHealthSelection}
        transition={true}
        wrapperClassName="dropdown" />
    );
  }
}

UnitHealthDropdown.propTypes = {
  initialID: React.PropTypes.string,
  inverseStyle: React.PropTypes.bool,
  onHealthSelection: React.PropTypes.func
};

UnitHealthDropdown.defaultProps = {
  inverseStyle: false
};

module.exports = UnitHealthDropdown;
