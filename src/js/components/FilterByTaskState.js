import React from 'react';
import {Dropdown} from 'reactjs-components';

const defaultID = 'all';

class FilterByTaskState extends React.Component {

  constructor() {
    super();

    this.onItemSelection = this.onItemSelection.bind(this);
  }

  onItemSelection(obj) {
    this.props.handleFilterChange(obj.value);
  }

  getItemHtml(item) {
    return (
      <span className="inverse">
        <span>{item.name}</span>
      </span>
    );
  }

  getDropdownItems() {
    let items = [{
      id: defaultID,
      name: 'All Tasks',
      value: 'all',
      count: this.props.totalTasksCount
    }].concat(this.props.statuses);

    return items.map(function (status) {
      let selectedHtml = this.getItemHtml(status);
      let dropdownHtml = (<a>{selectedHtml}</a>);

      let item = {
        id: status.value,
        name: status.name,
        html: dropdownHtml,
        value: status.value,
        selectedHtml
      };

      if (status.id === defaultID) {
        item.selectedHtml = (
          <span>
            <span>All Tasks</span>
          </span>
        );
      }

      return item;
    }, this);
  }

  render() {
    return (
      <Dropdown
        buttonClassName="button dropdown-toggle text-align-left"
        dropdownMenuClassName="
          dropdown-menu
          dropdown-menu-space-bottom
          dropdown-menu-right-align"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        wrapperClassName="dropdown"
        items={this.getDropdownItems()}
        onItemSelection={this.onItemSelection}
        persistentID={this.props.currentStatus}
        transition={true}
        transitionName="dropdown-menu" />
    );
  }
}

FilterByTaskState.propTypes = {
  currentStatus: React.PropTypes.string,
  handleFilterChange: React.PropTypes.func,
  statuses: React.PropTypes.array.isRequired,
  totalTasksCount: React.PropTypes.number.isRequired
};

FilterByTaskState.defaultProps = {
  currentStatus: defaultID,
  handleFilterChange: function () {},
  statuses: [],
  totalHostsCount: 0
};

module.exports = FilterByTaskState;
