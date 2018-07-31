import React from "react";

import AuthStore from "#SRC/js/stores/AuthStore";
import UserAccountDropdown from "#SRC/js/components/UserAccountDropdown";
import UserAccountDropdownTrigger from "#SRC/js/components/UserAccountDropdownTrigger";

class AuthenticatedUserAccountDropdown extends UserAccountDropdown {
  constructor() {
    super(...arguments);

    this.userLabel = AuthStore.getUserLabel();
  }

  getTrigger() {
    return <UserAccountDropdownTrigger content={this.userLabel} />;
  }

  getMenuItems() {
    const menuItems = [
      {
        className: "dropdown-menu-section-header",
        html: <label className="text-overflow">{this.userLabel}</label>,
        id: "header-user-label",
        selectable: false
      },
      {
        html: "Sign Out",
        id: "sign-out",
        onClick: AuthStore.logout
      }
    ];

    return menuItems;
  }
}

module.exports = AuthenticatedUserAccountDropdown;
