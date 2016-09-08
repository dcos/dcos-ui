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
      {
        name: 'marathon',
        events: ['taskKillSuccess', 'taskKillError'],
        suppressUpdate: true
      }
    ];

    this.state = {
      pendingRequest: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.open !== nextProps.open) {
      this.setState({
        errorMsg: null
      });
    }
  }

  shouldForceUpdate(message = this.state.errorMsg) {
    return message && /force=true/.test(message);
  }

  handleButtonConfirm() {
    let {action, selectedItems} = this.props;
    MarathonStore.killTasks(
        selectedItems,
        action === 'killAndScale',
        this.shouldForceUpdate(this.state.errorMsg)
    );
    this.setState({pendingRequest: true});
  }

  onMarathonStoreTaskKillSuccess() {
    this.setState({pendingRequest: false});
    this.props.onClose();
    this.props.onSuccess();
  }

  onMarathonStoreTaskKillError(errorMsg) {
    this.setState({
      pendingRequest: false,
      errorMsg
    });
  }

  getErrorMessage() {
    let {errorMsg} = this.state;

    if (!errorMsg) {
      return null;
    }

    if (this.shouldForceUpdate(errorMsg)) {
      return (
          <h4 className="text-align-center text-danger flush-top">
            App is currently locked by one or more deployments. Press the button
            again to forcefully change and deploy the new configuration.
          </h4>
      );
    }

    return (
        <p className="text-danger flush-top">{errorMsg}</p>
    );
  }

  getModalContents() {
    let selectedItemsLength = this.props.selectedItems.length;
    let action = ACTION_DISPLAY_NAMES[this.props.action] || '';
    let taskCountContent = `${selectedItemsLength} ${StringUtil.pluralize('Task', selectedItemsLength)}`;

    return (
      <div className={'container container-pod container-pod-short-top ' +
        'text-align-center flush-bottom'}>
        <h2 className="text-danger text-align-center flush-top">
          {action} {StringUtil.pluralize('Task', selectedItemsLength)}
        </h2>
        <p>
          You are about to {action.toLowerCase()} {taskCountContent}.
          <br />
          Are you sure you want to continue?
        </p>
        {this.getErrorMessage()}
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
  onSuccess() {}
};

KillTaskModal.propTypes = {
  action: React.PropTypes.string,
  onClose: React.PropTypes.func.isRequired,
  onSuccess: React.PropTypes.func,
  open: React.PropTypes.bool.isRequired,
  selectedItems: React.PropTypes.array.isRequired
};

module.exports = KillTaskModal;
