import React from "react";
import { Dropdown } from "reactjs-components";

import Framework from "../structs/Framework";

var defaultId = "default";

var FilterByService = React.createClass({
  displayName: "FilterByService",

  propTypes: {
    byServiceFilter: React.PropTypes.string,
    services: React.PropTypes.array.isRequired,
    totalHostsCount: React.PropTypes.number.isRequired,
    handleFilterChange: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      byServiceFilter: defaultId,
      services: [],
      totalHostsCount: 0,
      handleFilterChange() {}
    };
  },

  handleItemSelection(obj) {
    if (obj.id === defaultId) {
      this.props.handleFilterChange(null);
    } else {
      this.props.handleFilterChange(obj.id);
    }
  },

  getItemHtml(service) {
    return (
      <span className="badge-container">
        <span className="badge-container-text">{service.get("name")}</span>
        <span className="badge badge-rounded">
          {service.getNodeIDs().length}
        </span>
      </span>
    );
  },

  getDropdownItems() {
    // TODO (mlunoe, orlandohohmeier): Refactor after introducing new unified
    // service struct featuring frameworks and apps.
    const defaultItem = new Framework({
      id: defaultId,
      name: "All Services",
      // This is literally the worst way of doing this.
      slave_ids: new Array(this.props.totalHostsCount)
    });
    const items = [defaultItem].concat(this.props.services);

    return items.map(service => {
      var selectedHtml = this.getItemHtml(service);
      var dropdownHtml = <a>{selectedHtml}</a>;

      var item = {
        id: service.get("id"),
        name: service.get("name"),
        html: dropdownHtml,
        selectedHtml
      };

      if (service.get("id") === defaultId) {
        item.selectedHtml = <span>Filter by Service</span>;
      }

      return item;
    });
  },

  getSelectedId(id) {
    if (id == null) {
      return defaultId;
    }

    return id;
  },

  setDropdownValue(id) {
    this.dropdown.setState({
      selectedID: id
    });
  },

  render() {
    return (
      <Dropdown
        buttonClassName="button dropdown-toggle"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        wrapperClassName="dropdown"
        items={this.getDropdownItems()}
        initialID={this.getSelectedId(this.props.byServiceFilter)}
        onItemSelection={this.handleItemSelection}
        ref={ref => (this.dropdown = ref)}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        transitionName="dropdown-menu"
      />
    );
  }
});

module.exports = FilterByService;
