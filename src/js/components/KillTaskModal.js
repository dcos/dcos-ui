import {Confirm} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import MarathonStore from '../stores/MarathonStore';
import StringUtil from '../utils/StringUtil';

const METHODS_TO_BIND = [
  'handleButtonConfirm'
];

const ACTION_DISPLAY_NAMES = {
  kill: 'Kill',
  killAndScale: 'Kill and Scale'
};

class KillTaskModal extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {name: 'marathon', events: ['taskKillSuccess'], suppressUpdate: true}
    ];

    this.state = {
      pendingRequest: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleButtonConfirm() {
    let {action, selectedItems} = this.props;
    MarathonStore.killTasks(selectedItems, action === 'killAndScale');
    this.setState({pendingRequest: true});
  }

  onMarathonStoreTaskKillSuccess() {
    this.setState({pendingRequest: false});
    this.props.onClose();
    this.props.onSuccess();
  }

  getModalContents() {
    let selectedItemsLength = this.props.selectedItems.length;
    let action = ACTION_DISPLAY_NAMES[this.props.action] || '';
    let taskCountContent = `${selectedItemsLength} ${StringUtil.pluralize('Task', selectedItemsLength)}`;

    return (
      <div className="container container-pod container-pod-short-top
        text-align-center">
        <h2 className="text-danger text-align-center flush-top">
          {action} {StringUtil.pluralize('Task', selectedItemsLength)}
        </h2>
        <p className="flush-bottom">
          You are about to {action.toLowerCase()} {taskCountContent}.
          <br />
          Are you sure you want to continue?
        </p>
      </div>
    );
  }

  render() {
    let {action, onClose, open} = this.props;

    return (
      <Confirm
        closeByBackdropClick={true}
        disabled={this.state.pendingRequest}
        open={open}
        onClose={onClose}
        leftButtonText="Close"
        leftButtonCallback={onClose}
        rightButtonText={ACTION_DISPLAY_NAMES[action]}
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.handleButtonConfirm}>
        {this.getModalContents()}
      </Confirm>
    );
  }

}

KillTaskModal.defaultProps = {
  onSuccess: function () {}
};

KillTaskModal.propTypes = {
  action: React.PropTypes.string,
  onClose: React.PropTypes.func.isRequired,
  onSuccess: React.PropTypes.func,
  open: React.PropTypes.bool.isRequired,
  selectedItems: React.PropTypes.array.isRequired
};

module.exports = KillTaskModal;
