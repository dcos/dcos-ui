import PropTypes from "prop-types";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import FormModal from "#SRC/js/components/FormModal";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";

const METHODS_TO_BIND = ["handleAddRepository"];

class AddRepositoryFormModal extends React.Component {
  constructor() {
    super();

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleAddRepository(model) {
    this.props.addRepository(model);
  }

  getAddRepositoryFormDefinition() {
    const { numberOfRepositories } = this.props;

    return [
      {
        fieldType: "text",
        name: "name",
        placeholder: "Repository Name",
        required: true,
        showError: false,
        showLabel: false,
        writeType: "input",
        validation() {
          return true;
        },
        value: ""
      },
      {
        fieldType: "text",
        name: "uri",
        placeholder: "URL",
        required: true,
        validationErrorText: "Must be a valid url with http:// or https://",
        showLabel: false,
        writeType: "input",
        validation: /^https?:\/\/.+\..+$/,
        value: ""
      },
      {
        fieldType: "number",
        name: "priority",
        placeholder: "Priority",
        required: false,
        min: "0",
        max: `${numberOfRepositories}`,
        step: "1",
        validationErrorText: `Must be a positive integer between 0 and ${numberOfRepositories} representing its priority. 0 is the highest and ${numberOfRepositories} denotes the lowest priority.`,
        showLabel: false,
        writeType: "input",
        validation(value) {
          return (
            ValidatorUtil.isDefined(value) &&
            ValidatorUtil.isNumberInRange(value, { max: numberOfRepositories })
          );
        },
        value: ""
      }
    ];
  }

  getButtonDefinition() {
    return [
      {
        text: "Cancel",
        className: "button button-primary-link flush-left",
        isClose: true
      },
      {
        text: "Add Repository",
        className: "button button-primary",
        isSubmit: true
      }
    ];
  }

  getErrorMessage(errorMsg) {
    if (!errorMsg) {
      return null;
    }

    return (
      <h4 className="text-align-center text-danger flush-top">{errorMsg}</h4>
    );
  }

  render() {
    const { props } = this;

    return (
      <FormModal
        definition={this.getAddRepositoryFormDefinition()}
        disabled={props.pendingRequest}
        buttonDefinition={this.getButtonDefinition()}
        modalProps={{
          header: <ModalHeading>Add Repository</ModalHeading>,
          showHeader: true
        }}
        onSubmit={this.handleAddRepository}
        onClose={props.onClose}
        open={props.open}
      >
        {this.getErrorMessage(props.errorMsg)}
      </FormModal>
    );
  }
}

AddRepositoryFormModal.propTypes = {
  numberOfRepositories: PropTypes.number.isRequired,
  open: PropTypes.bool,
  addRepository: PropTypes.func.isRequired
};

module.exports = AddRepositoryFormModal;
