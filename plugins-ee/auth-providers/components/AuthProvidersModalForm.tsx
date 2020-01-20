import { withI18n } from "@lingui/react";
import { Trans } from "@lingui/macro";
import { Form, Modal } from "reactjs-components";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import Util from "#SRC/js/utils/Util";

import AuthProvider from "../structs/AuthProvider";
import AuthProviderStore from "../stores/AuthProviderStore";
import AuthProvidersFormDefinitions from "../constants/AuthProvidersFormDefinitions";
import ProviderTypes from "../constants/ProviderTypes";

class AuthProvidersModalForm extends mixin(StoreMixin) {
  constructor(...args) {
    super(...args);

    // prettier-ignore
    this.store_listeners = [
      { name: "authProvider", events: ["createSuccess", "createError", "updateSuccess", "updateError"], suppressUpdate: true }
    ];

    this.state = {
      disableSubmit: false,
      errorCode: false,
      errorMsg: false
    };
  }
  onAuthProviderStoreCreateSuccess = () => {
    this.setState({
      disableSubmit: false,
      errorMsg: false
    });
    this.props.onClose();
  };
  onAuthProviderStoreCreateError = errorMsg => {
    const errorCode = "DEFAULT";

    this.setState(
      {
        disableSubmit: false,
        errorCode,
        errorMsg
      },
      this.props.onError
    );
  };
  onAuthProviderStoreUpdateSuccess = () => {
    this.setState({
      disableSubmit: false,
      errorMsg: false
    });
    this.props.onClose();
  };
  onAuthProviderStoreUpdateError = errorMsg => {
    this.setState(
      {
        disableSubmit: false,
        errorMsg
      },
      this.props.onError
    );
  };
  handleAuthProviderClose = () => {
    this.setState({
      errorMsg: false,
      errorCode: false
    });
    this.props.onClose();
  };
  handleAuthProviderSubmit = model => {
    this.setState({ disableSubmit: true });

    let { provider, providerType } = this.props;
    const isEditMode = !providerType;
    let providerID = model.id;
    model = Util.omit(model, ["id"]);

    if (isEditMode) {
      providerType = provider.getProviderType();
      providerID = provider.getID();

      AuthProviderStore.update(providerType, providerID, model);
    } else {
      AuthProviderStore.create(providerType, providerID, model);
    }
  };

  getAuthProviderFormDefinition(isEditMode) {
    let { provider, providerType, i18n } = this.props;

    if (!(provider || providerType)) {
      return [];
    }

    if (isEditMode) {
      providerType = provider.getProviderType();
    }

    const formDefinition = AuthProvidersFormDefinitions[providerType]
      .slice()
      .map(def => ({ ...def, showLabel: i18n._(def.showLabel) }));

    if (isEditMode) {
      const providerSettings = provider.getDetails();
      // Hide ProviderID field because it cannot be edited.
      formDefinition.shift();

      return formDefinition.map(field => {
        const { showLabel } = field;
        if (Object.prototype.hasOwnProperty.call(providerSettings, showLabel)) {
          return { ...field, value: providerSettings[showLabel] };
        }

        return field;
      });
    }

    return formDefinition;
  }

  getErrorMessage() {
    const { errorMsg } = this.state;

    if (errorMsg) {
      return <p className="text-error-state">{errorMsg}</p>;
    }
  }

  getSubTitle() {
    const { provider } = this.props;
    const isEditMode = provider instanceof AuthProvider;

    if (isEditMode) {
      return (
        <Trans render="p">
          Changing the settings may lead to errors. Please check with your
          identity provider before making changes. All fields are required.
        </Trans>
      );
    }

    return (
      <Trans render="p">
        Please make sure you have the required information from your provider.
        All fields are required.
      </Trans>
    );
  }

  getTitle(isEditMode) {
    const { i18n } = this.props;

    if (isEditMode) {
      return <Trans render="span">Identity Provider Settings</Trans>;
    }
    if (this.props.providerType) {
      const title = i18n._(ProviderTypes[this.props.providerType].title);

      return <Trans render="span">Add {title} Identity Provider</Trans>;
    }
  }

  render() {
    const { footer, onClose, open, provider } = this.props;
    const isEditMode = provider instanceof AuthProvider;

    const header = <ModalHeading>{this.getTitle(isEditMode)}</ModalHeading>;

    return (
      <Modal
        footer={footer}
        modalClass="modal modal-large"
        onClose={onClose}
        open={open}
        showFooter={true}
        transitionAppear={false}
        header={header}
        showHeader={true}
      >
        <div>
          {this.getSubTitle()}
          {this.getErrorMessage()}
        </div>
        <Form
          definition={this.getAuthProviderFormDefinition(isEditMode)}
          onSubmit={this.handleAuthProviderSubmit}
          triggerSubmit={this.props.triggerSubmit}
        />
      </Modal>
    );
  }
}

AuthProvidersModalForm.defaultProps = {
  onError() {}
};

AuthProvidersModalForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func,
  provider: PropTypes.instanceOf(AuthProvider),
  providerType: PropTypes.string,
  triggerSubmit: PropTypes.func
};

export default withI18n()(AuthProvidersModalForm);
