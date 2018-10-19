import PropTypes from "prop-types";
import React from "react";
import { Dropdown } from "reactjs-components";
import { Trans } from "@lingui/macro";

import { Badge } from "@dcos/ui-kit";
import Framework from "../structs/Framework";

var defaultId = "default";

var FilterByService = React.createClass({
  displayName: "FilterByService",

  propTypes: {
    byServiceFilter: PropTypes.string,
    services: PropTypes.array.isRequired,
    totalHostsCount: PropTypes.number.isRequired,
    handleFilterChange: PropTypes.func
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

  getItemHtml(service, isSelected = false) {
    const appearance = isSelected ? "outline" : "default";

    return (
      <span className="badge-container">
        <span className="badge-container-text">{service.get("name")}</span>
        <Badge appearance={appearance}>{service.getNodeIDs().length}</Badge>
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
      const serviceId = service.get("id");
      const selectedHtml = this.getItemHtml(service);
      const dropdownHtml = <a>{selectedHtml}</a>;

      var item = {
        id: service.get("id"),
        name: service.get("name"),
        html: dropdownHtml,
        selectedHtml
      };

      if (serviceId === this.props.byServiceFilter) {
        item.selectedHtml = this.getItemHtml(service, true);
      }

      if (serviceId === defaultId) {
        item.selectedHtml = <Trans render="span">Filter by Service</Trans>;
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
