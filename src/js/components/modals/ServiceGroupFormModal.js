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
    this.setState({disableNewGroup: true});
    MarathonStore.createGroup(model);
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
    let {parentGroupId} = this.props;
    if (!parentGroupId.endsWith('/')) {
      parentGroupId = `${parentGroupId}/`;
    }

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
          'with a dash.',
        value: parentGroupId
      }
    ];
  }

  render() {
    return (
      <FormModal
        ref="form"
        disabled={this.state.disableNewGroup}
        onClose={this.props.onClose}
        onSubmit={this.handleNewGroupSubmit}
        onChange={this.resetState}
        open={this.props.open}
        definition={this.getNewGroupFormDefinition()}>
        <h2 className="modal-header-title text-align-center flush-top">
          Create New Group
        </h2>
        {this.getErrorMessage()}
      </FormModal>
    );
  }
}

ServiceGroupFormModal.propTypes = {
  parentGroupId: React.PropTypes.string
};

module.exports = ServiceGroupFormModal;
