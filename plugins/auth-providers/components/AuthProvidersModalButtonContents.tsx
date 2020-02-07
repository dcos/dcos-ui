import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import * as React from "react";

import ProviderTypes from "../constants/ProviderTypes";

class AuthProvidersModalButtonContents extends React.Component {
  static propTypes = {
    onClick: PropTypes.func
  };
  getButtons() {
    const { onClick } = this.props;

    return Object.keys(ProviderTypes).map(function(providerType) {
      const provider = ProviderTypes[providerType];

      return (
        <button
          className="button button-login"
          id={providerType}
          key={providerType}
          onClick={onClick.bind(this, providerType)}
        >
          <span className="icon icon-mini">
            <provider.icon />
          </span>
          <Trans
            render="span"
            className="button-text"
            id={provider.description}
          />
        </button>
      );
    });
  }

  render() {
    return (
      <div>
        <Trans render="p">
          Select an identity provider to easily allow access to users.
        </Trans>
        <div
          className="button-collection flush-bottom flex
          flex-direction-top-to-bottom"
        >
          {this.getButtons()}
        </div>
      </div>
    );
  }
}

export default AuthProvidersModalButtonContents;
