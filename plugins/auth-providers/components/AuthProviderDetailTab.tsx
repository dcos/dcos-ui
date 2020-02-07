import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import * as React from "react";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Util from "#SRC/js/utils/Util";

class AuthProviderDetailTab extends React.Component {
  static propTypes = {
    provider: PropTypes.object
  };
  constructor(...args) {
    super(...args);

    this.state = {
      hideSecret: true
    };
  }
  handleSecretToggle = () => {
    const { hideSecret } = this.state;
    this.setState({ hideSecret: !hideSecret });
  };

  getSecretIcon() {
    const { hideSecret } = this.state;
    const iconID = hideSecret ? SystemIcons.Eye : SystemIcons.EyeSlash;

    return (
      <span
        className="secret-toggle clickable"
        onClick={this.handleSecretToggle}
      >
        <Icon color={greyDark} shape={iconID} size={iconSizeXs} />
      </span>
    );
  }

  getSecretValue() {
    const { hideSecret } = this.state;
    const { provider } = this.props;

    return hideSecret ? "••••••••" : provider.getClientSecret();
  }

  render() {
    const { provider } = this.props;
    const providerType = provider.getProviderType();
    const details = Util.omit(provider.getDetails(), [
      "Description",
      "Client Secret"
    ]);
    let samlRows = null;
    let secretRow = null;

    if (providerType === "saml") {
      samlRows = [
        <ConfigurationMapRow key="callback-url">
          <ConfigurationMapLabel>
            <Trans render="span">Callback URL</Trans>
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {provider.getCallbackURL()}
          </ConfigurationMapValue>
        </ConfigurationMapRow>,
        <ConfigurationMapRow key="sp-metadata">
          <ConfigurationMapLabel>
            <Trans render="span">SP Metadata</Trans>
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            <Trans
              render={<a href={provider.getSPMetadataURL()} target="_blank" />}
            >
              Download
            </Trans>
          </ConfigurationMapValue>
        </ConfigurationMapRow>,
        <ConfigurationMapRow key="entity-id">
          <ConfigurationMapLabel>
            <Trans render="span">EntityID</Trans>
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {provider.getEntityID()}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      ];
    }

    const detailRows = Object.keys(details).map(detailKey => {
      const value = details[detailKey];

      return (
        <ConfigurationMapRow key={detailKey}>
          <Trans render={<ConfigurationMapLabel />} id={detailKey} />
          <ConfigurationMapValue>{value}</ConfigurationMapValue>
        </ConfigurationMapRow>
      );
    });

    if (providerType === "oidc") {
      secretRow = (
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            <Trans render={<ConfigurationMapLabel />}>
              Client Secret {this.getSecretIcon()}
            </Trans>
          </ConfigurationMapLabel>
          <ConfigurationMapValue>{this.getSecretValue()}</ConfigurationMapValue>
        </ConfigurationMapRow>
      );
    }

    return (
      <div className="container">
        <ConfigurationMap>
          <ConfigurationMapSection>
            {samlRows}
            {detailRows}
            {secretRow}
          </ConfigurationMapSection>
        </ConfigurationMap>
      </div>
    );
  }
}

export default AuthProviderDetailTab;
