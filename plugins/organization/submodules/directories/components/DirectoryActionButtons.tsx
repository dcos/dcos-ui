import { withI18n, i18nMark } from "@lingui/react";
import { Trans, t } from "@lingui/macro";
import mixin from "reactjs-mixin";
import { Modal, Confirm } from "reactjs-components";
import * as React from "react";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import FormModal from "#SRC/js/components/FormModal";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import ACLDirectoriesStore from "../stores/ACLDirectoriesStore";

class DirectoryActionButtons extends mixin(StoreMixin) {
  constructor(...args) {
    super(...args);

    this.state = {
      formModalDisabled: false,
      formModalOpen: false,
      successModalOpen: false,
      deleteConfirm: false,
      deleteConfirmDisabled: false,
    };

    // prettier-ignore
    this.store_listeners = [
      {name: "aclDirectories", events: ["testSuccess", "testError", "deleteError"]}
    ];
  }

  onAclDirectoriesStoreTestSuccess(data) {
    const { i18n } = this.props;

    const message =
      data.code === "SUCCESS_BUT_INVALID_CREDENTIALS"
        ? i18n._(
            t`The connection to the LDAP server was successful, but credentials were invalid.`
          )
        : i18n._(t`Connection with LDAP server was successful!`);

    this.setState({
      formModalOpen: false,
      formModalDisabled: false,
      successModalMessage: message,
      successModalOpen: true,
    });
  }

  onAclDirectoriesStoreTestError() {
    this.setState({ formModalDisabled: false });
  }

  onAclDirectoriesStoreDeleteError() {
    this.setState({ deleteConfirmDisabled: false });
  }
  handleDirectoryConfirm = () => {
    this.setState({ deleteConfirmDisabled: true });
    ACLDirectoriesStore.deleteDirectory();
  };
  handleDirectoryConfirmAbort = () => {
    this.setState({ deleteConfirm: false });
  };
  handleDirectoryDelete = () => {
    this.setState({ deleteConfirm: true });
  };
  handleSuccessModalClose = () => {
    this.setState({ successModalOpen: false });
  };
  handleFormModalSubmit = (formData) => {
    ACLDirectoriesStore.testDirectoryConnection(formData);
    this.setState({ formModalDisabled: true });
  };
  changeFormModalOpenState = (open) => {
    this.setState({ formModalOpen: open, formModalDisabled: false });
  };

  getModalFormDefinition() {
    const { i18n } = this.props;

    return [
      {
        fieldType: "text",
        name: "uid",
        placeholder: i18n._(t`LDAP Username`),
        required: true,
        showLabel: false,
        writeType: "input",
        validation() {
          return true;
        },
        value: "",
      },
      {
        fieldType: "password",
        name: "password",
        placeholder: i18n._(t`LDAP Password`),
        required: true,
        showLabel: false,
        writeType: "input",
        validation() {
          return true;
        },
        value: "",
      },
    ];
  }

  render() {
    const { i18n } = this.props;
    const deleteActionText = this.state.deleteConfirmDisabled
      ? i18n._(t`Deleting...`)
      : i18n._(t`Delete`);

    const buttonDefinition = [
      {
        text: i18nMark("Cancel"),
        className: "button button-primary-link flush-left",
        isClose: true,
      },
      {
        text: this.state.formModalDisabled
          ? i18nMark("Testing...")
          : i18nMark("Test Connection"),
        className: "button button-primary",
        isSubmit: true,
      },
    ];

    return (
      <div>
        <div className="button-collection">
          <Trans
            render={
              <button
                className="button button-primary-link flush-left"
                onClick={this.props.onConfigurationEditClick}
              />
            }
          >
            Edit
          </Trans>
          <Trans
            render={
              <button
                className="button button-primary"
                onClick={this.changeFormModalOpenState.bind(null, true)}
              />
            }
          >
            Test Connection
          </Trans>
          <Trans
            render={
              <button
                className="button button-danger button-margin-left"
                onClick={this.handleDirectoryDelete}
              />
            }
          >
            Delete
          </Trans>
        </div>

        <Confirm
          open={this.state.deleteConfirm}
          disabled={this.state.deleteConfirmDisabled}
          onClose={this.handleDirectoryConfirmAbort}
          leftButtonText={i18n._(t`Cancel`)}
          leftButtonClassName="button button-primary-link flush-left"
          leftButtonCallback={this.handleDirectoryConfirmAbort}
          rightButtonText={deleteActionText}
          rightButtonClassName="button button-danger"
          rightButtonCallback={this.handleDirectoryConfirm}
        >
          <Trans
            render="h2"
            className="text-danger text-align-center flush-top"
          >
            Delete LDAP
          </Trans>
          <Trans>Are you sure you want to delete this LDAP directory?</Trans>
        </Confirm>

        <FormModal
          buttonDefinition={buttonDefinition}
          definition={this.getModalFormDefinition()}
          disabled={this.state.formModalDisabled}
          modalProps={{
            header: (
              <ModalHeading>
                <Trans render="span">Test External Directory</Trans>
              </ModalHeading>
            ),
            showHeader: true,
          }}
          onClose={this.changeFormModalOpenState.bind(null, false)}
          onSubmit={this.handleFormModalSubmit}
          open={this.state.formModalOpen}
        />

        <Modal
          headerClass="modal-header modal-header-white"
          modalClass="modal"
          onClose={this.handleSuccessModalClose}
          open={this.state.successModalOpen}
          showCloseButton={true}
          showHeader={false}
          showFooter={false}
        >
          <Trans render="span" id={this.state.successModalMessage} />
        </Modal>
      </div>
    );
  }
}

export default withI18n()(DirectoryActionButtons);
