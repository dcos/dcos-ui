import { Dropdown } from "reactjs-components";
import React from "react";

class FilterByFormTab extends React.Component {
  constructor() {
    super();

    this.onItemSelection = this.onItemSelection.bind(this);
  }

  onItemSelection(obj) {
    this.props.handleFilterChange(obj.value);
  }

  getItemHtml(item) {
    return (
      <span className="badge-container">
        <h4 className="flush dropdown-header">
          <span>{item.title}</span>
        </h4>
      </span>
    );
  }

  getDropdownItems() {
    return this.props.tabs.map(function(tab) {
      const selectedHtml = this.getItemHtml(tab);
      const dropdownHtml = <a>{selectedHtml}</a>;

      return {
        id: tab.title,
        name: tab.title,
        html: dropdownHtml,
        value: tab.title,
        selectedHtml
      };
    }, this);
  }

  render() {
    return (
      <Dropdown
        buttonClassName="button button-link button-primary dropdown-toggle text-align-left"
        dropdownMenuClassName="
          dropdown-menu
          dropdown-menu-space-bottom
          dropdown-menu-right-align"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        wrapperClassName="dropdown"
        items={this.getDropdownItems()}
        onItemSelection={this.onItemSelection}
        persistentID={this.props.currentTab}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        transitionName="dropdown-menu"
      />
    );
  }
}

FilterByFormTab.propTypes = {
  currentTab: React.PropTypes.string,
  handleFilterChange: React.PropTypes.func,
  tabs: React.PropTypes.array.isRequired
};

FilterByFormTab.defaultProps = {
  currentTab: "",
  handleFilterChange() {},
  tabs: []
};

module.exports = FilterByFormTab;
