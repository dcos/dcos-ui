import classNames from 'classnames';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import CosmosPackagesStore from '../../stores/CosmosPackagesStore';
import FormModal from '../FormModal';

const METHODS_TO_BIND = [
  'handleAddRepository',
  'onCosmosPackagesStoreRepositoryAddError',
  'onCosmosPackagesStoreRepositoryAddSuccess'
];

class AddRepositoryFormModal extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      disableButtons: false,
      errorMsg: false
    };

    this.store_listeners = [
      {
        name: 'cosmosPackages',
        events: ['repositoryAddSuccess', 'repositoryAddError']
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onCosmosPackagesStoreRepositoryAddError(errorMsg) {
    this.setState({
      disableButtons: false,
      errorMsg
    });
  }

  onCosmosPackagesStoreRepositoryAddSuccess() {
    CosmosPackagesStore.fetchRepositories();
    this.props.onClose();
  }

  handleAddRepository(model) {
    CosmosPackagesStore.addRepository(model.name, model.uri);
    this.setState({disableButtons: true});
  }

  getAddRepositoryFormDefinition() {
    return [
      {
        fieldType: 'text',
        name: 'name',
        placeholder: 'Repository Name',
        required: true,
        showError: false,
        showLabel: false,
        writeType: 'input',
        validation: function () { return true; },
        value: ''
      },
      {
        fieldType: 'text',
        name: 'uri',
        placeholder: 'URL',
        required: true,
        validationErrorText: 'Must be a valid url with http:// or https://',
        showLabel: false,
        writeType: 'input',
        validation: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/,
        value: ''
      }
    ];
  }

  getButtonDefinition() {
    return [
      {
        text: 'Close',
        className: 'button button-medium',
        isClose: true
      },
      {
        text: 'Add',
        className: 'button button-success button-medium',
        isSubmit: true
      }
    ];
  }

  getErrorMessage() {
    let {errorMsg} = this.state;
    if (!errorMsg) {
      return null;
    }
    return (
      <h4 className="text-align-center text-danger flush-top">{errorMsg}</h4>
    );
  }

  render() {
    let {props, state} = this;

    let headerClasses = classNames(
      'modal-header-title text-align-center flush-top',
      {'short-bottom': this.state.errorMsg}
    );

    return (
      <FormModal
        definition={this.getAddRepositoryFormDefinition()}
        disabled={state.disableButtons}
        buttonDefinition={this.getButtonDefinition()}
        onClose={props.onClose}
        onSubmit={this.handleAddRepository}
        open={props.open}
        titleText="Add Repository">
        <h2 className={headerClasses}>
          Add Repository
        </h2>
        {this.getErrorMessage()}
      </FormModal>
    );
  }
}

AddRepositoryFormModal.propTypes = {
  open: React.PropTypes.bool
};

module.exports = AddRepositoryFormModal;
