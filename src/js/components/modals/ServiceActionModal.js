import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import {StoreMixin} from 'mesosphere-shared-reactjs';

import Service from '../../structs/Service';
import ServiceTree from '../../structs/ServiceTree';

const METHODS_TO_BIND = [
  'closeDialog',
  'handleCloseClick',
  'handleConfirmClick',
  'onError'
];

/**
 * This class is meant to be extended by Service confirmation
 * modals, like scale and destroy.
 */
class ServiceActionModal extends mixin(StoreMixin) {
  constructor() {
    super();

    this.state = {
      disabled: false,
      errorMsg: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  onError({message:errorMsg}) {
    this.setState({
      disabled: false,
      errorMsg
    });
  }

  handleCloseClick() {
    this.closeDialog();
  }

  handleConfirmClick() {
    this.setState({disabled: true});
  }

  closeDialog() {
    this.setState({disabled: false});
    this.props.onClose();
  }

  shouldForceUpdate(message = this.state.errorMsg) {
    return message && /force=true/.test(message);
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
}

ServiceActionModal.contextTypes = {
  router: React.PropTypes.func
};

ServiceActionModal.defaultProps = {
  onSuccess: function () {}
};

ServiceActionModal.propTypes = {
  onClose: React.PropTypes.func.isRequired,
  onSuccess: React.PropTypes.func,
  open: React.PropTypes.bool.isRequired,
  service: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(Service),
    React.PropTypes.instanceOf(ServiceTree)
  ])
};

module.exports = ServiceActionModal;
