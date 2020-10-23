import { withI18n } from "@lingui/react";
import { Trans, t } from "@lingui/macro";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";

import FormModal from "#SRC/js/components/FormModal";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

class UserEditFormModal extends mixin(StoreMixin) {
  static propTypes = {
    account: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
  };

  // prettier-ignore
  store_listeners = [
    { name: "aclUser", events: ["updateSuccess", "updateError"], suppressUpdate: true }
  ];

  state = { disableSubmit: false, errorMsg: false };

  onAclUserStoreUpdateSuccess = () => {
    this.setState({
      disableSubmit: false,
      errorMsg: false,
    });
    this.props.onClose();
  };
  onAclUserStoreUpdateError = (errorMsg) => {
    this.setState({
      disableSubmit: false,
      errorMsg,
    });
  };
  handleUserClose = () => {
    this.setState({ errorMsg: false });
    this.props.onClose();
  };
  handleUserSubmit = (model) => {
    const { i18n } = this.props;

    if (model.password !== model.confirmPassword) {
      // Check if passwords match.
      return this.setState({
        errorMsg: i18n._(t`Passwords do not match.`),
      });
    }
    delete model.confirmPassword; // We don't need to send this to the backend.

    Object.keys(model).forEach((key) => {
      if (!model[key] || model[key].length === 0) {
        delete model[key];
      }
    });

    this.setState({ disableSubmit: true });
    this.props.onSubmit(model);
  };

  getButtonDefinition() {
    const { i18n } = this.props;
    const { disableSubmit } = this.state;

    return [
      {
        text: i18n._(t`Cancel`),
        className: "button button-primary-link flush-left",
        isClose: true,
      },
      {
        text: disableSubmit ? i18n._(t`Saving...`) : i18n._(t`Save`),
        className: "button button-primary",
        isSubmit: true,
      },
    ];
  }

  getUserFormDefinition() {
    const { i18n } = this.props;
    const { errorMsg } = this.state;
    const passwordErrors = [
      "Passwords do not match.",
      "Password does not match rules: Must be at least 5 characters long.",
    ];
    // We do not want to show password errors under the name field.
    const nameErrorMsg = passwordErrors.includes(errorMsg) ? null : errorMsg;

    return [
      {
        fieldType: "text",
        name: "description",
        placeholder: false,
        required: false,
        showError: nameErrorMsg,
        showLabel: i18n._(t`Full Name`),
        writeType: "input",
        validation() {
          return true;
        },
        value: this.props.account.get("description"),
      },
      {
        fieldType: "password",
        name: "password",
        placeholder: false,
        required: false,
        showError: errorMsg,
        showLabel: i18n._(t`New Password`),
        writeType: "input",
        validation() {
          return true;
        },
        value: "",
      },
      {
        fieldType: "password",
        name: "confirmPassword",
        placeholder: false,
        required: false,
        showError: errorMsg,
        showLabel: i18n._(t`Confirm New Password`),
        writeType: "input",
        validation() {
          return true;
        },
        value: "",
      },
    ];
  }

  getHeader() {
    return (
      <ModalHeading>
        <Trans render="span">Edit User</Trans>
      </ModalHeading>
    );
  }

  render() {
    return (
      <FormModal
        buttonDefinition={this.getButtonDefinition()}
        definition={this.getUserFormDefinition()}
        disabled={this.state.disableSubmit}
        modalProps={{
          header: this.getHeader(),
          showHeader: true,
        }}
        onClose={this.handleUserClose}
        onSubmit={this.handleUserSubmit}
        open={this.props.open}
      />
    );
  }
}

export default withI18n()(UserEditFormModal);
