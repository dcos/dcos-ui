import {Confirm} from 'reactjs-components';
import React, {PropTypes} from 'react';
import PureRender from 'react-addons-pure-render-mixin';

import AppLockedMessage from './AppLockedMessage';
import ModalHeading from '../../../../../../src/js/components/modals/ModalHeading';
import Pod from '../../structs/Pod';
import Service from '../../structs/Service';
import ServiceTree from '../../structs/ServiceTree';

class ServiceSuspendModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      errorMsg: null
    };

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

  componentWillReceiveProps(nextProps) {
    let {errors} = nextProps;
    if (!errors) {
      this.setState({errorMsg: null});

      return;
    }

    let {message: errorMsg = '', details} = errors;
    let hasDetails = details && details.length !== 0;

    if (hasDetails) {
      errorMsg = details.reduce(function (memo, error) {
        return `${memo} ${error.errors.join(' ')}`;
      }, '');
    }

    if (!errorMsg || !errorMsg.length) {
      errorMsg = null;
    }

    this.setState({errorMsg});
  }

  shouldForceUpdate() {
    return this.state.errorMsg && /force=true/.test(this.state.errorMsg);
  }

  getErrorMessage() {
    let {errorMsg} = this.state;

    if (!errorMsg) {
      return null;
    }

    if (this.shouldForceUpdate()) {
      return <AppLockedMessage />;
    }

    return (
      <p className="text-danger flush-top">{errorMsg}</p>
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

    let heading = (
      <ModalHeading>
        Suspend {itemText}
      </ModalHeading>
    );

    return (
      <Confirm
        disabled={isPending}
        header={heading}
        open={open}
        onClose={onClose}
        leftButtonCallback={onClose}
        rightButtonText={`Suspend ${itemText}`}
        rightButtonCallback={() => suspendItem(this.shouldForceUpdate())}
        showHeader={true}>
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
  errors: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string
  ]),
  isPending: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Service)
  ]).isRequired
};

module.exports = ServiceSuspendModal;
