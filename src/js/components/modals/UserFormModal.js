import mixin from "reactjs-mixin";
import { Hooks } from "PluginSDK";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import AuthStore from "../../stores/AuthStore";
import FormModal from "../FormModal";
import ModalHeading from "../modals/ModalHeading";
import UserStore from "../../stores/UserStore";

const TELEMETRY_NOTIFICATION =
  "Because telemetry is disabled you must manually notify users of ACL changes.";

const METHODS_TO_BIND = ["handleNewUserSubmit", "onUserStoreCreateSuccess"];

class UserFormModal extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      disableNewUser: false,
      errorMsg: false,
      errorCode: null
    };

    this.store_listeners = [
      {
        name: "user",
        events: ["createSuccess", "createError"],
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  onUserStoreCreateSuccess() {
    this.setState({
      disableNewUser: false,
      errorMsg: false,
      errorCode: null
    });
    this.props.onClose();
  }

  onUserStoreCreateError(errorMsg, userID, xhr) {
    this.setState({
      disableNewUser: false,
      errorMsg,
      errorCode: xhr.status
    });
  }

  handleNewUserSubmit(model) {
    this.setState({ disableNewUser: true });

    const userModelObject = Hooks.applyFilter(
      "userModelObject",
      Object.assign({}, model, {
        creator_uid: AuthStore.getUser().uid,
        cluster_url: `${global.location.protocol}//${global.location.hostname}`
      })
    );
    UserStore.addUser(userModelObject);
  }

  getButtonDefinition() {
    return Hooks.applyFilter("userFormModalButtonDefinition", [
      {
        text: "Cancel",
        className: "button button-medium",
        isClose: true
      },
      {
        text: "Add User",
        className: "button button-success button-medium",
        isSubmit: true
      }
    ]);
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
          value: ""
        }
      ],
      props,
      state
    );
  }

  getHeader() {
    return Hooks.applyFilter(
      "userFormModalHeader",
      <ModalHeading>
        Add User to Cluster
      </ModalHeading>
    );
  }

  getFooter() {
    return Hooks.applyFilter(
      "userFormModalFooter",
      <p className="flush-bottom text-align-center">
        <strong>Important:</strong> {TELEMETRY_NOTIFICATION}
      </p>
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
          showHeader: true
        }}
        onClose={this.props.onClose}
        onSubmit={this.handleNewUserSubmit}
        open={this.props.open}
        contentFooter={this.getFooter()}
      />
    );
  }
}
module.exports = UserFormModal;
