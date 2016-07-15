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

  setDropdownValue(id) {
    this.dropdown.setState({
      selectedID: id
    });
  }

  render() {
    let {className, dropdownMenuClassName, initialID, onHealthSelection} = this.props;

    return (
      <Dropdown
        buttonClassName={className}
        dropdownMenuClassName={dropdownMenuClassName}
        dropdownMenuListClassName="dropdown-menu-list"
        initialID={initialID}
        items={this.internalStorage_get().dropdownItems}
        onItemSelection={onHealthSelection}
        ref={(ref) => this.dropdown = ref}
        transition={true}
        wrapperClassName="dropdown" />
    );
  }
}

UnitHealthDropdown.propTypes = {
  className: React.PropTypes.string,
  dropdownMenuClassName: React.PropTypes.string,
  initialID: React.PropTypes.string,
  onHealthSelection: React.PropTypes.func
};

UnitHealthDropdown.defaultProps = {
  className: 'button dropdown-toggle text-align-left',
  dropdownMenuClassName: 'dropdown-menu'
};

module.exports = UnitHealthDropdown;
