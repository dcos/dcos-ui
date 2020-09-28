import { withI18n } from "@lingui/react";
import { Trans, t } from "@lingui/macro";
import mixin from "reactjs-mixin";
import * as React from "react";

import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import StoreMixin from "#SRC/js/mixins/StoreMixin";
import ACLGroupStore from "../stores/ACLGroupStore";

class GroupFormModal extends mixin(StoreMixin) {
  state = { disableNewGroup: false, errorMsg: false };

  store_listeners = [
    { name: "aclGroup", events: ["createSuccess", "createError"] },
  ];
  onAclGroupStoreCreateSuccess = () => {
    this.setState({
      disableNewGroup: false,
      errorMsg: false,
    });
    this.props.onClose();
  };
  onAclGroupStoreCreateError = (errorMsg) => {
    this.setState({
      disableNewGroup: false,
      errorMsg,
    });
  };
  onClose = () => {
    this.setState({
      errorMsg: false,
    });
    this.props.onClose();
  };
  handleNewGroupSubmit = (model) => {
    this.setState({ disableNewGroup: true });
    ACLGroupStore.addGroup(model);
  };

  getNewGroupFormDefinition() {
    const { i18n } = this.props;

    return [
      {
        fieldType: "text",
        name: "description",
        required: true,
        showError: this.state.errorMsg,
        showLabel: i18n._(t`Group name`),
        writeType: "input",
        validation() {
          return true;
        },
        value: "",
      },
    ];
  }

  getNewGroupButtonDefinition() {
    const { i18n } = this.props;

    return [
      {
        text: i18n._(t`Cancel`),
        className: "button button-primary-link flush-left",
        isClose: true,
      },
      {
        text: this.state.disableNewGroup
          ? i18n._(t`Creating...`)
          : i18n._(t`Create`),
        className: "button button-primary",
        isSubmit: true,
      },
    ];
  }

  render() {
    const FormModal = require("#SRC/js/components/FormModal").default;

    return (
      <FormModal
        disabled={this.state.disableNewGroup}
        modalProps={{
          header: (
            <ModalHeading>
              <Trans render="span">Create New Group</Trans>
            </ModalHeading>
          ),
          showHeader: true,
        }}
        onClose={this.onClose}
        onSubmit={this.handleNewGroupSubmit}
        open={this.props.open}
        definition={this.getNewGroupFormDefinition()}
        buttonDefinition={this.getNewGroupButtonDefinition()}
      />
    );
  }
}

export default withI18n()(GroupFormModal);
