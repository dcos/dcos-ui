import { withI18n } from "@lingui/react";
import { Trans, t } from "@lingui/macro";
import classNames from "classnames";
import mixin from "reactjs-mixin";
import * as React from "react";

import FormModal from "#SRC/js/components/FormModal";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import ACLGroupStore from "../../stores/ACLGroupStore";

class LDAPGroupFormModal extends mixin(StoreMixin) {
  state = {
    disableNewGroup: false,
    errorMsg: false,
    successMsg: false,
    groupnameValue: "",
  };

  formModalRef = React.createRef();

  // prettier-ignore
  store_listeners =  [
    {name: "aclGroup", events: ["createLDAPSuccess", "createLDAPPartialSuccess", "createLDAPError"]}
  ];
  onAclGroupStoreCreateLDAPSuccess = (successMsg) => {
    this.setState({
      disableNewGroup: false,
      errorMsg: false,
      successMsg,
      partialSuccess: false,
      groupnameValue: "",
    });

    if (this.formModalRef && this.formModalRef.current) {
      this.formModalRef.current.focusOnField();
    }
  };
  onAclGroupStoreCreateLDAPPartialSuccess = (data, groupID) => {
    const successMsg = `Group ${groupID} was partially added. The number of
    imported users is ${data.importedUserCount}.
    The import will continue with the next invocation of the LDAP synchronization service.`;
    this.setState({
      disableNewGroup: false,
      errorMsg: false,
      successMsg,
      partialSuccess: true,
      groupnameValue: "",
    });

    if (this.formModalRef && this.formModalRef.current) {
      this.formModalRef.current.focusOnField();
    }
  };
  onAclGroupStoreCreateLDAPError = (errorMsg) => {
    this.setState({
      disableNewGroup: false,
      errorMsg,
      successMsg: false,
    });
  };
  handleNewGroupSubmit = (model) => {
    this.setState({
      disableNewGroup: true,
      groupnameValue: model.groupname,
    });
    ACLGroupStore.addLDAPGroup(model);
  };
  handleModalClose = () => {
    this.setState({
      disableNewGroup: false,
      errorMsg: false,
      successMsg: false,
      groupnameValue: "",
    });
    this.props.onClose();
  };

  getNewGroupFormDefinition() {
    const { i18n } = this.props;

    const { disableNewGroup, errorMsg, groupnameValue } = this.state;
    const addButtonClassSet = classNames("button button-primary", {
      disabled: disableNewGroup,
    });

    return [
      [
        {
          fieldType: "text",
          columnWidth: 9,
          name: "groupname",
          placeholder: i18n._(t`Group Name`),
          required: true,
          showError: errorMsg,
          showLabel: false,
          writeType: "input",
          validation() {
            return true;
          },
          value: groupnameValue,
        },
        {
          fieldType: "submit",
          name: "submit",
          columnWidth: 3,
          formGroupClass: "text-align-right",
          buttonText: i18n._(t`Add`),
          buttonClass: addButtonClassSet,
          disabled: disableNewGroup,
        },
      ],
      {
        render: this.getSuccessMessage,
      },
    ];
  }
  getSuccessMessage = () => {
    const { successMsg, partialSuccess } = this.state;
    if (!successMsg) {
      return null;
    }

    const content = partialSuccess ? (
      successMsg
    ) : (
      <Trans render="span">Group {successMsg} added.</Trans>
    );

    return (
      <p className="flush text-success text-align-center" key="successMessage">
        {content}
      </p>
    );
  };

  render() {
    const { i18n } = this.props;

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
        definition={this.getNewGroupFormDefinition()}
        disabled={this.state.disableNewGroup}
        modalProps={{
          header: (
            <ModalHeading>
              <Trans render="span">Import LDAP Groups</Trans>
            </ModalHeading>
          ),
          showHeader: true,
        }}
        onClose={this.handleModalClose}
        onSubmit={this.handleNewGroupSubmit}
        open={this.props.open}
        ref="formModal"
      />
    );
  }
}
export default withI18n()(LDAPGroupFormModal);
