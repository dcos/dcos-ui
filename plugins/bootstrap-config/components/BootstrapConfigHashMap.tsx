import { Trans } from "@lingui/macro";
import * as React from "react";

import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Loader from "#SRC/js/components/Loader";

import { BOOTSTRAP_CONFIG_SUCCESS } from "../constants/EventTypes";
import BootstrapConfigStore from "../stores/BootstrapConfigStore";

const SDK = require("../SDK");

// Check permissions on poll and render in case the store was updated.
const userHasCapability = SDK.getSDK().Hooks.applyFilter.bind(
  SDK.getSDK().Hooks,
  "hasCapability",
  false,
  "metadataAPI"
);

class BootstrapConfigHashMap extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = { loaded: false };

    BootstrapConfigStore.addChangeListener(
      BOOTSTRAP_CONFIG_SUCCESS,
      this.handleBootstrapConfigSuccess
    );
  }

  componentDidMount() {
    if (userHasCapability()) {
      BootstrapConfigStore.fetchBootstrapConfig();
    }
  }

  componentWillUnmount() {
    BootstrapConfigStore.removeChangeListener(
      BOOTSTRAP_CONFIG_SUCCESS,
      this.handleBootstrapConfigSuccess
    );
  }
  handleBootstrapConfigSuccess = () => {
    this.setState({ loaded: true });
  };

  render() {
    if (!userHasCapability()) {
      return null;
    }

    let securityModeContent;
    if (!this.state.loaded) {
      securityModeContent = (
        <Loader
          className={{ "horizontal-center": false }}
          size="small"
          type="ballBeat"
        />
      );
    } else {
      securityModeContent = BootstrapConfigStore.getSecurityMode();
    }

    return (
      <ConfigurationMapSection>
        <Trans render={<ConfigurationMapHeading />}>Bootstrap Config</Trans>
        <ConfigurationMapRow>
          <Trans render={<ConfigurationMapLabel />}>Security Mode</Trans>
          <ConfigurationMapValue>{securityModeContent}</ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }
}

export default BootstrapConfigHashMap;
