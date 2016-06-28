import {Confirm} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

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
    ];

    this.state = {
      pendingRequest: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleButtonConfirm() {
    /* eslint-disable */
    let {action, selectedItems} = this.props;
    selectedItems.forEach(function (task) {
      /* eslint-enable */
      // TODO: Do some kind of task action here. Coming up.
    });

    this.setState({pendingRequest: true});
  }

  onSecretsStoreDeleteSecretSuccess() {
    this.setState({pendingRequest: false});
    this.props.onClose();
    this.props.onSuccess();
  }

  getContentHeader(selectedItems, selectedItemsLength) {
    let {action} = this.props;
    let headerContent = ` ${selectedItemsLength} Tasks`;
    if (selectedItemsLength === 1) {
      headerContent = ` ${selectedItems[0].id}`
    }

    return (
      <h2 className="flush-top text-align-center" key="confirmHeader">
        {`Are you sure you want to ${ACTION_DISPLAY_NAMES[action]} ${headerContent}?`}
      </h2>
    );
  }

  getConfirmTextBody(selectedItems, selectedItemsLength) {
    let {action} = this.props;
    let secretText;

    if (selectedItemsLength === 1) {
      secretText = selectedItems[0].id;
    } else {
      secretText = 'these tasks';
    }

    return (
      <span key="confirmText">
        You are about to {ACTION_DISPLAY_NAMES[action]} {secretText}.
      </span>
    );
  }

  getModalContents() {
    let {selectedItems} = this.props;
    let selectedItemsLength = selectedItems.length;

    return (
      <div className="container container-pod container-pod-short-top
        text-align-center">
        {this.getContentHeader(selectedItems, selectedItemsLength)}
        {this.getConfirmTextBody(selectedItems, selectedItemsLength)}
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
