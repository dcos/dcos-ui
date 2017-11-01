import { FormattedMessage } from "react-intl";
import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import DCOSStore from "#SRC/js/stores/DCOSStore";
import Icon from "#SRC/js/components/Icon";

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

    return (
      <button
        className="button button-link button-primary button--deployments"
        onClick={this.handleDeploymentsButtonClick}
      >
        <Icon color="grey" id="spinner" size="mini" />
        <div className="button--deployments__copy">
          <FormattedMessage
            id="SERVICES.DEPLOYMENT_COUNT"
            values={{ deploymentsCount }}
          />
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

module.exports = DeploymentStatusIndicator;
