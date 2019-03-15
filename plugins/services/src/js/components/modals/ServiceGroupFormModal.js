import { Trans, t } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";
import PropTypes from "prop-types";
import React from "react";

import FormModal from "#SRC/js/components/FormModal";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import ServiceValidatorUtil from "../../utils/ServiceValidatorUtil";

const METHODS_TO_BIND = ["handleNewGroupSubmit"];

class ServiceGroupFormModal extends React.PureComponent {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending && !nextProps.isPending;

    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.props.onClose();
    }
  }

  handleNewGroupSubmit(model) {
    const { parentGroupId } = this.props;

    this.props.createGroup(
      Object.assign({}, model, { id: `${parentGroupId}/${model.id}` })
    );
  }

  getErrorMessage() {
    const { errors } = this.props;
    if (!errors) {
      return null;
    }

    return (
      <h4 className="text-align-center text-danger flush-top">{errors}</h4>
    );
  }

  getNewGroupFormDefinition() {
    const { i18n } = this.props;

    return [
      {
        fieldType: "text",
        name: "id",
        placeholder: i18n._(t`Group name`),
        required: true,
        showLabel: false,
        writeType: "input",
        validation: ServiceValidatorUtil.isValidServiceID,
        validationErrorText: i18n._(
          t`Group name must be at least 1 character and may only contain digits (0-9), dashes (-), dots (.), and lowercase letters (a-z). The name may not begin or end with a dash.`
        )
      }
    ];
  }

  render() {
    const { clearError, isPending, onClose, open, parentGroupId } = this.props;

    const buttonDefinition = [
      {
        text: i18nMark("Cancel"),
        className: "button button-primary-link flush-left",
        isClose: true
      },
      {
        text: i18nMark("Create Group"),
        className: "button button-primary",
        isSubmit: true
      }
    ];

    return (
      <FormModal
        buttonDefinition={buttonDefinition}
        disabled={isPending}
        modalProps={{
          header: (
            <ModalHeading>
              <Trans render="span">Create Group</Trans>
            </ModalHeading>
          ),
          showHeader: true
        }}
        onClose={onClose}
        onSubmit={this.handleNewGroupSubmit}
        onChange={clearError}
        open={open}
        definition={this.getNewGroupFormDefinition()}
      >
        <Trans render="p">
          Enter a name for the new group under <strong>{parentGroupId}</strong>
        </Trans>
        {this.getErrorMessage()}
      </FormModal>
    );
  }
}

ServiceGroupFormModal.propTypes = {
  clearError: PropTypes.func.isRequired,
  createGroup: PropTypes.func.isRequired,
  errors: PropTypes.string,
  isPending: PropTypes.bool.isRequired,
  parentGroupId: PropTypes.string,
  onClose: PropTypes.func.isRequired
};

export default withI18n()(ServiceGroupFormModal);
