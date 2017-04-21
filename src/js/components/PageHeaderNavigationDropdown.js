import { Dropdown } from "reactjs-components";
import React from "react";

import Icon from "./Icon";

class PageHeaderNavigationDropdown extends React.Component {
  getActiveItemID() {
    const { items } = this.props;
    const activeTab = items.find(function(item) {
      return item.isActive;
    });

    if (activeTab) {
      return activeTab.id;
    }

    if (items.length > 0) {
      return items[0].id;
    }
  }

  getItems() {
    return this.props.items.map(function(item) {
      const { label } = item;

      return Object.assign({}, item, {
        html: label,
        selectedHtml: (
          <div className="page-header-navigation-dropdown-active-item">
            <span className="page-header-navigation-dropdown-label">
              {label}
            </span>
            <span className="page-header-navigation-dropdown-caret">
              <Icon
                id="caret-down"
                color="light-grey"
                family="tiny"
                size="tiny"
              />
            </span>
          </div>
        )
      });
    });
  }

  render() {
    const { handleNavigationItemSelection } = this.props;
    const dropdownItems = this.getItems();

    if (dropdownItems.length === 0) {
      return null;
    }

    return (
      <Dropdown
        buttonClassName="page-header-navigation-dropdown-button button button-transparent"
        dropdownMenuClassName="page-header-navigation-dropdown-menu dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        items={this.getItems()}
        onItemSelection={handleNavigationItemSelection}
        persistentID={this.getActiveItemID()}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        transitionName="dropdown-menu"
        wrapperClassName="page-header-navigation-dropdown dropdown"
      />
    );
  }
}

PageHeaderNavigationDropdown.defaultProps = {
  items: []
};

PageHeaderNavigationDropdown.propTypes = {
  items: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      id: React.PropTypes.oneOfType([
        React.PropTypes.number,
        React.PropTypes.string
      ]).isRequired,
      isActive: React.PropTypes.bool.isRequired,
      label: React.PropTypes.node.isRequired
    })
  )
};

module.exports = PageHeaderNavigationDropdown;
