import React from "react";

import AuthStore from "#SRC/js/stores/AuthStore";
import UserAccountDropdown from "#SRC/js/components/UserAccountDropdown";

class AuthenticatedUserAccountDropdown extends UserAccountDropdown {
  /**
   * Adds the authenticated user's account information to the dropdown items.
   * @return {array} Dropdown menu items.
   * @override
   */
  getMenuItems() {
    const { menuItems, children } = this.props;
    const nextMenuItems = menuItems.slice();
    const userLabel = this.getUserLabel();

    nextMenuItems.unshift({
      className: "hidden",
      html: children,
      id: "dropdown-trigger",
      selectable: false
    });

    nextMenuItems.push(
      {
        className: "dropdown-menu-section-header",
        html: <label className="text-overflow">{userLabel}</label>,
        id: "header-user-label",
        selectable: false
      },
      {
        html: "Sign Out",
        id: "sign-out",
        onClick: AuthStore.logout
      }
    );

    return nextMenuItems;
  }
}

module.exports = AuthenticatedUserAccountDropdown;
