import { Trans } from "@lingui/macro";
import * as React from "react";
import { i18nMark } from "@lingui/react";
import AuthStore from "#SRC/js/stores/AuthStore";
import * as EventTypes from "#SRC/js/constants/EventTypes";
import LanguageModalStore from "#SRC/js/stores/LanguageModalStore";
import LanguageModalActions from "#SRC/js/events/LanguageModalActions";
import Languages from "#SRC/js/constants/Languages";
import UserAccountDropdown from "#SRC/js/components/UserAccountDropdown";
import UserAccountDropdownTrigger from "#SRC/js/components/UserAccountDropdownTrigger";
import UserLanguageStore from "#SRC/js/stores/UserLanguageStore";

class AuthenticatedUserAccountDropdown extends UserAccountDropdown {
  constructor(...args) {
    super(...args);

    this.userLabel = AuthStore.getUserLabel();
    this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
  }

  forceUpdateHandler() {
    this.forceUpdate();
  }

  componentDidMount() {
    LanguageModalStore.addChangeListener(
      EventTypes.LANGUAGE_MODAL_CLOSE,
      this.forceUpdateHandler
    );
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
        selectable: false,
      },
      {
        html: `${Languages[UserLanguageStore.get()]} (${i18nMark("Change")})`,
        id: "language",
        onClick: LanguageModalActions.open,
      },
      {
        html: <Trans render="span">Sign Out</Trans>,
        id: "sign-out",
        onClick: AuthStore.logout,
      },
    ];

    return menuItems;
  }
}

export default AuthenticatedUserAccountDropdown;
