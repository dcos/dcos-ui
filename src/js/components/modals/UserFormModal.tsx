import { Trans } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";

import mixin from "reactjs-mixin";
import { Hooks } from "PluginSDK";
import * as React from "react";

import StoreMixin from "#SRC/js/mixins/StoreMixin";
import AuthStore from "../../stores/AuthStore";
import FormModal from "../FormModal";
import ModalHeading from "../modals/ModalHeading";
import UserStore from "../../stores/UserStore";

class UserFormModal extends mixin(StoreMixin) {
  state = {
    disableNewUser: false,
    errorMsg: false,
    errorCode: null,
  };

  // prettier-ignore
  store_listeners = [
    {name: "user", events: ["createSuccess", "createError"], suppressUpdate: true}
  ];
  onUserStoreCreateSuccess = () => {
    this.setState({
      disableNewUser: false,
      errorMsg: false,
      errorCode: null,
    });
    this.props.onClose();
  };

  onUserStoreCreateError(errorMsg, userID, xhr) {
    this.setState({
      disableNewUser: false,
      errorMsg,
      errorCode: xhr.status,
    });
  }
  handleClose = () => {
    this.setState({
      disableNewUser: false,
      errorMsg: false,
      errorCode: null,
    });
    this.props.onClose();
  };
  handleNewUserSubmit = (model) => {
    const { i18n } = this.props;
    const passwordsMessage = i18nMark("Passwords do not match.");

    if (model.password !== model.confirmPassword) {
      // Check if passwords match.
      return this.setState({
        errorMsg: i18n._(passwordsMessage),
      });
    }
    delete model.confirmPassword; // We don't need to send this to the backend.
    this.setState({ disableNewUser: true });

    const userModelObject = Hooks.applyFilter("userModelObject", {
      ...model,
      creator_uid: AuthStore.getUser().uid,
      cluster_url: `${window.location.protocol}//${window.location.hostname}`,
    });
    UserStore.addUser(userModelObject);
  };

  getButtonDefinition() {
    const { props, state } = this;

    return Hooks.applyFilter(
      "userFormModalButtonDefinition",
      [
        {
          text: i18nMark("Cancel"),
          className: "button button-primary-link",
          isClose: true,
        },
        {
          text: state.disableNewUser
            ? i18nMark("Adding...")
            : i18nMark("Add User"),
          className: "button button-primary",
          isSubmit: true,
        },
      ],
      props,
      state
    );
  }

  getNewUserFormDefinition() {
    const { props, state } = this;

    return Hooks.applyFilter(
      "userFormModalDefinition",
      [
        {
          fieldType: "text",
          name: "uid",
          placeholder: "Email",
          required: true,
          showError: state.errorMsg,
          showLabel: false,
          writeType: "input",
          validation() {
            return true;
          },
          value: "",
        },
      ],
      props,
      state
    );
  }

  getHeader() {
    return Hooks.applyFilter(
      "userFormModalHeader",
      <ModalHeading>
        <Trans render="span">Add User to Cluster</Trans>
      </ModalHeading>
    );
  }

  getFooter() {
    return (
      <div>
        {Hooks.applyFilter("userAddPolicy", null)}
        {Hooks.applyFilter(
          "userFormModalFooter",
          <Trans
            render="p"
            className="form-group-without-top-label flush-bottom text-align-center"
          >
            <strong>Important:</strong> Because telemetry is disabled you must
            manually notify users of ACL changes.
          </Trans>
        )}
      </div>
    );
  }

  render() {
    return (
      <FormModal
        buttonDefinition={this.getButtonDefinition()}
        definition={this.getNewUserFormDefinition()}
        disabled={this.state.disableNewUser}
        modalProps={{
          header: this.getHeader(),
          showHeader: true,
        }}
        onClose={this.handleClose}
        onSubmit={this.handleNewUserSubmit}
        open={this.props.open}
        contentFooter={this.getFooter()}
      />
    );
  }
}
export default withI18n()(UserFormModal);
