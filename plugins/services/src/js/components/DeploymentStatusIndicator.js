import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import { StoreMixin } from "mesosphere-shared-reactjs";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  iconSizeXs,
  greyDark
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import DCOSStore from "#SRC/js/stores/DCOSStore";

import DeploymentsModal from "./DeploymentsModal";

const METHODS_TO_BIND = ["handleDeploymentsButtonClick", "handleModalClose"];

class DeploymentStatusIndicator extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: "dcos",
        events: ["change"],
        listenAlways: true
      }
    ];

    this.state = {
      isOpen: false
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps() {
    const deployments = DCOSStore.deploymentsList.getItems();

    if (this.state.isOpen && deployments.length === 0) {
      this.setState({ isOpen: false });
    }
  }

  handleDeploymentsButtonClick() {
    this.setState({ isOpen: true });
  }

  handleModalClose() {
    this.setState({ isOpen: false });
  }

  render() {
    const deployments = DCOSStore.deploymentsList.getItems();
    const deploymentsCount = deployments.length;
    const loading = !DCOSStore.serviceDataReceived;

    if (loading || deploymentsCount === 0) {
      return null;
    }

    // L10NTODO: Pluralize
    const deploymentText =
      deploymentsCount === 1 ? i18nMark("deployment") : i18nMark("deployments");

    return (
      <button
        className="button button-primary-link button--deployments"
        onClick={this.handleDeploymentsButtonClick}
      >
        <Icon color={greyDark} shape={SystemIcons.Spinner} size={iconSizeXs} />
        <div className="button--deployments__copy">
          {deploymentsCount} <Trans id={deploymentText} render="span" />
        </div>
        <DeploymentsModal
          isOpen={this.state.isOpen}
          onClose={this.handleModalClose}
        />
      </button>
    );
  }
}

DeploymentStatusIndicator.defaultProps = {};

DeploymentStatusIndicator.propTypes = {};

export default DeploymentStatusIndicator;
