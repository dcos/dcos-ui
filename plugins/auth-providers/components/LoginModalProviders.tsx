import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";

import StoreMixin from "#SRC/js/mixins/StoreMixin";
import AuthProvidersStore from "../stores/AuthProvidersStore";
import IconOpenID from "./icons/IconOpenID";
import IconSAML from "./icons/IconSAML";

import "../styles/auth-providers.less";

const SERVICE_ACCOUNT_DISPLAY_LIMIT = 3;

class LoginModalProviders extends mixin(StoreMixin) {
  static defaultProps = {
    onUpdate() {},
  };
  static propTypes = {
    onUpdate: PropTypes.func,
    target: PropTypes.string,
  };

  state = { showAllProviders: false };

  store_listeners = [{ name: "authProviders", events: ["change"] }];

  componentDidMount() {
    super.componentDidMount();
    AuthProvidersStore.fetch();
  }
  handleViewAllClick = () => {
    // The modal needs to re-calculate the height of the content. This is
    // triggered by the parent re-rendering.
    this.props.onUpdate();
    this.setState({ showAllProviders: !this.state.showAllProviders });
  };

  getAuthProviders(authProviders) {
    const { target, i18n } = this.props;

    if (!this.state.showAllProviders) {
      authProviders = authProviders.slice(0, SERVICE_ACCOUNT_DISPLAY_LIMIT);
    }

    return authProviders.map((authProvider, index) => {
      let icon = null;
      const providerText =
        i18n._(t`Login with`) + ` ${authProvider.getDescription()}`;

      if (authProvider.providerType === "oidc") {
        icon = <IconOpenID />;
      } else if (authProvider.providerType === "saml") {
        icon = <IconSAML />;
      }

      return (
        <a
          className="login-modal-auth-provider button"
          href={authProvider.getLoginRedirectURL(target)}
          key={index}
          title={providerText}
        >
          {icon}
          <span className="login-modal-auth-provider-label text-overflow">
            {providerText}
          </span>
        </a>
      );
    });
  }

  render() {
    const authProviders = AuthProvidersStore.getProviders().getItems();
    const authProviderCount = authProviders.length;
    let viewAllButton = null;

    if (authProviderCount === 0) {
      return null;
    }

    if (
      authProviderCount > SERVICE_ACCOUNT_DISPLAY_LIMIT &&
      !this.state.showAllProviders
    ) {
      viewAllButton = (
        <div className="pod-shorter flush-bottom">
          <Trans
            render={
              <span
                className="login-modal-auth-providers-view-all clickable"
                onClick={this.handleViewAllClick}
              />
            }
          >
            View All ({authProviderCount})
          </Trans>
        </div>
      );
    }

    return (
      <div className="login-modal-auth-providers">
        <div
          className="login-modal-auth-providers-list button-collection
          flush-bottom flex flex-direction-top-to-bottom"
        >
          {this.getAuthProviders(authProviders)}
        </div>
        {viewAllButton}
        <div
          className="login-modal-auth-providers-divider pod pod-short
          flush-horizontal"
        >
          <Trans
            render="span"
            className="login-modal-auth-providers-divider-content small"
          >
            or
          </Trans>
        </div>
      </div>
    );
  }
}

export default withI18n()(LoginModalProviders);
