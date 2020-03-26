import { withI18n } from "@lingui/react";
import { Trans, t } from "@lingui/macro";
import classNames from "classnames";
import mixin from "reactjs-mixin";
import * as React from "react";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import ACLUserStore from "../../stores/ACLUserStore";

class LDAPUserFormModal extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      disableNewUser: false,
      errorMsg: false,
      successMsg: false,
      usernameValue: "",
    };

    this.formModalRef = React.createRef();

    this.store_listeners = [
      { name: "aclUser", events: ["createLDAPSuccess", "createLDAPError"] },
    ];
  }
  onAclUserStoreCreateLDAPSuccess = (successMsg) => {
    this.setState({
      disableNewUser: false,
      errorMsg: false,
      successMsg,
      usernameValue: "",
    });

    if (this.formModalRef && this.formModalRef.current) {
      this.formModalRef.current.focusOnField();
    }
  };
  onAclUserStoreCreateLDAPError = (errorMsg) => {
    this.setState({
      disableNewUser: false,
      errorMsg,
      successMsg: false,
    });
  };
  handleNewUserSubmit = (model) => {
    this.setState({
      disableNewUser: true,
      usernameValue: model.description,
    });
    ACLUserStore.addLDAPUser(model);
  };
  handleModalClose = () => {
    this.setState({
      disableNewUser: false,
      errorMsg: false,
      successMsg: false,
      usernameValue: "",
    });
    this.props.onClose();
  };

  getNewUserFormDefinition() {
    const { i18n } = this.props;

    const { disableNewUser, errorMsg, usernameValue } = this.state;
    const addButtonClassSet = classNames("button button-primary", {
      disabled: disableNewUser,
    });

    return [
      [
        {
          fieldType: "text",
          columnWidth: 9,
          name: "username",
          placeholder: i18n._(t`User Name`),
          required: true,
          showError: errorMsg,
          showLabel: false,
          writeType: "input",
          validation() {
            return true;
          },
          value: usernameValue,
        },
        {
          fieldType: "submit",
          name: "submit",
          columnWidth: 3,
          formGroupClass: "text-align-right",
          buttonText: disableNewUser ? i18n._(t`Adding...`) : i18n._(t`Add`),
          buttonClass: addButtonClassSet,
          disabled: disableNewUser,
        },
      ],
      {
        render: this.getSuccessMessage,
      },
    ];
  }
  getSuccessMessage = () => {
    const { successMsg } = this.state;
    if (!successMsg) {
      return null;
    }

    return (
      <Trans render="p" className="flush text-success text-align-center">
        User {successMsg} added.
      </Trans>
    );
  };

  render() {
    const { i18n } = this.props;
    const FormModal = require("#SRC/js/components/FormModal").default;

    const buttonDefinition = [
      {
        text: i18n._(t`Cancel`),
        className: "button button-primary-link flush-left",
        isClose: true,
      },
    ];

    return (
      <FormModal
        buttonDefinition={buttonDefinition}
        definition={this.getNewUserFormDefinition()}
        disabled={this.state.disableNewUser}
        modalProps={{
          header: (
            <ModalHeading>
              <Trans render="span">Import LDAP Users</Trans>
            </ModalHeading>
          ),
          showHeader: true,
        }}
        onClose={this.handleModalClose}
        onSubmit={this.handleNewUserSubmit}
        open={this.props.open}
        ref={this.formModalRef}
      />
    );
  }
}
export default withI18n()(LDAPUserFormModal);
