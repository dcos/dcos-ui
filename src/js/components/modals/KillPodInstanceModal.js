import {Confirm} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import MarathonStore from '../../stores/MarathonStore';
import Pod from '../../structs/Pod';
import StringUtil from '../../utils/StringUtil';

const METHODS_TO_BIND = [
  'handleButtonConfirm'
];

const ACTION_DISPLAY_NAMES = {
  kill: 'Kill',
  killAndScale: 'Kill and Scale'
};

class KillPodInstanceModal extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: 'marathon',
        events: ['podInstanceKillSuccess', 'podInstanceKillError'],
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

  shouldForceAction(message = this.state.errorMsg) {
    return message && /force=true/.test(message);
  }

  handleButtonConfirm() {
    let {pod, selectedItems} = this.props;
    let killIDs = selectedItems.map(function (item) {
      return item.id;
    });

    MarathonStore.killPodInstances(
      pod,
      killIDs,
      this.shouldForceAction()
    );
    this.setState({pendingRequest: true});
  }

  onMarathonStorePodInstanceKillSuccess() {
    this.setState({pendingRequest: false});
    this.props.onClose();
    this.props.onSuccess();
  }

  onMarathonStorePodInstanceKillError(errorMsg) {
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

    if (this.shouldForceAction(errorMsg)) {
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
    let instanceCountContent = `${selectedItemsLength} ${StringUtil.pluralize('Instance', selectedItemsLength)}`;

    return (
      <div className={'container container-pod container-pod-short-top text-align-center flush-bottom'}>
        <h2 className="text-danger text-align-center flush-top">
          {action} {StringUtil.pluralize('Instance', selectedItemsLength)}
        </h2>
        <p>
          You are about to {action.toLowerCase()} {instanceCountContent}.
          <br />
          Are you sure you want to continue?
        </p>
        {this.getErrorMessage()}
      </div>
    );
  }

  render() {
    let {action, onClose, open} = this.props;
    let buttonText = ACTION_DISPLAY_NAMES[action];

    if (this.shouldForceAction()) {
      buttonText = 'Force ' + buttonText;
    }

    return (
      <Confirm
        closeByBackdropClick={true}
        disabled={this.state.pendingRequest}
        open={open}
        onClose={onClose}
        leftButtonText="Close"
        leftButtonCallback={onClose}
        rightButtonText={buttonText}
        rightButtonClassName="button button-danger"
        rightButtonCallback={this.handleButtonConfirm}>
        {this.getModalContents()}
      </Confirm>
    );
  }

}

KillPodInstanceModal.defaultProps = {
  onSuccess() {}
};

KillPodInstanceModal.propTypes = {
  action: React.PropTypes.string,
  onClose: React.PropTypes.func.isRequired,
  onSuccess: React.PropTypes.func,
  open: React.PropTypes.bool.isRequired,
  pod: React.PropTypes.instanceOf(Pod),
  selectedItems: React.PropTypes.array.isRequired
};

module.exports = KillPodInstanceModal;
