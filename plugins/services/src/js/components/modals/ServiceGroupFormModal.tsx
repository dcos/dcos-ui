import { Trans, t } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";
import PropTypes from "prop-types";
import * as React from "react";

import FormModal from "#SRC/js/components/FormModal";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import ServiceValidatorUtil from "../../utils/ServiceValidatorUtil";

class ServiceGroupFormModal extends React.PureComponent {
  static propTypes = {
    clearError: PropTypes.func.isRequired,
    createGroup: PropTypes.func.isRequired,
    errors: PropTypes.string,
    isPending: PropTypes.bool.isRequired,
    parentGroupId: PropTypes.string,
    onClose: PropTypes.func.isRequired,
  };
  constructor(...args) {
    super(...args);
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending && !nextProps.isPending;

    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.props.onClose();
    }
  }
  handleNewGroupSubmit = (model) => {
    const { parentGroupId } = this.props;

    this.props.createGroup({
      ...model,
      id: `${parentGroupId}/${model.id}`,
    });
  };

  getErrorMessage() {
    const { errors, i18n } = this.props;
    if (!errors) {
      return null;
    }

    // The server error message for duplicate group name looks like
    // "Group /name is already created. Use PUT to change this group."
    // So we check the second sentence and if it matches
    // we add our custom translatable error message.
    if (
      errors.split(".")[errors.split(".").length - 2] ===
      " Use PUT to change this group"
    ) {
      return (
        <h4 className="text-align-center text-danger flush-top">
          {i18n._(
            t`A group with the same name already exists. Try a different name.`
          )}
        </h4>
      );
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
        validation: ServiceValidatorUtil.isValidGroupID,
        validationErrorText: i18n._(
          t`Group name must be at least 1 character and may only contain digits (0-9), dashes (-), dots (.), and lowercase letters (a-z). The name may not begin or end with a dash or dot.`
        ),
      },
    ];
  }

  render() {
    const { clearError, isPending, onClose, open, parentGroupId } = this.props;

    const buttonDefinition = [
      {
        text: i18nMark("Cancel"),
        className: "button button-primary-link flush-left",
        isClose: true,
      },
      {
        text: isPending ? i18nMark("Creating...") : i18nMark("Create Group"),
        className: "button button-primary",
        isSubmit: true,
      },
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
          showHeader: true,
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

export default withI18n()(ServiceGroupFormModal);
