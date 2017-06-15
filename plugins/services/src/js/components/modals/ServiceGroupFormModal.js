import React, { PropTypes } from "react";
import PureRender from "react-addons-pure-render-mixin";

import FormModal from "../../../../../../src/js/components/FormModal";
import ModalHeading
  from "../../../../../../src/js/components/modals/ModalHeading";
import ServiceValidatorUtil from "../../utils/ServiceValidatorUtil";

const METHODS_TO_BIND = ["handleNewGroupSubmit"];

class ServiceGroupFormModal extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
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
    return [
      {
        fieldType: "text",
        name: "id",
        placeholder: "Group name",
        required: true,
        showLabel: false,
        writeType: "input",
        validation: ServiceValidatorUtil.isValidServiceID,
        validationErrorText: "Group name must be at least 1 character and " +
          "may only contain digits (0-9), dashes (-), dots (.), " +
          "and lowercase letters (a-z). The name may not begin or end " +
          "with a dash."
      }
    ];
  }

  render() {
    const { clearError, isPending, onClose, open, parentGroupId } = this.props;

    const buttonDefinition = [
      {
        text: "Cancel",
        className: "button button-medium",
        isClose: true
      },
      {
        text: "Create Group",
        className: "button button-success button-medium",
        isSubmit: true
      }
    ];

    return (
      <FormModal
        ref="form"
        buttonDefinition={buttonDefinition}
        disabled={isPending}
        modalProps={{
          header: <ModalHeading>Create Group</ModalHeading>,
          showHeader: true
        }}
        onClose={onClose}
        onSubmit={this.handleNewGroupSubmit}
        onChange={clearError}
        open={open}
        definition={this.getNewGroupFormDefinition()}
      >
        <p className="text-align-center flush-top">
          {"Enter a path for the new group under "}
          <span className="emphasize">{parentGroupId}</span>
        </p>
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

module.exports = ServiceGroupFormModal;
