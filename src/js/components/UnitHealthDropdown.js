import { Dropdown } from "reactjs-components";
import PureRender from "react-addons-pure-render-mixin";
import React from "react";

import UnitHealthStatus from "../constants/UnitHealthStatus";

const DEFAULT_ITEM = {
  id: "all",
  html: "All Health Checks",
  selectedHtml: "All Health Checks"
};

class UnitHealthDropdown extends React.Component {
  constructor() {
    super(...arguments);
    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
    this.state = { dropdownItems: this.getDropdownItems() };
  }

  getDropdownItems() {
    const keys = Object.keys(UnitHealthStatus).filter(function(key) {
      return key !== "NA" && key !== "WARN";
    });

    const items = keys.map(function(key) {
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
    const {
      className,
      dropdownMenuClassName,
      initialID,
      onHealthSelection
    } = this.props;
    const { dropdownItems } = this.state;

    return (
      <Dropdown
        buttonClassName={className}
        dropdownMenuClassName={dropdownMenuClassName}
        dropdownMenuListClassName="dropdown-menu-list"
        initialID={initialID}
        items={dropdownItems}
        onItemSelection={onHealthSelection}
        ref={ref => (this.dropdown = ref)}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        wrapperClassName="dropdown"
      />
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
  className: "button dropdown-toggle text-align-left",
  dropdownMenuClassName: "dropdown-menu"
};

module.exports = UnitHealthDropdown;
