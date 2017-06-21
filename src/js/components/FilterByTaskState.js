import { Dropdown } from "reactjs-components";
import React from "react";

const defaultID = "all";

class FilterByTaskState extends React.Component {
  constructor() {
    super();

    this.onItemSelection = this.onItemSelection.bind(this);
  }

  onItemSelection(obj) {
    this.props.handleFilterChange(obj.value);
  }

  getItemHtml(item) {
    return <span>{item.name}</span>;
  }

  getDropdownItems() {
    const items = [
      {
        id: defaultID,
        name: "All Tasks",
        value: "all",
        count: this.props.totalTasksCount
      }
    ].concat(this.props.statuses);

    return items.map(function(status) {
      const selectedHtml = this.getItemHtml(status);
      const dropdownHtml = <a>{selectedHtml}</a>;

      const item = {
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
    const { className, currentStatus, dropdownMenuClassName } = this.props;

    return (
      <Dropdown
        buttonClassName={className}
        dropdownMenuClassName={dropdownMenuClassName}
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        wrapperClassName="dropdown"
        items={this.getDropdownItems()}
        onItemSelection={this.onItemSelection}
        persistentID={currentStatus}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        transitionName="dropdown-menu"
      />
    );
  }
}

FilterByTaskState.propTypes = {
  currentStatus: React.PropTypes.string,
  handleFilterChange: React.PropTypes.func,
  statuses: React.PropTypes.array.isRequired,
  totalTasksCount: React.PropTypes.number.isRequired,

  className: React.PropTypes.string,
  dropdownMenuClassName: React.PropTypes.string
};

FilterByTaskState.defaultProps = {
  currentStatus: defaultID,
  handleFilterChange() {},
  statuses: [],
  totalHostsCount: 0,

  className: "button dropdown-toggle text-align-left",
  dropdownMenuClassName: "dropdown-menu"
};

module.exports = FilterByTaskState;
