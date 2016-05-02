import classNames from 'classnames';
import {Dropdown} from 'reactjs-components';
import React from 'react';

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
  inverseStyle: React.PropTypes.bool,
  statuses: React.PropTypes.array.isRequired,
  totalTasksCount: React.PropTypes.number.isRequired
};

FilterByTaskState.defaultProps = {
  currentStatus: defaultID,
  handleFilterChange: function () {},
  inverseStyle: false,
  statuses: [],
  totalHostsCount: 0
};

module.exports = FilterByTaskState;
