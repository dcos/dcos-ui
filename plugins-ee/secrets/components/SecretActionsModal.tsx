import { Trans, t } from "@lingui/macro";
import classNames from "classnames";
import { Confirm } from "reactjs-components";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import UserActions from "#SRC/js/constants/UserActions";
import container from "#SRC/js/container";
import { TYPES } from "#SRC/js/types/containerTypes";

import PrivatePluginsConfig from "../../PrivatePluginsConfig";
import getSecretStore from "../stores/SecretStore";

const SecretStore = getSecretStore();

const i18n = container.get(TYPES.I18n);

class SecretActionsModal extends mixin(StoreMixin) {
  constructor(...args) {
    super(...args);

    this.store_listeners = [
      { name: "secrets", events: ["deleteSecretSuccess", "deleteSecretError"] }
    ];

    this.state = {
      pendingRequest: false,
      errorMsg: null
    };
  }
  handleButtonConfirm = () => {
    const { action, selectedItems } = this.props;
    if (action === UserActions.DELETE) {
      selectedItems.forEach(secret => {
        SecretStore.deleteSecret(
          PrivatePluginsConfig.secretsDefaultStore,
          secret.getPath()
        );
      });
    }
    this.setState({ pendingRequest: true });
  };

  onSecretsStoreDeleteSecretSuccess() {
    this.setState({ pendingRequest: false, errorMsg: null });
    this.handleClose();
    this.props.onSuccess();
  }

  getContentHeader() {
    return (
      <ModalHeading key="confirmHeader">
        <Trans render="span">Are you sure?</Trans>
      </ModalHeading>
    );
  }

  // L10NTODO: Restructure "action" prop to be one of these entire strings, and pretranslate it.
  // Otherwise, we have to translate the phrase into 3 parts.
  getConfirmTextBody(selectedItems, selectedItemsLength) {
    const { action } = this.props;
    let secretText;

    if (selectedItemsLength === 1) {
      secretText = selectedItems[0].getPath();
    } else {
      secretText = "these secrets";
    }

    if (action === UserActions.DELETE) {
      secretText = `${secretText}, any services that are making use of it will no longer be able to do so, and all history will be lost.`;
    } else if (action === "disable") {
      secretText = `${secretText}, any services that are making use of it will no longer be able to do so.`;
    } else if (action === "enable") {
      secretText = `${secretText}, services will be able to access them.`;
    }

    return (
      <span key="confirmText">
        If you {action} {secretText}
      </span>
    );
  }

  getModalContents() {
    const { selectedItems } = this.props;
    const selectedItemsLength = selectedItems.length;

    return (
      <div>{this.getConfirmTextBody(selectedItems, selectedItemsLength)}</div>
    );
  }
  onSecretsStoreDeleteSecretError = error => {
    this.setState({ errorMsg: error, pendingRequest: false });
  };
  getErrorMessage = () => {
    const { errorMsg } = this.state;

    if (!errorMsg) {
      return null;
    }

    return (
      <h4 className="text-align-center text-danger flush-top">{errorMsg}</h4>
    );
  };
  handleClose = () => {
    this.setState({ errorMsg: null, pendingRequest: false }, () => {
      this.props.onClose();
    });
  };

  render() {
    const { action, open } = this.props;
    const { pendingRequest } = this.state;

    const rightButtonClassSet = classNames("button", {
      "button-danger": action === UserActions.DELETE || action === "disable",
      "button-primary": action === "enable"
    });

    const actionText = ((action, isPending) => {
      switch (action) {
        case "delete":
          return isPending ? i18n._(t`Deleting...`) : i18n._(t`Delete`);
        case "disable":
          return isPending ? i18n._(t`Disabling...`) : i18n._(t`Disable`);
        case "enable":
          return isPending ? i18n._(t`Enabling...`) : i18n._(t`Enable`);
        default:
          return action;
      }
    })(action, pendingRequest);

    return (
      <Confirm
        closeByBackdropClick={true}
        disabled={pendingRequest}
        header={this.getContentHeader()}
        open={open}
        onClose={this.handleClose}
        leftButtonText="Cancel"
        leftButtonCallback={this.handleClose}
        leftButtonClassName="button button-primary-link flush-left"
        rightButtonText={actionText || "Enable"}
        rightButtonClassName={rightButtonClassSet}
        rightButtonCallback={this.handleButtonConfirm}
        showHeader={true}
      >
        {this.getErrorMessage()}
        {this.getModalContents()}
      </Confirm>
    );
  }
}

SecretActionsModal.defaultProps = {
  onSuccess() {}
};

SecretActionsModal.propTypes = {
  action: PropTypes.string,
  itemID: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  open: PropTypes.bool.isRequired,
  selectedItems: PropTypes.array.isRequired
};

export default SecretActionsModal;
