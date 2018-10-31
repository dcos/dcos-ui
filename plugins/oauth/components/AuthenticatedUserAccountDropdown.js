import React from "react";
import { Trans } from "@lingui/macro";

import AuthStore from "#SRC/js/stores/AuthStore";
import LanguageModalActions from "#SRC/js/events/LanguageModalActions";
import Languages from "#SRC/js/constants/Languages";
import UserAccountDropdown from "#SRC/js/components/UserAccountDropdown";
import UserAccountDropdownTrigger from "#SRC/js/components/UserAccountDropdownTrigger";
import UserLanguageStore from "#SRC/js/stores/UserLanguageStore";

export default class AuthenticatedUserAccountDropdown extends UserAccountDropdown {
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
        html: (
          <Trans render="span">
            {Languages[UserLanguageStore.get()]} (Change)
          </Trans>
        ),
        id: "language",
        onClick: LanguageModalActions.open
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
