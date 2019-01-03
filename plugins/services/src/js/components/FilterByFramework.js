import PropTypes from "prop-types";
import React from "react";
import { Dropdown } from "reactjs-components";
import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";

import { Badge } from "@dcos/ui-kit";
import Framework from "../structs/Framework";

const DEFAULT_ID = "default";
const METHODS_TO_BIND = ["handleItemSelection", "getDropdownItems"];

class FilterByFramework extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleItemSelection(obj) {
    if (obj.id === DEFAULT_ID) {
      this.props.handleFilterChange(null);
    } else {
      this.props.handleFilterChange(obj.id);
    }
  }

  getItemHtml(framework, isSelected = false) {
    const appearance = isSelected ? "outline" : "default";

    return (
      <span className="badge-container">
        <span className="badge-container-text">{framework.get("name")}</span>
        <Badge appearance={appearance}>{framework.getNodeIDs().length}</Badge>
      </span>
    );
  }

  getDropdownItems() {
    // TODO (mlunoe, orlandohohmeier): Refactor after introducing new unified
    // framework struct featuring frameworks and apps.
    const defaultItem = new Framework({
      id: DEFAULT_ID,
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

      if (frameworkId === DEFAULT_ID) {
        item.selectedHtml = <Trans render="span">Filter by Framework</Trans>;
      }

      return item;
    });
  }

  getSelectedId(id) {
    if (id == null) {
      return DEFAULT_ID;
    }

    return id;
  }

  setDropdownValue(id) {
    this.dropdown.setState({
      selectedID: id
    });
  }

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
}

FilterByFramework.displayName = "FilterByFramework";

FilterByFramework.propTypes = {
  byFrameworkFilter: PropTypes.string,
  frameworks: PropTypes.array.isRequired,
  totalHostsCount: PropTypes.number.isRequired,
  handleFilterChange: PropTypes.func
};

FilterByFramework.defaultProps = {
  byFrameworkFilter: DEFAULT_ID,
  frameworks: [],
  totalHostsCount: 0,
  handleFilterChange() {}
};

module.exports = FilterByService;
