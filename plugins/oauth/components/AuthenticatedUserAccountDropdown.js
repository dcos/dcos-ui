import React from "react";

const SDK = require("../SDK").getSDK();

const { AuthStore, UserAccountDropdown, UserAccountDropdownTrigger } = SDK.get([
  "AuthStore",
  "UserAccountDropdown",
  "UserAccountDropdownTrigger"
]);

class AuthenticatedUserAccountDropdown extends UserAccountDropdown {
  getUserLabel() {
    const user = AuthStore.getUser();

    let userLabel = null;

    if (user && !user.is_remote) {
      userLabel = user.description;
    } else if (user && user.is_remote) {
      userLabel = user.uid;
    }

    return userLabel;
  }

  /**
   * Adds the authenticated user's account information to the dropdown items.
   * @return {array} Dropdown menu items.
   * @override
   */
  getMenuItems() {
    const { clusterName, menuItems } = this.props;
    const nextMenuItems = menuItems.slice();
    const userLabel = this.getUserLabel();

    nextMenuItems.unshift({
      className: "hidden",
      html: (
        <UserAccountDropdownTrigger
          primaryContent={clusterName}
          secondaryContent={userLabel}
        />
      ),
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
