import PropTypes from "prop-types";
import React from "react";
import createReactClass from "create-react-class";
import { Dropdown } from "reactjs-components";
import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";

import { Badge } from "@dcos/ui-kit";
import Framework from "../structs/Framework";

const defaultId = "default";

const FilterByService = createReactClass({
  displayName: "FilterByService",

  propTypes: {
    byFrameworkFilter: PropTypes.string,
    frameworks: PropTypes.array.isRequired,
    totalHostsCount: PropTypes.number.isRequired,
    handleFilterChange: PropTypes.func
  },

  getDefaultProps() {
    return {
      byFrameworkFilter: defaultId,
      frameworks: [],
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

  getItemHtml(framework, isSelected = false) {
    const appearance = isSelected ? "outline" : "default";

    return (
      <span className="badge-container">
        <span className="badge-container-text">{framework.get("name")}</span>
        <Badge appearance={appearance}>{framework.getNodeIDs().length}</Badge>
      </span>
    );
  },

  getDropdownItems() {
    // TODO (mlunoe, orlandohohmeier): Refactor after introducing new unified
    // framework struct featuring frameworks and apps.
    const defaultItem = new Framework({
      id: defaultId,
      name: i18nMark("All Frameworks"),
      // This is literally the worst way of doing this.
      slave_ids: new Array(this.props.totalHostsCount)
    });
    const items = [defaultItem].concat(this.props.frameworks);

    return items.map(framework => {
      const frameworkId = framework.get("id");
      const selectedHtml = this.getItemHtml(framework);
      const dropdownHtml = <a>{selectedHtml}</a>;

      var item = {
        id: framework.get("id"),
        name: framework.get("name"),
        html: dropdownHtml,
        selectedHtml
      };

      if (frameworkId === this.props.byFrameworkFilter) {
        item.selectedHtml = this.getItemHtml(framework, true);
      }

      if (frameworkId === defaultId) {
        item.selectedHtml = <Trans render="span">Filter by Framework</Trans>;
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
        initialID={this.getSelectedId(this.props.byFrameworkFilter)}
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
