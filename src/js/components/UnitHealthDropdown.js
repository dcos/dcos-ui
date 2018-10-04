import { Trans } from "@lingui/macro";

import { Dropdown } from "reactjs-components";
import PureRender from "react-addons-pure-render-mixin";
import PropTypes from "prop-types";
import React from "react";

import UnitHealthStatus from "../constants/UnitHealthStatus";

const DEFAULT_ITEM = {
  id: "all",
  html: <Trans render="span">All Health Checks</Trans>,
  selectedHtml: <Trans render="span">All Health Checks</Trans>
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
        html: <Trans render="span" id={UnitHealthStatus[key].title} />,
        selectedHtml: <Trans render="span" id={UnitHealthStatus[key].title} />
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
  className: PropTypes.string,
  dropdownMenuClassName: PropTypes.string,
  initialID: PropTypes.string,
  onHealthSelection: PropTypes.func
};

UnitHealthDropdown.defaultProps = {
  className: "button dropdown-toggle text-align-left",
  dropdownMenuClassName: "dropdown-menu"
};

module.exports = UnitHealthDropdown;
