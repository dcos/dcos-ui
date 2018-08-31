import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import CosmosPackagesStore from "../../stores/CosmosPackagesStore";
import FormModal from "../FormModal";
import ModalHeading from "../modals/ModalHeading";
import ValidatorUtil from "../../utils/ValidatorUtil";

const METHODS_TO_BIND = [
  "handleAddRepository",
  "onCosmosPackagesStoreRepositoryAddError",
  "onCosmosPackagesStoreRepositoryAddSuccess",
  "resetState"
];

class AddRepositoryFormModal extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      disableButtons: false,
      errorMsg: null
    };

    this.store_listeners = [
      {
        name: "cosmosPackages",
        events: ["repositoryAddSuccess", "repositoryAddError"]
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    const { props } = this;
    if (props.open && !nextProps.open) {
      // Closes, reset state
      this.resetState();
    }
  }

  onCosmosPackagesStoreRepositoryAddError(errorMsg) {
    this.setState({ disableButtons: false, errorMsg });
  }

  onCosmosPackagesStoreRepositoryAddSuccess() {
    CosmosPackagesStore.fetchRepositories();
    this.props.onClose();
  }

  handleAddRepository(model) {
    CosmosPackagesStore.addRepository(model.name, model.uri, model.priority);
    this.resetState();
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
        showError: false,
        showLabel: false,
        writeType: "input",
        validation() {
          return true;
        },
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

  getErrorMessage() {
    const { errorMsg } = this.state;
    if (!errorMsg) {
      return null;
    }

    return (
      <h4 className="text-align-center text-danger flush-top">{errorMsg}</h4>
    );
  }

  resetState() {
    this.setState({ errorMsg: null, disableButtons: false });
  }

  render() {
    const { props, state } = this;

    return (
      <FormModal
        definition={this.getAddRepositoryFormDefinition()}
        disabled={state.disableButtons}
        buttonDefinition={this.getButtonDefinition()}
        modalProps={{
          header: <ModalHeading>Add Repository</ModalHeading>,
          showHeader: true
        }}
        onChange={this.resetState}
        onClose={props.onClose}
        onSubmit={this.handleAddRepository}
        open={props.open}
      >
        {this.getErrorMessage()}
      </FormModal>
    );
  }
}

AddRepositoryFormModal.propTypes = {
  numberOfRepositories: PropTypes.number.isRequired,
  open: PropTypes.bool
};

module.exports = AddRepositoryFormModal;
