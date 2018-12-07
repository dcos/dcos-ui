import { i18nMark, withI18n } from "@lingui/react";
import PropTypes from "prop-types";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { Trans, t } from "@lingui/macro";

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
    const { numberOfRepositories, i18n } = this.props;
    const noRepositories = numberOfRepositories === 0;

    return [
      {
        fieldType: "text",
        name: "name",
        placeholder: i18n._(t`Repository Name`),
        required: true,
        showError: false,
        showLabel: i18n._(t`Repository Name`),
        writeType: "input",
        validation() {
          return true;
        },
        value: ""
      },
      {
        fieldType: "text",
        name: "uri",
        placeholder: i18n._(t`URL`),
        required: true,
        showError: false,
        showLabel: i18n._(t`URL`),
        writeType: "input",
        validation() {
          return true;
        },
        value: ""
      },
      {
        fieldType: "number",
        name: "priority",
        placeholder: i18n._(t`Priority`),
        required: false,
        min: "0",
        max: `${numberOfRepositories}`,
        step: "1",
        disabled: noRepositories,
        validationErrorText: i18n._(
          t`Must be a positive integer between 0 and ${numberOfRepositories} representing its priority. 0 is the highest and an empty field denotes the lowest priority.`
        ),
        showLabel: i18n._(t`Priority`),
        writeType: "input",
        validation(value) {
          return value !== null
            ? ValidatorUtil.isInteger(value) && value >= 0
            : true;
        },
        value: noRepositories ? "0" : ""
      }
    ];
  }

  getButtonDefinition() {
    return [
      {
        text: i18nMark("Cancel"),
        className: "button button-primary-link flush-left",
        isClose: true
      },
      {
        text: i18nMark("Add Repository"),
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
          header: (
            <ModalHeading>
              <Trans render="span">Add Repository</Trans>
            </ModalHeading>
          ),
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

module.exports = withI18n()(AddRepositoryFormModal);
