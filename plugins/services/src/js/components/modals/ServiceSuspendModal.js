import {Confirm} from 'reactjs-components';
import React, {PropTypes} from 'react';
import PureRender from 'react-addons-pure-render-mixin';

import AppLockedMessage from './AppLockedMessage';
import Pod from '../../structs/Pod';
import Service from '../../structs/Service';
import ServiceTree from '../../structs/ServiceTree';

class ServiceSuspendModal extends React.Component {
  constructor() {
    super(...arguments);

    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
  }

  componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending
      && !nextProps.isPending;

    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.props.onClose();
    }
  }

  shouldForceUpdate() {
    return this.props.errors && /force=true/.test(this.props.errors);
  }

  getErrorMessage() {
    let {errors} = this.props;

    if (!errors) {
      return null;
    }

    if (this.shouldForceUpdate()) {
      return <AppLockedMessage />;
    }

    return (
      <p className="text-danger flush-top">{errors}</p>
    );
  }

  render() {
    const {
      isPending,
      onClose,
      open,
      service,
      suspendItem
    } = this.props;

    let itemText = 'Service';
    let serviceName = '';

    if (service instanceof Pod) {
      itemText = 'Pod';
    }

    if (service instanceof ServiceTree) {
      itemText = 'Group';
    }

    if (service) {
      serviceName = service.getId();
    }

    return (
      <Confirm
        disabled={isPending}
        open={open}
        onClose={onClose}
        leftButtonCallback={onClose}
        rightButtonText={`Suspend ${itemText}`}
        rightButtonCallback={() => suspendItem(this.shouldForceUpdate())}>
        <h2 className="text-align-center flush-top">
          Suspend {itemText}
        </h2>
        <p>
          Are you sure you want to suspend <span className="emphasize">{serviceName}</span> by scaling to 0 instances?
        </p>
        {this.getErrorMessage()}
      </Confirm>
    );
  }
}

ServiceSuspendModal.propTypes = {
  suspendItem: PropTypes.func.isRequired,
  errors: PropTypes.string,
  isPending: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Service)
  ]).isRequired
};

module.exports = ServiceSuspendModal;
