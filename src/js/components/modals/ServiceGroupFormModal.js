import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import FormModal from '../FormModal';
import MarathonStore from '../../stores/MarathonStore';
import Validator from '../../utils/Validator';

const METHODS_TO_BIND = [
  'handleNewGroupSubmit',
  'onMarathonStoreGroupCreateSuccess',
  'onMarathonStoreGroupCreateError',
  'resetState'
];

const buttonDefinition = [
  {
    text: 'Cancel',
    className: 'button button-medium',
    isClose: true
  },
  {
    text: 'Create Group',
    className: 'button button-success button-medium',
    isSubmit: true
  }
];

class ServiceGroupFormModal extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      disableNewGroup: false,
      errorMsg: null
    };

    this.store_listeners = [
      {
        name: 'marathon',
        events: ['groupCreateSuccess', 'groupCreateError']
      }
    ];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  resetState() {
    this.setState({
      disableNewGroup: false,
      errorMsg: null
    });
  }

  onMarathonStoreGroupCreateSuccess() {
    this.resetState();
    this.props.onClose();
  }

  onMarathonStoreGroupCreateError(errorMsg) {
    this.setState({
      disableNewGroup: false,
      errorMsg
    });
  }

  handleNewGroupSubmit(model) {
    let {parentGroupId} = this.props;

    this.setState({disableNewGroup: true});
    MarathonStore.createGroup(Object.assign({}, model,
      {id: `${parentGroupId}/${model.id}`})
    );
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

  getNewGroupFormDefinition() {
    return [
      {
        fieldType: 'text',
        name: 'id',
        placeholder: 'Group name',
        required: true,
        showLabel: false,
        writeType: 'input',
        validation: function (value) {
          return Validator.hasNoWhitespaces(value) &&
            Validator.hasValidServiceIdChars(value) &&
            Validator.isWellFormedServiceIdPath(value);
        },
        validationErrorText: 'Group name must be at least 1 character and ' +
          'may only contain digits (0-9), dashes (-), dots (.), ' +
          'and lowercase letters (a-z). The name may not begin or end ' +
          'with a dash.'
      }
    ];
  }

  render() {
    let {props, state} = this;

    return (
      <FormModal
        ref="form"
        buttonDefinition={buttonDefinition}
        disabled={state.disableNewGroup}
        onClose={props.onClose}
        onSubmit={this.handleNewGroupSubmit}
        onChange={this.resetState}
        open={props.open}
        definition={this.getNewGroupFormDefinition()}>
        <h2 className="modal-header-title text-align-center flush-top">
          Create Group
        </h2>
        <p className="text-align-center flush-top">
          {'Enter a path for the new group under '}
          <span className="emphasize">{props.parentGroupId}</span>
        </p>
        {this.getErrorMessage()}
      </FormModal>
    );
  }
}

ServiceGroupFormModal.propTypes = {
  parentGroupId: React.PropTypes.string
};

module.exports = ServiceGroupFormModal;
